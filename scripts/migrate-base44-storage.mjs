// Migração pontual: arquivos hospedados no Base44 (base44.app) -> Supabase
// Storage, antes do sistema antigo ser desligado.
//
// O que faz:
//  1. anamnese_fotos.url que comece com "https://base44.app/" -> baixa e
//     sobe pro bucket "anamnese-fotos" em {owner_id}/{anamnese_id}/{nome
//     original do arquivo}, depois troca a coluna `url` pelo path (sem
//     domínio) — o front vai gerar signed URL a partir desse path.
//  2. anamneses.assinatura_paciente_url / assinatura_profissional_url que
//     comecem com "https://base44.app/" -> baixa e sobe pro bucket
//     "assinaturas" em {owner_id}/{anamnese_id}/paciente.png ou
//     profissional.png, e troca a coluna pelo path.
//
// Idempotente: uma vez migrada, a linha deixa de bater no filtro
// "começa com https://base44.app/", então rodar de novo só processa o que
// ainda falta (útil se o script cair no meio ou algum download falhar).
//
// Requer a service role key do Supabase (bypassa RLS de propósito, pra
// conseguir escrever em linhas de owners diferentes numa migração única).
// NUNCA fica salva em arquivo: vem de env var ou é pedida no terminal.
//
// Como rodar (na raiz do projeto, com as dependências de package.json
// instaladas):
//
//   node --env-file=.env scripts/migrate-base44-storage.mjs
//
// (--env-file=.env só carrega VITE_SUPABASE_URL do .env existente; a
// service role key é pedida interativamente, ou pode ser exportada antes
// como SUPABASE_SERVICE_ROLE_KEY se preferir automatizar.)

import { createClient } from '@supabase/supabase-js'
import readline from 'node:readline'

const BASE44_PREFIXO = 'https://base44.app/'
const TIMEOUT_MS = 45_000
const CONCORRENCIA = 4

function promptOculto(pergunta) {
  return new Promise((resolve) => {
    const stdin = process.stdin
    process.stdout.write(pergunta)

    if (!stdin.isTTY) {
      // Sem TTY (ex: input via pipe): cai pro readline normal, visível.
      const rl = readline.createInterface({ input: stdin, output: process.stdout })
      rl.question('', (resposta) => {
        rl.close()
        resolve(resposta.trim())
      })
      return
    }

    let valor = ''
    stdin.setRawMode(true)
    stdin.resume()
    stdin.setEncoding('utf8')

    const onData = (char) => {
      char = char.toString()
      const codigo = char.charCodeAt(0)
      const enter = codigo === 13 || codigo === 10
      const ctrlC = codigo === 3
      const ctrlD = codigo === 4
      const backspace = codigo === 127 || codigo === 8
      if (enter || ctrlD) {
        stdin.setRawMode(false)
        stdin.pause()
        stdin.removeListener('data', onData)
        process.stdout.write('\n')
        resolve(valor.trim())
      } else if (ctrlC) {
        process.stdout.write('\n')
        process.exit(1)
      } else if (backspace) {
        valor = valor.slice(0, -1)
      } else {
        valor += char
      }
    }
    stdin.on('data', onData)
  })
}

function nomeArquivoDaUrl(url) {
  try {
    const pathname = new URL(url).pathname
    const ultimoSegmento = decodeURIComponent(pathname.split('/').filter(Boolean).pop() || '')
    return ultimoSegmento || `arquivo-${Date.now()}`
  } catch {
    return `arquivo-${Date.now()}`
  }
}

function sanitizarNomeArquivo(nome) {
  const limpo = nome.replace(/[^\w.\-() ]/g, '_').trim()
  return limpo || `arquivo-${Date.now()}`
}

function categorizarErro(err) {
  if (err?.name === 'AbortError') return 'timeout'
  return err?.message || String(err)
}

async function baixarArquivo(url) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS)
  try {
    const res = await fetch(url, { redirect: 'follow', signal: controller.signal })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const contentType = res.headers.get('content-type') || 'application/octet-stream'
    const buffer = Buffer.from(await res.arrayBuffer())
    return { buffer, contentType }
  } finally {
    clearTimeout(timeout)
  }
}

async function processarComConcorrencia(itens, limite, worker) {
  const fila = [...itens]
  const executores = new Array(Math.min(limite, itens.length) || 0).fill(null).map(async () => {
    while (fila.length) {
      const item = fila.shift()
      await worker(item)
    }
  })
  await Promise.all(executores)
}

async function buscarTudo(admin, tabela, colunas, coluna, prefixo) {
  const rows = []
  const pageSize = 500
  let from = 0
  while (true) {
    const { data, error } = await admin
      .from(tabela)
      .select(colunas)
      .like(coluna, `${prefixo}%`)
      .range(from, from + pageSize - 1)
    if (error) throw error
    rows.push(...data)
    if (data.length < pageSize) break
    from += pageSize
  }
  return rows
}

function calcularCaminhosFotos(fotos) {
  const usados = new Map()
  const paraProcessar = []
  const colisoes = []
  for (const foto of fotos) {
    const nomeArquivo = sanitizarNomeArquivo(nomeArquivoDaUrl(foto.url))
    const path = `${foto.owner_id}/${foto.anamnese_id}/${nomeArquivo}`
    if (usados.has(path)) {
      colisoes.push({
        tipo: 'foto',
        id: foto.id,
        url: foto.url,
        motivo: `nome de arquivo duplicado dentro da mesma anamnese (path "${path}" já usado pela linha ${usados.get(path)}) — renomeie manualmente antes de migrar, upload automático foi pulado pra não sobrescrever a outra foto`,
      })
    } else {
      usados.set(path, foto.id)
      paraProcessar.push({ ...foto, _path: path })
    }
  }
  return { paraProcessar, colisoes }
}

async function migrarFoto(admin, foto, resumo) {
  try {
    const { buffer, contentType } = await baixarArquivo(foto.url)
    const { error: uploadError } = await admin.storage
      .from('anamnese-fotos')
      .upload(foto._path, buffer, { contentType, upsert: true })
    if (uploadError) throw new Error(`upload: ${uploadError.message}`)

    const { error: updateError } = await admin
      .from('anamnese_fotos')
      .update({ url: foto._path })
      .eq('id', foto.id)
    if (updateError) throw new Error(`update no banco: ${updateError.message}`)

    resumo.sucesso.push({ tipo: 'foto', id: foto.id, path: foto._path })
    console.log(`OK    foto ${foto.id} -> anamnese-fotos/${foto._path}`)
  } catch (err) {
    const motivo = categorizarErro(err)
    resumo.falha.push({ tipo: 'foto', id: foto.id, url: foto.url, motivo })
    console.log(`FALHA foto ${foto.id}: ${motivo}`)
  }
}

async function migrarAssinatura(admin, anamnese, coluna, resumo) {
  const url = anamnese[coluna]
  const nomeArquivo = coluna === 'assinatura_paciente_url' ? 'paciente.png' : 'profissional.png'
  const path = `${anamnese.owner_id}/${anamnese.id}/${nomeArquivo}`
  try {
    const { buffer, contentType } = await baixarArquivo(url)
    const { error: uploadError } = await admin.storage
      .from('assinaturas')
      .upload(path, buffer, {
        contentType: contentType.startsWith('image/') ? contentType : 'image/png',
        upsert: true,
      })
    if (uploadError) throw new Error(`upload: ${uploadError.message}`)

    const { error: updateError } = await admin
      .from('anamneses')
      .update({ [coluna]: path })
      .eq('id', anamnese.id)
    if (updateError) throw new Error(`update no banco: ${updateError.message}`)

    resumo.sucesso.push({ tipo: 'assinatura', id: anamnese.id, coluna, path })
    console.log(`OK    assinatura ${anamnese.id} (${coluna}) -> assinaturas/${path}`)
  } catch (err) {
    const motivo = categorizarErro(err)
    resumo.falha.push({ tipo: 'assinatura', id: anamnese.id, coluna, url, motivo })
    console.log(`FALHA assinatura ${anamnese.id} (${coluna}): ${motivo}`)
  }
}

function imprimirResumo(resumo) {
  console.log('\n===== RESUMO DA MIGRAÇÃO BASE44 -> SUPABASE STORAGE =====')
  console.log(`Sucesso: ${resumo.sucesso.length}`)
  console.log(`Falhas:  ${resumo.falha.length}`)
  if (resumo.falha.length) {
    console.log('\nDetalhe das falhas:')
    for (const f of resumo.falha) {
      const coluna = f.coluna ? ` coluna=${f.coluna}` : ''
      console.log(`- [${f.tipo}] id=${f.id}${coluna}\n    url: ${f.url}\n    motivo: ${f.motivo}`)
    }
  }
  console.log(
    '\nPróximo passo (manual): abra 2-3 dessas fotos/assinaturas migradas na\n' +
      'interface do Podify (via createSignedUrl) e confirme visualmente que\n' +
      'carregam certo antes de considerar a migração concluída.',
  )
}

async function main() {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
  if (!supabaseUrl) {
    console.error('SUPABASE_URL (ou VITE_SUPABASE_URL) não encontrada no ambiente.')
    process.exit(1)
  }

  let serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceRoleKey) {
    serviceRoleKey = await promptOculto(
      'Cole a SUPABASE_SERVICE_ROLE_KEY (Project Settings > API > service_role; não fica salva em disco): ',
    )
  }
  if (!serviceRoleKey) {
    console.error('Service role key é obrigatória pra rodar essa migração.')
    process.exit(1)
  }

  const admin = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } })
  const resumo = { sucesso: [], falha: [] }

  console.log('Buscando fotos hospedadas no Base44 (anamnese_fotos)...')
  const fotosBrutas = await buscarTudo(
    admin,
    'anamnese_fotos',
    'id, owner_id, anamnese_id, url',
    'url',
    BASE44_PREFIXO,
  )
  console.log(`${fotosBrutas.length} foto(s) encontrada(s).`)

  const { paraProcessar: fotos, colisoes } = calcularCaminhosFotos(fotosBrutas)
  resumo.falha.push(...colisoes)
  await processarComConcorrencia(fotos, CONCORRENCIA, (foto) => migrarFoto(admin, foto, resumo))

  console.log('\nBuscando assinaturas hospedadas no Base44 (anamneses)...')
  const [porPaciente, porProfissional] = await Promise.all([
    buscarTudo(
      admin,
      'anamneses',
      'id, owner_id, assinatura_paciente_url, assinatura_profissional_url',
      'assinatura_paciente_url',
      BASE44_PREFIXO,
    ),
    buscarTudo(
      admin,
      'anamneses',
      'id, owner_id, assinatura_paciente_url, assinatura_profissional_url',
      'assinatura_profissional_url',
      BASE44_PREFIXO,
    ),
  ])

  const tarefasAssinatura = []
  for (const anamnese of porPaciente) {
    tarefasAssinatura.push({ anamnese, coluna: 'assinatura_paciente_url' })
  }
  for (const anamnese of porProfissional) {
    tarefasAssinatura.push({ anamnese, coluna: 'assinatura_profissional_url' })
  }
  console.log(`${tarefasAssinatura.length} assinatura(s) encontrada(s).`)

  await processarComConcorrencia(tarefasAssinatura, CONCORRENCIA, (t) =>
    migrarAssinatura(admin, t.anamnese, t.coluna, resumo),
  )

  imprimirResumo(resumo)
  process.exit(resumo.falha.length > 0 ? 1 : 0)
}

main().catch((err) => {
  console.error('Erro fatal na migração:', err)
  process.exit(1)
})
