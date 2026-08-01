import { useEffect, useRef, useState } from 'react'
import { Camera, Upload, Send } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { toastError } from '@/store/toastStore'

interface Mensagem {
  role: 'user' | 'assistant'
  conteudo: string
  imagem_url?: string | null
}

const SUGESTOES = [
  'O que é onicocriptose?',
  'Como cuidar do pé diabético?',
  'Quais são os tipos de calos?',
  'Como tratar fasciíte plantar?',
]

export default function LiaPodologa() {
  const user = useAuthStore((s) => s.user)
  const [mensagens, setMensagens] = useState<Mensagem[]>([])
  const [input, setInput] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [conversaId, setConversaId] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [mensagens])

  async function garantirConversa(): Promise<string | null> {
    if (conversaId) return conversaId
    const { data, error } = await supabase
      .from('lia_conversas')
      .insert({ owner_id: user!.id, titulo: 'Conversa com a LIA' })
      .select()
      .single()
    if (error || !data) {
      toastError(`Não foi possível iniciar a conversa com a LIA: ${error?.message ?? 'erro desconhecido'}`)
      return null
    }
    setConversaId(data.id)
    return data.id
  }

  async function enviarMensagem(texto: string, imagemUrl?: string) {
    if (!texto.trim() && !imagemUrl) return
    setEnviando(true)

    const novaMsg: Mensagem = { role: 'user', conteudo: texto, imagem_url: imagemUrl }
    setMensagens((prev) => [...prev, novaMsg])
    setInput('')

    const convId = await garantirConversa()
    if (!convId) {
      setEnviando(false)
      return
    }

    const { error: msgError } = await supabase.from('lia_mensagens').insert({
      owner_id: user!.id,
      conversa_id: convId,
      role: 'user',
      conteudo: texto,
      imagem_url: imagemUrl ?? null,
    })
    if (msgError) toastError(`Sua mensagem não foi salva no histórico: ${msgError.message}`)

    // Chama a Edge Function "lia-chat" (ver supabase/functions/lia-chat)
    // Ela encaminha pra Claude API com contexto de especialista em podologia.
    const { data, error } = await supabase.functions.invoke('lia-chat', {
      body: {
        mensagem: texto,
        imagem_url: imagemUrl,
        historico: mensagens.slice(-10),
      },
    })

    const resposta = error
      ? 'Não consegui responder agora. Verifique se a Edge Function "lia-chat" está publicada e configurada com a chave da Claude API.'
      : data?.resposta ?? '...'

    setMensagens((prev) => [...prev, { role: 'assistant', conteudo: resposta }])
    const { error: respError } = await supabase.from('lia_mensagens').insert({
      owner_id: user!.id,
      conversa_id: convId,
      role: 'assistant',
      conteudo: resposta,
    })
    if (respError) toastError(`A resposta da LIA não foi salva no histórico: ${respError.message}`)

    setEnviando(false)
  }

  async function handleUpload(file: File) {
    const path = `${user!.id}/${Date.now()}-${file.name}`
    const { error } = await supabase.storage.from('lia-fotos').upload(path, file)
    if (error) {
      toastError(`Falha ao enviar a foto: ${error.message}`)
      return
    }
    const { data } = supabase.storage.from('lia-fotos').getPublicUrl(path)
    enviarMensagem('Foto enviada para análise', data.publicUrl)
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col lg:h-[calc(100vh-4rem)]">
      <div className="mb-4 flex items-center gap-4 rounded-2xl bg-gradient-to-br from-brand-600 to-brand-300 p-5 text-white">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 text-xl font-bold">
          LIA
        </div>
        <div>
          <h1 className="font-bold">LIA Podóloga</h1>
          <p className="text-sm text-white/85">Especialista em podologia — tire suas dúvidas</p>
        </div>
      </div>

      <div ref={scrollRef} className="card flex-1 space-y-4 overflow-y-auto p-5">
        {mensagens.length === 0 && (
          <div className="flex flex-col items-center py-10 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand-100 text-2xl font-bold text-brand-600">
              LIA
            </div>
            <h2 className="font-bold text-ink-900">Olá, sou a LIA</h2>
            <p className="mx-auto mt-2 max-w-sm text-sm text-slate-500">
              Sou especialista em podologia e estou aqui para tirar suas dúvidas. Você pode me
              enviar fotos dos pés para análise ou fazer qualquer pergunta sobre cuidados
              podológicos.
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              {SUGESTOES.map((s) => (
                <button
                  key={s}
                  onClick={() => enviarMensagem(s)}
                  className="rounded-full border border-brand-200 px-4 py-2 text-sm text-brand-700 hover:bg-brand-50"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {mensagens.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                m.role === 'user' ? 'bg-ink-900 text-white' : 'bg-brand-50 text-ink-900'
              }`}
            >
              {m.imagem_url && (
                <img src={m.imagem_url} alt="Foto enviada" className="mb-2 rounded-lg" />
              )}
              {m.conteudo}
            </div>
          </div>
        ))}

        {enviando && <p className="text-sm text-slate-400">LIA está digitando...</p>}
      </div>

      <div className="mt-4 flex items-center gap-2">
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
        />
        <button
          onClick={() => fileRef.current?.click()}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 hover:bg-brand-100"
        >
          <Camera size={18} />
        </button>
        <button
          onClick={() => fileRef.current?.click()}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 hover:bg-brand-100"
        >
          <Upload size={18} />
        </button>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && enviarMensagem(input)}
          placeholder="Pergunte à LIA ou envie uma foto do pé..."
          className="input-field flex-1"
        />
        <button
          onClick={() => enviarMensagem(input)}
          disabled={enviando}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-500 text-white hover:bg-brand-600 disabled:opacity-50"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  )
}
