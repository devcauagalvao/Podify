import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Save, FileDown, Camera, Upload, Check } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { toastError, toastSuccess } from '@/store/toastStore'
import { useDirtyBeforeUnload } from '@/hooks/useDirtyBeforeUnload'
import { useSavedFlash } from '@/hooks/useSavedFlash'
import { SignaturePad } from '@/components/SignaturePad'
import { PhotoLightbox } from '@/components/PhotoLightbox'
import { Skeleton, SkeletonSection } from '@/components/Skeleton'
import { Section, Field, TextInput, SelectInput, SimNao, CheckPill, BirthDateInput } from './fields'
import { mascaraTelefone, mascaraCep, mascaraIdade, mascaraNumeroCalcado } from '@/lib/mascaras'
import { FieldError, inputErrorClass } from '@/components/FieldError'
import type { AnamnesePdfData } from './AnamnesePdfDocument'
import type { Cliente } from '@/types/database'

const CONDICOES_CLINICAS = [
  'Osteoporose', 'Cardiopatia', 'Marca Passo', 'Hipotensão', 'Hipertireoidismo',
  'Hipotireoidismo', 'Hipertensão', 'Alterações Vasculares', 'Renal', 'Neuropatia',
  'Reumatismo', 'Epilepsia', 'Hepatite', 'Hanseníase', 'Quimio/Radioterapia',
  'Antec. Oncológicos', 'Cirurgia MMII',
]

const CONDICOES_PELE = [
  'Bromidrose', 'Hiperidrose', 'Desidrose', 'Isquemia', 'Lesões Plantares', 'Edema',
  'Tinea', 'Psoríase', 'Tungíase', 'Fissuras', 'Verruga Plantar', 'Calos e Calosidades',
  'Erisipela',
]

const FORMATOS_UNHA = ['A=Normal', 'B=Involuta', 'C=Telha', 'D=Funil', 'E=Gancho', 'F=Torquês', 'G=Caracol', 'H=Cunha']
const OPCOES_FORMATO_UNHA = FORMATOS_UNHA.map((f) => f.replace('=', ' - '))

const AUTOSAVE_INTERVAL_MS = 15000

type Obj = Record<string, any>

function useJson(initial: Obj, onDirty: () => void) {
  const [v, setV] = useState<Obj>(initial)
  const set = (key: string, value: any) => {
    onDirty()
    setV((prev) => ({ ...prev, [key]: value }))
  }
  return [v, set, setV] as const
}

function slugify(s: string) {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase()
}

export default function AnamneseForm() {
  const { id } = useParams()
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const profile = useAuthStore((s) => s.profile)

  const { dirtyRef, markDirty, markClean, confirmDiscard } = useDirtyBeforeUnload()
  const { justSaved, flashThen } = useSavedFlash()

  // id estável desde o início — permite subir fotos/assinaturas pro Storage
  // e fazer autosave mesmo antes do primeiro "Salvar Ficha".
  const [anamneseId] = useState(() => id ?? crypto.randomUUID())
  const isEditingInitially = useRef(Boolean(id))
  const savedFotoPathsRef = useRef<Set<string>>(new Set())

  const [clientes, setClientes] = useState<Cliente[]>([])
  const [clienteId, setClienteId] = useState(params.get('cliente') ?? '')
  const [data, setData] = useState(new Date().toISOString().slice(0, 10))
  const [erros, setErros] = useState<{ clienteId?: string; data?: string }>({})
  const [saving, setSaving] = useState(false)
  const [autosaving, setAutosaving] = useState(false)
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null)
  const [exporting, setExporting] = useState(false)
  const [carregandoFicha, setCarregandoFicha] = useState(Boolean(id))

  const [dadosPessoais, setDP, setDPAll] = useJson({}, markDirty)
  const [dadosGerais, setDG, setDGAll] = useJson({}, markDirty)
  const [dadosClinicos, setDC, setDCAll] = useJson({ condicoes: [] as string[] }, markDirty)
  const [alteracoesLesoes, setAL, setALAll] = useJson(
    { dedosDireito: {} as Obj, dedosEsquerdo: {} as Obj },
    markDirty,
  )
  const [formatoUnhas, setFU, setFUAll] = useJson({}, markDirty)
  const [alteracoesPele, setAP, setAPAll] = useJson({ condicoes: [] as string[] }, markDirty)

  const [procedimentos, setProcedimentosState] = useState('')
  const [observacoes, setObservacoesState] = useState('')
  const [orientacao, setOrientacaoState] = useState('')
  const [dataRetorno, setDataRetornoState] = useState('')
  const [autorizacaoImagem, setAutorizacaoImagemState] = useState(false)
  // Colunas do banco guardam só o path no Storage (buckets privados); as
  // signed URLs abaixo são geradas sob demanda e nunca persistidas.
  const [assinaturaClientePath, setAssinaturaClientePath] = useState<string | null>(null)
  const [assinaturaClienteSignedUrl, setAssinaturaClienteSignedUrl] = useState<string | null>(null)
  const [assinaturaProfissionalPath, setAssinaturaProfissionalPath] = useState<string | null>(null)
  const [assinaturaProfissionalSignedUrl, setAssinaturaProfissionalSignedUrl] = useState<string | null>(null)
  const [fotoPaths, setFotoPaths] = useState<string[]>([])
  const [fotoSignedUrls, setFotoSignedUrls] = useState<Record<string, string>>({})
  const [fotoAberta, setFotoAberta] = useState<string | null>(null)

  function setClienteIdDirty(v: string) {
    markDirty()
    setClienteId(v)
    setErros((prev) => ({ ...prev, clienteId: undefined }))
  }
  function setDataDirty(v: string) {
    markDirty()
    setData(v)
    setErros((prev) => ({ ...prev, data: undefined }))
  }
  function setProcedimentos(v: string) {
    markDirty()
    setProcedimentosState(v)
  }
  function setObservacoes(v: string) {
    markDirty()
    setObservacoesState(v)
  }
  function setOrientacao(v: string) {
    markDirty()
    setOrientacaoState(v)
  }
  function setDataRetorno(v: string) {
    markDirty()
    setDataRetornoState(v)
  }
  function setAutorizacaoImagem(v: boolean) {
    markDirty()
    setAutorizacaoImagemState(v)
  }

  useEffect(() => {
    supabase
      .from('clientes')
      .select('*')
      .is('deleted_at', null)
      .order('nome')
      .then(({ data, error }) => {
        if (error) {
          toastError(`Não foi possível carregar a lista de clientes: ${error.message}`)
          return
        }
        setClientes(data ?? [])
      })
  }, [])

  useEffect(() => {
    if (!isEditingInitially.current) return

    supabase
      .from('anamneses')
      .select('*')
      .eq('id', anamneseId)
      .is('deleted_at', null)
      .single()
      .then(({ data: f, error }) => {
        if (error) {
          toastError(`Não foi possível carregar a ficha: ${error.message}`)
          setCarregandoFicha(false)
          return
        }
        if (!f) {
          setCarregandoFicha(false)
          return
        }
        setClienteId(f.cliente_id)
        setData(f.data)
        setDPAll(f.dados_pessoais as Obj)
        setDGAll(f.dados_gerais as Obj)
        setDCAll(f.dados_clinicos as Obj)
        setALAll(f.alteracoes_lesoes as Obj)
        setFUAll(f.formato_unhas as Obj)
        setAPAll(f.alteracoes_pele as Obj)
        setProcedimentosState(f.procedimentos_realizados ?? '')
        setObservacoesState(f.observacoes_clinicas ?? '')
        setOrientacaoState(f.orientacao ?? '')
        setDataRetornoState(f.data_retorno ?? '')
        setAutorizacaoImagemState(f.autorizacao_uso_imagem)
        setAssinaturaClientePath(f.assinatura_paciente_url)
        setAssinaturaProfissionalPath(f.assinatura_profissional_url)
        setCarregandoFicha(false)
      })

    supabase
      .from('anamnese_fotos')
      .select('url')
      .eq('anamnese_id', anamneseId)
      .then(({ data: rows, error }) => {
        if (error) {
          toastError(`Não foi possível carregar as fotos da ficha: ${error.message}`)
          return
        }
        const paths = (rows ?? []).map((r) => r.url)
        paths.forEach((p) => savedFotoPathsRef.current.add(p))
        setFotoPaths(paths)
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [anamneseId])

  // Gera as signed URLs sob demanda pra exibição — nunca persistidas, e
  // regeneradas sempre que aparece um path novo (foto recém-enviada ou
  // ficha carregada). Expiram em 1h.
  useEffect(() => {
    const faltantes = fotoPaths.filter((p) => !fotoSignedUrls[p])
    if (faltantes.length === 0) return
    supabase.storage
      .from('anamnese-fotos')
      .createSignedUrls(faltantes, 3600)
      .then(({ data, error }) => {
        if (error) {
          toastError(`Não foi possível gerar os links das fotos: ${error.message}`)
          return
        }
        setFotoSignedUrls((prev) => {
          const next = { ...prev }
          for (const item of data ?? []) {
            if (item.signedUrl && item.path) next[item.path] = item.signedUrl
          }
          return next
        })
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fotoPaths])

  useEffect(() => {
    if (!assinaturaClientePath) {
      setAssinaturaClienteSignedUrl(null)
      return
    }
    supabase.storage
      .from('assinaturas')
      .createSignedUrl(assinaturaClientePath, 3600)
      .then(({ data, error }) => {
        if (error) {
          toastError(`Não foi possível gerar o link da assinatura do cliente: ${error.message}`)
          return
        }
        setAssinaturaClienteSignedUrl(data.signedUrl)
      })
  }, [assinaturaClientePath])

  useEffect(() => {
    if (!assinaturaProfissionalPath) {
      setAssinaturaProfissionalSignedUrl(null)
      return
    }
    supabase.storage
      .from('assinaturas')
      .createSignedUrl(assinaturaProfissionalPath, 3600)
      .then(({ data, error }) => {
        if (error) {
          toastError(`Não foi possível gerar o link da assinatura do profissional: ${error.message}`)
          return
        }
        setAssinaturaProfissionalSignedUrl(data.signedUrl)
      })
  }, [assinaturaProfissionalPath])

  function toggleCondicao(setter: typeof setDC, atual: Obj, item: string) {
    const lista: string[] = atual.condicoes ?? []
    const nova = lista.includes(item) ? lista.filter((c) => c !== item) : [...lista, item]
    setter('condicoes', nova)
  }

  function toggleDedo(lado: 'dedosDireito' | 'dedosEsquerdo', campo: string) {
    const atual = alteracoesLesoes[lado] ?? {}
    setAL(lado, { ...atual, [campo]: !atual[campo] })
  }

  async function handleUploadFoto(file: File) {
    const path = `${user!.id}/${Date.now()}-${file.name}`
    const { error } = await supabase.storage.from('anamnese-fotos').upload(path, file)
    if (error) {
      toastError(`Falha ao enviar foto: ${error.message}`)
      return
    }
    markDirty()
    setFotoPaths((prev) => [...prev, path])
  }

  async function salvarFicha(opts: { statusFinal: 'em_andamento' | 'finalizada'; silent: boolean }) {
    if (!clienteId || !data) {
      if (!opts.silent) {
        setErros({
          clienteId: clienteId ? undefined : 'Este campo é obrigatório.',
          data: data ? undefined : 'Este campo é obrigatório.',
        })
        toastError('Selecione o cliente antes de salvar.')
      }
      return false
    }

    if (opts.silent) setAutosaving(true)
    else setSaving(true)

    const payload = {
      id: anamneseId,
      owner_id: user!.id,
      cliente_id: clienteId,
      data,
      status: opts.statusFinal,
      dados_pessoais: dadosPessoais,
      dados_gerais: dadosGerais,
      dados_clinicos: dadosClinicos,
      alteracoes_lesoes: alteracoesLesoes,
      formato_unhas: formatoUnhas,
      alteracoes_pele: alteracoesPele,
      procedimentos_realizados: procedimentos || null,
      observacoes_clinicas: observacoes || null,
      orientacao: orientacao || null,
      data_retorno: dataRetorno || null,
      autorizacao_uso_imagem: autorizacaoImagem,
      assinatura_paciente_url: assinaturaClientePath,
      assinatura_profissional_url: assinaturaProfissionalPath,
    }

    const { error } = await supabase.from('anamneses').upsert(payload)

    if (error) {
      const msg = opts.silent
        ? `Autosave falhou — suas últimas alterações podem não estar salvas: ${error.message}`
        : `Não foi possível salvar a ficha: ${error.message}`
      toastError(msg)
      setSaving(false)
      setAutosaving(false)
      return false
    }

    const novasFotos = fotoPaths.filter((path) => !savedFotoPathsRef.current.has(path))
    if (novasFotos.length > 0) {
      const { error: fotosError } = await supabase.from('anamnese_fotos').insert(
        novasFotos.map((path) => ({ owner_id: user!.id, anamnese_id: anamneseId, url: path })),
      )
      if (fotosError) {
        toastError(`Ficha salva, mas houve erro ao registrar as fotos: ${fotosError.message}`)
      } else {
        novasFotos.forEach((path) => savedFotoPathsRef.current.add(path))
      }
    }

    markClean()
    setLastSavedAt(new Date())
    setSaving(false)
    setAutosaving(false)

    if (!isEditingInitially.current) {
      isEditingInitially.current = true
      navigate(`/anamnese/${anamneseId}`, { replace: true })
    }

    return true
  }

  // refs "espelho" pra evitar closures desatualizadas no timer do autosave
  const salvarFichaRef = useRef(salvarFicha)
  useEffect(() => {
    salvarFichaRef.current = salvarFicha
  })
  const clienteIdRef = useRef(clienteId)
  useEffect(() => {
    clienteIdRef.current = clienteId
  }, [clienteId])

  useEffect(() => {
    const timer = setInterval(() => {
      if (dirtyRef.current && clienteIdRef.current) {
        salvarFichaRef.current({ statusFinal: 'em_andamento', silent: true })
      }
    }, AUTOSAVE_INTERVAL_MS)
    return () => clearInterval(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function salvar() {
    if (!assinaturaClientePath || !assinaturaProfissionalPath) {
      toastError('É necessário coletar as duas assinaturas antes de finalizar a ficha.')
      return
    }
    const ok = await salvarFicha({ statusFinal: 'finalizada', silent: false })
    if (ok) {
      toastSuccess('Ficha salva com sucesso!')
      flashThen(() => navigate('/anamnese'))
    }
  }

  function voltar() {
    if (!confirmDiscard()) return
    navigate('/anamnese')
  }

  async function exportarPdf() {
    const cliente = clientes.find((c) => c.id === clienteId)
    if (!cliente) {
      toastError('Selecione o cliente antes de exportar o PDF.')
      return
    }
    setExporting(true)
    try {
      const docData: AnamnesePdfData = {
        nomeClinica: profile?.nome_clinica ?? null,
        logoUrl: profile?.avatar_url ?? null,
        nomeCliente: cliente.nome,
        nomeProfissional: profile?.nome_completo ?? null,
        data,
        dadosPessoais,
        dadosGerais,
        dadosClinicos,
        alteracoesLesoes,
        formatoUnhas,
        alteracoesPele,
        procedimentos,
        observacoes,
        orientacao,
        dataRetorno,
        autorizacaoImagem,
        // react-pdf precisa de uma URL de verdade pra buscar a imagem, então
        // usa as signed URLs já geradas pra tela (não os paths salvos no banco).
        assinaturaCliente: assinaturaClienteSignedUrl,
        assinaturaProfissional: assinaturaProfissionalSignedUrl,
        fotos: fotoPaths.map((p) => fotoSignedUrls[p]).filter((url): url is string => Boolean(url)),
      }
      const [{ pdf }, { AnamnesePdfDocument }] = await Promise.all([
        import('@react-pdf/renderer'),
        import('./AnamnesePdfDocument'),
      ])
      const blob = await pdf(<AnamnesePdfDocument d={docData} />).toBlob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `anamnese-${slugify(cliente.nome)}-${data}.pdf`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch (e) {
      toastError(`Erro ao gerar o PDF: ${e instanceof Error ? e.message : 'erro desconhecido'}`)
    } finally {
      setExporting(false)
    }
  }

  if (carregandoFicha) {
    return (
      <div className="space-y-6 pb-10">
        <div className="flex items-center gap-3">
          <button onClick={voltar} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg hover:bg-slate-100">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-extrabold text-ink-900">Ficha de Anamnese</h1>
            <p className="text-sm text-slate-500">Carregando ficha...</p>
          </div>
        </div>
        <SkeletonSection fields={2} />
        <SkeletonSection fields={9} />
        <SkeletonSection fields={10} />
        <SkeletonSection fields={4} />
        <div className="card space-y-3 p-5">
          <Skeleton className="h-3 w-40" />
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button onClick={voltar} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg hover:bg-slate-100">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-extrabold text-ink-900">Ficha de Anamnese</h1>
            <p className="text-sm text-slate-500">{id ? 'Editando ficha' : 'Nova ficha'}</p>
          </div>
        </div>
        <div className="flex w-full flex-col items-end gap-1.5 sm:w-auto sm:flex-row sm:items-center sm:gap-3">
          {(autosaving || lastSavedAt) && (
            <span className="text-xs text-slate-400">
              {autosaving
                ? 'Salvando automaticamente...'
                : lastSavedAt &&
                  `Salvo automaticamente às ${lastSavedAt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`}
            </span>
          )}
          <button onClick={salvar} disabled={saving} className="btn-brand flex items-center justify-center gap-2 whitespace-nowrap">
            {justSaved ? <Check size={16} /> : <Save size={16} />}{' '}
            {justSaved ? 'Salvo!' : saving ? 'Salvando...' : 'Salvar Ficha'}
          </button>
        </div>
      </div>

      <Section title="IDENTIFICAÇÃO">
        <Field label="Cliente *">
          <select
            value={clienteId}
            onChange={(e) => setClienteIdDirty(e.target.value)}
            className={inputErrorClass(erros.clienteId)}
          >
            <option value="">Selecione</option>
            {clientes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </select>
          <FieldError>{erros.clienteId}</FieldError>
        </Field>
        <Field label="Data *">
          <TextInput type="date" value={data} onChange={setDataDirty} error={erros.data} />
        </Field>
      </Section>

      <Section title="DADOS PESSOAIS">
        <Field label="Data de Nascimento">
          <BirthDateInput value={dadosPessoais.dataNascimento ?? ''} onChange={(v) => setDP('dataNascimento', v)} />
        </Field>
        <Field label="Idade">
          <TextInput value={dadosPessoais.idade ?? ''} onChange={(v) => setDP('idade', mascaraIdade(v))} placeholder="Anos" />
        </Field>
        <Field label="Gênero">
          <SelectInput value={dadosPessoais.genero ?? ''} onChange={(v) => setDP('genero', v)} options={['Feminino', 'Masculino', 'Outro']} />
        </Field>
        <Field label="Profissão">
          <TextInput value={dadosPessoais.profissao ?? ''} onChange={(v) => setDP('profissao', v)} />
        </Field>
        <Field label="Estado Civil">
          <SelectInput
            value={dadosPessoais.estadoCivil ?? ''}
            onChange={(v) => setDP('estadoCivil', v)}
            options={['Solteiro(a)', 'Casado(a)', 'Divorciado(a)', 'Viúvo(a)', 'União Estável']}
          />
        </Field>
        <Field label="Celular">
          <TextInput value={dadosPessoais.celular ?? ''} onChange={(v) => setDP('celular', mascaraTelefone(v))} placeholder="(00) 00000-0000" />
        </Field>
        <Field label="Endereço" full>
          <TextInput value={dadosPessoais.endereco ?? ''} onChange={(v) => setDP('endereco', v)} placeholder="Rua, número, Bairro, Cidade - UF" />
        </Field>
        <Field label="CEP">
          <TextInput value={dadosPessoais.cep ?? ''} onChange={(v) => setDP('cep', mascaraCep(v))} placeholder="00000-000" />
        </Field>
      </Section>

      <Section title="DADOS GERAIS">
        <Field label="Queixa Principal" full>
          <TextInput value={dadosGerais.queixaPrincipal ?? ''} onChange={(v) => setDG('queixaPrincipal', v)} placeholder="Descreva a queixa principal" />
        </Field>
        <Field label="Costuma ir ao Podólogo?">
          <SimNao value={dadosGerais.costumaPodologo ?? ''} onChange={(v) => setDG('costumaPodologo', v)} />
        </Field>
        <Field label="Frequência ao Podólogo">
          <TextInput value={dadosGerais.frequenciaPodologo ?? ''} onChange={(v) => setDG('frequenciaPodologo', v)} placeholder="Ex: mensalmente" />
        </Field>
        <Field label="Medicamentos em uso">
          <TextInput value={dadosGerais.medicamentosUso ?? ''} onChange={(v) => setDG('medicamentosUso', v)} placeholder="Nome dos medicamentos" />
        </Field>
        <Field label="Posição de Trabalho">
          <SelectInput value={dadosGerais.posicaoTrabalho ?? ''} onChange={(v) => setDG('posicaoTrabalho', v)} options={['Em pé', 'Sentado', 'Alternado']} />
        </Field>
        <Field label="Duração (horas)">
          <TextInput value={dadosGerais.duracaoHoras ?? ''} onChange={(v) => setDG('duracaoHoras', v)} placeholder="Ex: 8h" />
        </Field>
        <Field label="Maior Parte do Tempo">
          <SelectInput value={dadosGerais.maiorParteTempo ?? ''} onChange={(v) => setDG('maiorParteTempo', v)} options={['Em pé', 'Sentado', 'Caminhando']} />
        </Field>
        <Field label="Nº do Calçado">
          <TextInput value={dadosGerais.numeroCalcado ?? ''} onChange={(v) => setDG('numeroCalcado', mascaraNumeroCalcado(v))} placeholder="Ex: 38" />
        </Field>
        <Field label="Tipo de Calçado Diário">
          <TextInput value={dadosGerais.tipoCalcadoDiario ?? ''} onChange={(v) => setDG('tipoCalcadoDiario', v)} />
        </Field>
        <Field label="Alérgico(a)?">
          <SimNao value={dadosGerais.alergico ?? ''} onChange={(v) => setDG('alergico', v)} />
        </Field>
        {dadosGerais.alergico === 'Sim' && (
          <Field label="Substâncias Alérgicas" animate>
            <TextInput value={dadosGerais.substanciasAlergicas ?? ''} onChange={(v) => setDG('substanciasAlergicas', v)} />
          </Field>
        )}
        <Field label="Usa Palmilha?">
          <SimNao value={dadosGerais.usaPalmilha ?? ''} onChange={(v) => setDG('usaPalmilha', v)} />
        </Field>
        <Field label="Tipo de Palmilha">
          <SelectInput value={dadosGerais.tipoPalmilha ?? ''} onChange={(v) => setDG('tipoPalmilha', v)} options={['Rígida', 'Semirrígida', 'Macia']} />
        </Field>
        <Field label="Fumante?">
          <SimNao value={dadosGerais.fumante ?? ''} onChange={(v) => setDG('fumante', v)} />
        </Field>
        <Field label="Ciclo Menstrual Regular?">
          <SimNao value={dadosGerais.cicloMenstrual ?? ''} onChange={(v) => setDG('cicloMenstrual', v)} />
        </Field>
        <Field label="Última Menstruação (DUM)">
          <TextInput type="date" value={dadosGerais.dum ?? ''} onChange={(v) => setDG('dum', v)} />
        </Field>
        <Field label="Gestante?">
          <SimNao value={dadosGerais.gestante ?? ''} onChange={(v) => setDG('gestante', v)} />
        </Field>
        <Field label="Amamentando?">
          <SimNao value={dadosGerais.amamentando ?? ''} onChange={(v) => setDG('amamentando', v)} />
        </Field>
        <Field label="Pratica Atividade Física?">
          <SimNao value={dadosGerais.praticaAtividade ?? ''} onChange={(v) => setDG('praticaAtividade', v)} />
        </Field>
        {dadosGerais.praticaAtividade === 'Sim' && (
          <>
            <Field label="Frequência" animate>
              <TextInput value={dadosGerais.frequenciaAtividade ?? ''} onChange={(v) => setDG('frequenciaAtividade', v)} />
            </Field>
            <Field label="Esporte e tipo de calçado" animate>
              <TextInput value={dadosGerais.esporteTipoCalcado ?? ''} onChange={(v) => setDG('esporteTipoCalcado', v)} />
            </Field>
          </>
        )}
      </Section>

      <Section title="DADOS CLÍNICOS">
        <Field label="Condições" full>
          <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
            {CONDICOES_CLINICAS.map((c) => (
              <CheckPill
                key={c}
                label={c}
                checked={(dadosClinicos.condicoes ?? []).includes(c)}
                onToggle={() => toggleCondicao(setDC, dadosClinicos, c)}
              />
            ))}
          </div>
        </Field>
        <Field label="Sinal de Godet">
          <SelectInput value={dadosClinicos.sinalGodet ?? ''} onChange={(v) => setDC('sinalGodet', v)} options={['Ausente', 'Presente +', 'Presente ++', 'Presente +++']} />
        </Field>
        <Field label="Pressão Arterial">
          <TextInput value={dadosClinicos.pressaoArterial ?? ''} onChange={(v) => setDC('pressaoArterial', v)} placeholder="Ex: 120/80" />
        </Field>
        <Field label="Diabetes?">
          <SimNao value={dadosClinicos.diabetes ?? ''} onChange={(v) => setDC('diabetes', v)} />
        </Field>
        <Field label="Pré-Diabetes?">
          <SimNao value={dadosClinicos.preDiabetes ?? ''} onChange={(v) => setDC('preDiabetes', v)} />
        </Field>
        {(dadosClinicos.diabetes === 'Sim' || dadosClinicos.preDiabetes === 'Sim') && (
          <>
            <Field label="Taxa Glicêmica" animate>
              <TextInput value={dadosClinicos.taxaGlicemica ?? ''} onChange={(v) => setDC('taxaGlicemica', v)} />
            </Field>
            <Field label="Medicamento p/ Diabetes?" animate>
              <SimNao value={dadosClinicos.medicamentoDiabetes ?? ''} onChange={(v) => setDC('medicamentoDiabetes', v)} />
            </Field>
            <Field label="Tipo de medicamento" animate>
              <SelectInput value={dadosClinicos.tipoMedicamento ?? ''} onChange={(v) => setDC('tipoMedicamento', v)} options={['Injetável', 'Via Oral']} />
            </Field>
            <Field label="Data da Última Verificação Glicêmica" animate>
              <TextInput type="date" value={dadosClinicos.dataUltimaVerificacao ?? ''} onChange={(v) => setDC('dataUltimaVerificacao', v)} />
            </Field>
          </>
        )}
        <Field label="Dieta Hídrica?">
          <SimNao value={dadosClinicos.dietaHidrica ?? ''} onChange={(v) => setDC('dietaHidrica', v)} />
        </Field>
        <Field label="Dieta Alimentar">
          <TextInput value={dadosClinicos.dietaAlimentar ?? ''} onChange={(v) => setDC('dietaAlimentar', v)} />
        </Field>
      </Section>

      <Section title="ALTERAÇÕES E LESÕES DOS PÉS">
        <Field label="Tipo de Pisada">
          <SelectInput value={alteracoesLesoes.tipoPisada ?? ''} onChange={(v) => setAL('tipoPisada', v)} options={['Neutra', 'Pronada', 'Supinada']} />
        </Field>
        <Field label="Tipo de Marcha">
          <SelectInput value={alteracoesLesoes.tipoMarcha ?? ''} onChange={(v) => setAL('tipoMarcha', v)} options={['Normal', 'Patológica']} />
        </Field>
        {alteracoesLesoes.tipoMarcha === 'Patológica' && (
          <Field label="Marcha Patológica — Qual?" animate>
            <TextInput value={alteracoesLesoes.marchaPatologica ?? ''} onChange={(v) => setAL('marchaPatologica', v)} />
          </Field>
        )}
        <Field label="Joelho">
          <SelectInput value={alteracoesLesoes.joelho ?? ''} onChange={(v) => setAL('joelho', v)} options={['Normal', 'Varo', 'Valgo']} />
        </Field>
        <Field label="Dedos — Direito" full>
          <div className="flex flex-wrap gap-4 rounded-xl bg-slate-50 p-3">
            {['Garra', 'Martelo', 'Malho'].map((d) => (
              <label key={d} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={!!alteracoesLesoes.dedosDireito?.[d]}
                  onChange={() => toggleDedo('dedosDireito', d)}
                />
                {d}
              </label>
            ))}
          </div>
        </Field>
        <Field label="Dedos — Esquerdo" full>
          <div className="flex flex-wrap gap-4 rounded-xl bg-slate-50 p-3">
            {['Garra', 'Martelo', 'Malho'].map((d) => (
              <label key={d} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={!!alteracoesLesoes.dedosEsquerdo?.[d]}
                  onChange={() => toggleDedo('dedosEsquerdo', d)}
                />
                {d}
              </label>
            ))}
          </div>
        </Field>
      </Section>

      <Section title={`FORMATO DAS UNHAS (${FORMATOS_UNHA.join(' ')})`}>
        {['pdHalux', 'pd2', 'pd3', 'pd4', 'pd5', 'peHalux', 'pe2', 'pe3', 'pe4', 'pe5'].map((k, i) => (
          <Field key={k} label={`${k.startsWith('pd') ? 'PD' : 'PE'} ${i % 5 === 0 ? 'Hálux' : (i % 5) + 1 + 'º'}`}>
            <SelectInput value={formatoUnhas[k] ?? ''} onChange={(v) => setFU(k, v)} options={OPCOES_FORMATO_UNHA} />
          </Field>
        ))}
        <Field label="Outras Alterações da Lâmina Ungueal" full>
          <TextInput value={formatoUnhas.outrasAlteracoes ?? ''} onChange={(v) => setFU('outrasAlteracoes', v)} />
        </Field>
      </Section>

      <Section title="ALTERAÇÕES, LESÕES E AVALIAÇÃO DA PELE">
        <Field label="Condições" full>
          <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
            {CONDICOES_PELE.map((c) => (
              <CheckPill
                key={c}
                label={c}
                checked={(alteracoesPele.condicoes ?? []).includes(c)}
                onToggle={() => toggleCondicao(setAP, alteracoesPele, c)}
              />
            ))}
          </div>
        </Field>
        <Field label="Perfusão Capilar — PD">
          <SelectInput value={alteracoesPele.perfusaoPD ?? ''} onChange={(v) => setAP('perfusaoPD', v)} options={['Normal', 'Alterada']} />
        </Field>
        <Field label="Perfusão Capilar — PE">
          <SelectInput value={alteracoesPele.perfusaoPE ?? ''} onChange={(v) => setAP('perfusaoPE', v)} options={['Normal', 'Alterada']} />
        </Field>
        <Field label="Tempo (seg)">
          <TextInput value={alteracoesPele.tempoSeg ?? ''} onChange={(v) => setAP('tempoSeg', v)} />
        </Field>
        <Field label="Turgor Cutâneo">
          <SelectInput value={alteracoesPele.turgorCutaneo ?? ''} onChange={(v) => setAP('turgorCutaneo', v)} options={['Normal', 'Diminuído']} />
        </Field>
        <Field label="Diapasão D">
          <SelectInput value={alteracoesPele.diapasaoD ?? ''} onChange={(v) => setAP('diapasaoD', v)} options={['Presente', 'Ausente']} />
        </Field>
        <Field label="Diapasão E">
          <SelectInput value={alteracoesPele.diapasaoE ?? ''} onChange={(v) => setAP('diapasaoE', v)} options={['Presente', 'Ausente']} />
        </Field>
        <Field label="Pulso Dorsal — PD">
          <SelectInput value={alteracoesPele.pulsoPD ?? ''} onChange={(v) => setAP('pulsoPD', v)} options={['Presente', 'Ausente']} />
        </Field>
        <Field label="Pulso Dorsal — PE">
          <SelectInput value={alteracoesPele.pulsoPE ?? ''} onChange={(v) => setAP('pulsoPE', v)} options={['Presente', 'Ausente']} />
        </Field>
        <Field label="Monofilamento">
          <TextInput value={alteracoesPele.monofilamento ?? ''} onChange={(v) => setAP('monofilamento', v)} />
        </Field>
        <Field label="Análise da Pele">
          <TextInput value={alteracoesPele.analisePele ?? ''} onChange={(v) => setAP('analisePele', v)} />
        </Field>
        <Field label="Outras Alterações">
          <TextInput value={alteracoesPele.outrasAlteracoesPele ?? ''} onChange={(v) => setAP('outrasAlteracoesPele', v)} />
        </Field>
      </Section>

      {/* FOTOS DO ATENDIMENTO */}
      <div className="card overflow-hidden">
        <div className="bg-gradient-to-r from-brand-600 to-brand-300 px-5 py-2.5">
          <p className="text-xs font-bold tracking-wide text-white">FOTOS DO ATENDIMENTO</p>
        </div>
        <div className="p-5">
          {fotoPaths.length === 0 ? (
            <div className="mb-3 rounded-xl border border-dashed border-slate-300 py-8 text-center text-sm text-slate-400">
              Nenhuma foto adicionada
            </div>
          ) : (
            <div className="mb-3 grid grid-cols-3 gap-2 sm:grid-cols-5">
              {fotoPaths.map((path) =>
                fotoSignedUrls[path] ? (
                  <button
                    key={path}
                    type="button"
                    onClick={() => setFotoAberta(path)}
                    className="aspect-square overflow-hidden rounded-lg"
                    title="Ver foto"
                  >
                    <img
                      src={fotoSignedUrls[path]}
                      className="h-full w-full object-cover"
                      alt="Foto do atendimento"
                      loading="lazy"
                    />
                  </button>
                ) : (
                  <Skeleton key={path} className="aspect-square rounded-lg" />
                ),
              )}
            </div>
          )}
          <div className="flex gap-2">
            <label className="flex min-h-[44px] cursor-pointer items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm hover:bg-slate-50">
              <Camera size={16} /> Câmera
              <input type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => e.target.files?.[0] && handleUploadFoto(e.target.files[0])} />
            </label>
            <label className="flex min-h-[44px] cursor-pointer items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm hover:bg-slate-50">
              <Upload size={16} /> Galeria
              <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => Array.from(e.target.files ?? []).forEach(handleUploadFoto)} />
            </label>
          </div>
        </div>
      </div>

      {/* PROCEDIMENTOS E OBSERVAÇÕES */}
      <div className="card overflow-hidden">
        <div className="bg-gradient-to-r from-brand-600 to-brand-300 px-5 py-2.5">
          <p className="text-xs font-bold tracking-wide text-white">PROCEDIMENTOS E OBSERVAÇÕES</p>
        </div>
        <div className="space-y-4 p-5">
          <div>
            <label className="label-field">Procedimentos Realizados</label>
            <textarea className="input-field" rows={3} value={procedimentos} onChange={(e) => setProcedimentos(e.target.value)} placeholder="Descreva os procedimentos realizados..." />
          </div>
          <div>
            <label className="label-field">Observações Clínicas</label>
            <textarea className="input-field" rows={2} value={observacoes} onChange={(e) => setObservacoes(e.target.value)} placeholder="Observações adicionais..." />
          </div>
          <div>
            <label className="label-field">Orientação</label>
            <textarea className="input-field" rows={2} value={orientacao} onChange={(e) => setOrientacao(e.target.value)} placeholder="Oriente o cliente..." />
          </div>
          <div className="max-w-xs">
            <label className="label-field">Data de Retorno</label>
            <input type="date" className="input-field" value={dataRetorno} onChange={(e) => setDataRetorno(e.target.value)} />
          </div>
        </div>
      </div>

      {/* ASSINATURAS */}
      <div className="card overflow-hidden">
        <div className="bg-gradient-to-r from-brand-600 to-brand-300 px-5 py-2.5">
          <p className="text-xs font-bold tracking-wide text-white">ASSINATURAS</p>
        </div>
        <div className="grid grid-cols-1 gap-6 p-5 sm:grid-cols-2">
          <div>
            <p className="label-field">Assinatura do Cliente</p>
            {assinaturaClientePath ? (
              assinaturaClienteSignedUrl ? (
                <img src={assinaturaClienteSignedUrl} className="h-[120px] w-full rounded-xl border border-slate-200 object-contain" />
              ) : (
                <Skeleton className="h-[120px] w-full rounded-xl" />
              )
            ) : (
              <SignaturePad
                ownerId={user!.id}
                anamneseId={anamneseId}
                tipo="cliente"
                onSaved={(path) => {
                  markDirty()
                  setAssinaturaClientePath(path)
                }}
              />
            )}
          </div>
          <div>
            <p className="label-field">Assinatura do Profissional</p>
            {assinaturaProfissionalPath ? (
              assinaturaProfissionalSignedUrl ? (
                <img src={assinaturaProfissionalSignedUrl} className="h-[120px] w-full rounded-xl border border-slate-200 object-contain" />
              ) : (
                <Skeleton className="h-[120px] w-full rounded-xl" />
              )
            ) : (
              <SignaturePad
                ownerId={user!.id}
                anamneseId={anamneseId}
                tipo="profissional"
                onSaved={(path) => {
                  markDirty()
                  setAssinaturaProfissionalPath(path)
                }}
              />
            )}
          </div>
        </div>
        <div className="border-t border-slate-100 px-5 py-4">
          <label className="flex items-start gap-2 text-sm text-slate-600">
            <input type="checkbox" checked={autorizacaoImagem} onChange={(e) => setAutorizacaoImagem(e.target.checked)} className="mt-0.5" />
            <span>
              <strong>Autorização de uso de imagem:</strong> Autorizo o uso de imagem para fins
              publicitários, educacionais e outros fins relacionados à clínica de podologia, nos
              termos da legislação vigente.
            </span>
          </label>
        </div>
      </div>

      {/* FINALIZAR */}
      <div className="card flex flex-wrap items-center justify-between gap-3 p-5">
        <div>
          <p className="font-bold text-ink-900">Finalizar Ficha</p>
          <p className="text-sm text-slate-400">Salve ou exporte em PDF</p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          <button
            onClick={exportarPdf}
            disabled={exporting}
            className="flex min-h-[44px] items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium hover:bg-slate-50 disabled:opacity-50"
          >
            <FileDown size={16} /> {exporting ? 'Gerando PDF...' : 'Exportar PDF'}
          </button>
          <button onClick={salvar} disabled={saving} className="btn-brand flex items-center justify-center gap-2">
            {justSaved ? <Check size={16} /> : <Save size={16} />}{' '}
            {justSaved ? 'Salvo!' : saving ? 'Salvando...' : 'Salvar Ficha'}
          </button>
        </div>
      </div>

      {fotoAberta && fotoSignedUrls[fotoAberta] && (
        <PhotoLightbox
          url={fotoSignedUrls[fotoAberta]}
          filename={fotoAberta.split('/').pop() ?? 'foto.jpg'}
          onClose={() => setFotoAberta(null)}
        />
      )}
    </div>
  )
}
