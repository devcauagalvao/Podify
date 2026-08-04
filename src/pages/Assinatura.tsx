import { useEffect, useRef, useState } from 'react'
import {
  Check,
  Infinity as InfinityIcon,
  Lock,
  Loader2,
  Sparkles,
  ChevronDown,
  Copy,
  QrCode,
  CreditCard,
  CalendarClock,
  CalendarDays,
  ClipboardList,
  AlertTriangle,
  Mic,
  Star,
} from 'lucide-react'
import { FunctionsHttpError } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { toastError, toastSuccess } from '@/store/toastStore'
import { SUPPORT_WHATSAPP_URL, SUPPORT_EMAIL } from '@/lib/contact'
import { Modal } from '@/components/layout/Modal'
import {
  mascaraCpfCnpj,
  mascaraTelefone,
  mascaraCep,
  mascaraCartao,
  mascaraValidadeCartao,
  mascaraCvv,
} from '@/lib/mascaras'

const RECURSOS = [
  'Clientes ilimitados',
  'Fichas de anamnese completas',
  'Agenda completa',
  'Controle financeiro',
  'Controle de estoque',
  'LIA — IA Podóloga especialista',
  'Registro fotográfico dos atendimentos',
  'Assinatura digital nas fichas',
]

const FAQ = [
  {
    pergunta: 'Como funciona o cancelamento?',
    resposta:
      'Você pode cancelar quando quiser, direto pelo painel ou falando com o suporte. Não há multa nem fidelidade — o acesso continua até o fim do período já pago.',
  },
  {
    pergunta: 'Meus dados ficam salvos se eu cancelar?',
    resposta:
      'Sim. Seus clientes, fichas de anamnese, agenda e histórico financeiro continuam guardados com segurança. Se você assinar novamente, tudo estará exatamente como você deixou.',
  },
  {
    pergunta: 'Como funcionam os 7 dias grátis?',
    resposta:
      'Ao assinar, você tem 7 dias para testar todos os recursos do PODIFY Pro sem custo. Se decidir continuar, a cobrança mensal começa automaticamente depois desse período.',
  },
]

// assinatura_expira_em é timestamptz (vem como "2026-09-02T00:00:00+00:00",
// não um date puro "AAAA-MM-DD") — usa o parser nativo de Date em vez de um
// split ingênuo por "-", que quebraria com o "T" e o fuso horário no meio.
function formatDataBR(iso: string | null | undefined) {
  if (!iso) return null
  const data = new Date(iso)
  if (Number.isNaN(data.getTime())) return iso
  return data.toLocaleDateString('pt-BR', { timeZone: 'UTC' })
}

function formatBRL(valor: number | null | undefined) {
  if (valor == null) return '—'
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

const STATUS_FATURA: Record<string, { label: string; className: string }> = {
  CONFIRMED: { label: 'Pago', className: 'bg-emerald-100 text-emerald-700' },
  RECEIVED: { label: 'Pago', className: 'bg-emerald-100 text-emerald-700' },
  RECEIVED_IN_CASH: { label: 'Pago', className: 'bg-emerald-100 text-emerald-700' },
  PENDING: { label: 'Pendente', className: 'bg-amber-100 text-amber-700' },
  OVERDUE: { label: 'Vencida', className: 'bg-rose-100 text-rose-700' },
  REFUNDED: { label: 'Estornada', className: 'bg-slate-100 text-slate-600' },
  AWAITING_RISK_ANALYSIS: { label: 'Em análise', className: 'bg-amber-100 text-amber-700' },
}

const FORMA_PAGAMENTO_LABEL: Record<string, string> = {
  PIX: 'Pix',
  CREDIT_CARD: 'Cartão de crédito',
  BOLETO: 'Boleto',
}

// Não existe uma coluna dedicada de "início da assinatura" — usa a data de
// criação da conta como aproximação (na prática o usuário assina logo que
// cria a conta, então cobre a grande maioria dos casos).
function mesesDesde(iso: string | null | undefined): number {
  if (!iso) return 0
  const inicio = new Date(iso)
  if (Number.isNaN(inicio.getTime())) return 0
  const agora = new Date()
  let meses = (agora.getFullYear() - inicio.getFullYear()) * 12 + (agora.getMonth() - inicio.getMonth())
  if (agora.getDate() < inicio.getDate()) meses -= 1
  return Math.max(0, meses)
}

export default function Assinatura() {
  const profile = useAuthStore((s) => s.profile)
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [cancelarOpen, setCancelarOpen] = useState(false)
  const [totalAnamneses, setTotalAnamneses] = useState<number | null>(null)

  const ilimitado = profile?.plano === 'pro' && !profile?.assinatura_expira_em

  // Mesma condição de bloqueio do ProtectedRoute — usada aqui pra exibir o
  // aviso e também pra não tratar como "ativa" uma assinatura cuja data já
  // passou mas que o cron diário ainda não baixou pra 'expirado'.
  const trialVencido =
    profile?.plano === 'trial' && !!profile?.trial_expira_em && new Date(profile.trial_expira_em) < new Date()
  const assinaturaVencida =
    profile?.plano === 'expirado' ||
    trialVencido ||
    (!!profile?.assinatura_expira_em && new Date(profile.assinatura_expira_em) < new Date())

  const assinaturaAtivaPaga =
    profile?.plano === 'pro' &&
    !!profile?.assinatura_expira_em &&
    profile?.assinatura_status === 'ativa' &&
    !assinaturaVencida
  const planoAtivo = ilimitado || assinaturaAtivaPaga

  useEffect(() => {
    if (!planoAtivo) return
    supabase
      .from('anamneses')
      .select('id', { count: 'exact', head: true })
      .is('deleted_at', null)
      .then(({ count }) => setTotalAnamneses(count ?? 0))
  }, [planoAtivo])

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-ink-900">Assinatura</h1>
        <p className="text-sm text-slate-500">Gerencie seu plano PODIFY</p>
      </div>

      {assinaturaVencida && (
        <div className="flex items-start gap-3 rounded-xl bg-rose-50 p-4">
          <AlertTriangle size={20} className="mt-0.5 shrink-0 text-rose-500" />
          <p className="text-sm text-rose-700">
            {profile?.assinatura_expira_em
              ? `Sua assinatura venceu em ${formatDataBR(profile.assinatura_expira_em)}. Renove para continuar usando o Podify.`
              : profile?.trial_expira_em
                ? 'Seu período de teste terminou. Assine para continuar.'
                : 'Sua assinatura foi encerrada. Renove para continuar usando o Podify.'}
          </p>
        </div>
      )}

      {planoAtivo ? (
        <>
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-600 to-brand-300 p-6 text-white">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/20">
                  <Mic size={22} />
                </div>
                <div>
                  <p className="font-bold">PODIFY Pro</p>
                  <p className="text-sm text-white/85">{ilimitado ? 'Acesso ilimitado' : 'Assinatura ativa'}</p>
                </div>
              </div>
              <span className="rounded-full bg-white/25 px-3 py-1 text-xs font-bold">
                {ilimitado ? 'Ilimitado' : 'Ativa'}
              </span>
            </div>
            {ilimitado ? (
              <p className="mt-4 flex items-center gap-2 text-sm text-white/85">
                <InfinityIcon size={16} /> Acesso liberado pelo administrador — sem expiração
              </p>
            ) : (
              <p className="mt-4 flex items-center gap-2 text-sm text-white/85">
                <CalendarClock size={16} /> Próxima cobrança em {formatDataBR(profile?.assinatura_expira_em)}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="card flex items-center gap-3 p-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <CalendarDays size={18} />
              </div>
              <div className="min-w-0">
                <p className="text-xl font-extrabold leading-none text-ink-900">{mesesDesde(profile?.created_at)}</p>
                <p className="mt-1 text-xs text-slate-500">{mesesDesde(profile?.created_at) === 1 ? 'mês como assinante' : 'meses como assinante'}</p>
              </div>
            </div>
            <div className="card flex items-center gap-3 p-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <ClipboardList size={18} />
              </div>
              <div className="min-w-0">
                <p className="text-xl font-extrabold leading-none text-ink-900">{totalAnamneses ?? '—'}</p>
                <p className="mt-1 text-xs text-slate-500">{totalAnamneses === 1 ? 'ficha de anamnese realizada' : 'fichas de anamnese realizadas'}</p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <p className="mb-4 flex items-center gap-2 font-bold text-ink-900"><Star size={16} className="text-brand-500" /> O que está incluído</p>
            <div className="space-y-3">
              {RECURSOS.map((r) => (
                <div key={r} className="flex items-center gap-3 text-sm text-slate-600">
                  <Check size={16} className="shrink-0 text-emerald-500" /> {r}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl bg-emerald-50 p-5 text-sm text-emerald-800">
            <p className="font-semibold">{ilimitado ? 'Acesso ilimitado ativo' : 'Assinatura em dia'}</p>
            <p className="mt-1 text-emerald-700">
              {ilimitado
                ? 'Seu acesso foi liberado pelo administrador sem data de expiração. Aproveite todos os recursos!'
                : 'Seu pagamento está confirmado e a assinatura será renovada automaticamente. Aproveite todos os recursos!'}
            </p>
          </div>

          <HistoricoFaturas />

          {assinaturaAtivaPaga && (
            <button
              onClick={() => setCancelarOpen(true)}
              className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl border border-slate-200 text-sm font-medium text-rose-500 hover:bg-rose-50"
            >
              Cancelar assinatura
            </button>
          )}
        </>
      ) : (
        <>
          {/* Card de preço */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 to-brand-300 px-6 py-10 text-center text-white shadow-lg sm:px-10">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-4 py-1.5 text-xs font-bold tracking-wide backdrop-blur-sm">
              <Sparkles size={14} /> 7 DIAS GRÁTIS PARA TESTAR
            </span>

            <div className="mt-6 flex items-end justify-center gap-1.5">
              <span className="text-4xl font-extrabold leading-none sm:text-5xl">R$ 29,90</span>
              <span className="pb-1 text-base font-medium text-white/80">/mês</span>
            </div>
            <p className="mt-3 text-sm text-white/85">Cancele quando quiser, sem fidelidade</p>

            <button
              onClick={() => setCheckoutOpen(true)}
              className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-white py-4 text-base font-bold text-brand-700 shadow-md transition hover:bg-white/90 sm:mx-auto sm:w-auto sm:px-10"
            >
              Assinar agora
            </button>

            <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-white/75">
              <Lock size={12} /> Pagamento seguro via Pix ou cartão de crédito
            </p>
          </div>

          {/* Recursos incluídos */}
          <div className="card p-6 sm:p-8">
            <p className="mb-5 flex items-center gap-2 font-bold text-ink-900"><Star size={16} className="text-brand-500" /> O que está incluído</p>
            <div className="space-y-4">
              {RECURSOS.map((r) => (
                <div key={r} className="flex items-center gap-3 text-sm text-slate-700 sm:text-base">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100">
                    <Check size={14} className="text-emerald-600" />
                  </span>
                  {r}
                </div>
              ))}
            </div>
          </div>

          {/* Confiança + FAQ */}
          <div className="card p-6 sm:p-8">
            <div className="mb-5 flex items-center gap-2 text-sm font-semibold text-slate-500">
              <Lock size={16} className="text-brand-500" /> Pagamento seguro processado com criptografia de ponta a ponta
            </div>
            <p className="mb-2 font-bold text-ink-900">Perguntas frequentes</p>
            <div>
              {FAQ.map((f) => (
                <details key={f.pergunta} className="group border-b border-slate-100 py-4 last:border-0">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold text-ink-900 marker:hidden">
                    {f.pergunta}
                    <ChevronDown
                      size={16}
                      className="shrink-0 text-slate-400 transition-transform duration-200 group-open:rotate-180"
                    />
                  </summary>
                  <p className="mt-2 text-sm leading-relaxed text-slate-500">{f.resposta}</p>
                </details>
              ))}
            </div>

            <p className="mt-6 border-t border-slate-100 pt-5 text-center text-xs text-slate-400">
              Dúvidas sobre cobrança? Fale com a gente pelo{' '}
              <a href={SUPPORT_WHATSAPP_URL} target="_blank" rel="noreferrer" className="font-medium text-slate-500 hover:text-ink-900">
                WhatsApp
              </a>{' '}
              ou{' '}
              <a href={`mailto:${SUPPORT_EMAIL}`} className="font-medium text-slate-500 hover:text-ink-900">
                {SUPPORT_EMAIL}
              </a>
            </p>
          </div>
        </>
      )}

      {checkoutOpen && <CheckoutModal onClose={() => setCheckoutOpen(false)} />}
      {cancelarOpen && <CancelarAssinaturaModal onClose={() => setCancelarOpen(false)} />}
    </div>
  )
}

interface Fatura {
  id: string
  status: string
  valor: number
  vencimento: string
  pagoEm: string | null
  formaPagamento: string
  linkFatura: string | null
}

function HistoricoFaturas() {
  const [estado, setEstado] = useState<'carregando' | 'ok' | 'erro'>('carregando')
  const [faturas, setFaturas] = useState<Fatura[]>([])
  const [erro, setErro] = useState<string | null>(null)

  async function carregar() {
    setEstado('carregando')
    setErro(null)
    const { data, error } = await supabase.functions.invoke('asaas-faturas')

    if (error || !data?.ok) {
      let mensagem = 'Não foi possível carregar o histórico de faturas.'
      if (error instanceof FunctionsHttpError) {
        try {
          const corpo = await error.context.json()
          if (corpo?.error) mensagem = corpo.error
        } catch {
          // corpo não veio em JSON, mantém a mensagem genérica
        }
      } else if (data?.error) {
        mensagem = data.error
      }
      setErro(mensagem)
      setEstado('erro')
      return
    }

    setFaturas(data.faturas ?? [])
    setEstado('ok')
  }

  useEffect(() => {
    carregar()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (estado === 'carregando') {
    return (
      <div className="card flex items-center justify-center gap-2 p-6 text-sm text-slate-500">
        <Loader2 size={16} className="animate-spin" /> Carregando histórico de faturas...
      </div>
    )
  }

  if (estado === 'erro') {
    return (
      <div className="card space-y-3 p-6">
        <p className="text-sm text-rose-600">{erro}</p>
        <button onClick={carregar} className="text-sm font-semibold text-brand-600 hover:underline">
          Tentar novamente
        </button>
      </div>
    )
  }

  return (
    <div className="card p-6">
      <p className="mb-4 font-bold text-ink-900">Histórico de faturas</p>
      {faturas.length === 0 ? (
        <p className="text-sm text-slate-500">Nenhuma fatura ainda.</p>
      ) : (
        <div className="divide-y divide-slate-100">
          {faturas.map((f) => {
            const status = STATUS_FATURA[f.status] ?? { label: f.status, className: 'bg-slate-100 text-slate-600' }
            return (
              <div key={f.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                <div className="min-w-0">
                  <p className="font-medium text-ink-900">{formatDataBR(f.vencimento)}</p>
                  <p className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500">
                    <span className={`rounded-full px-2 py-0.5 font-semibold ${status.className}`}>{status.label}</span>
                    {FORMA_PAGAMENTO_LABEL[f.formaPagamento] ?? f.formaPagamento}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span className="font-semibold text-ink-900">{formatBRL(f.valor)}</span>
                  {f.linkFatura && (
                    <a
                      href={f.linkFatura}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-semibold text-brand-600 hover:underline"
                    >
                      Ver fatura
                    </a>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function CancelarAssinaturaModal({ onClose }: { onClose: () => void }) {
  const refreshProfile = useAuthStore((s) => s.refreshProfile)
  const [cancelando, setCancelando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  async function confirmar() {
    setCancelando(true)
    setErro(null)
    const { data, error } = await supabase.functions.invoke('asaas-cancel')

    if (error || !data?.ok) {
      let mensagem = 'Não foi possível cancelar a assinatura. Tente novamente.'
      if (error instanceof FunctionsHttpError) {
        try {
          const corpo = await error.context.json()
          if (corpo?.error) mensagem = corpo.error
        } catch {
          // corpo não veio em JSON, mantém a mensagem genérica
        }
      } else if (data?.error) {
        mensagem = data.error
      }
      setErro(mensagem)
      setCancelando(false)
      return
    }

    await refreshProfile()
    toastSuccess('Assinatura cancelada. Seu acesso Pro continua até o fim do período já pago.')
    setCancelando(false)
    onClose()
  }

  return (
    <Modal title="Cancelar assinatura" onClose={onClose}>
      <div className="space-y-5">
        <div className="flex items-start gap-3 rounded-xl bg-rose-50 p-4">
          <AlertTriangle size={20} className="mt-0.5 shrink-0 text-rose-500" />
          <p className="text-sm text-rose-700">
            Tem certeza que deseja cancelar sua assinatura PODIFY Pro? Você não será mais cobrado
            e seus dados continuam guardados com segurança, mas o acesso aos recursos Pro é
            encerrado.
          </p>
        </div>
        {erro && <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-600">{erro}</p>}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={cancelando}
            className="flex min-h-[44px] flex-1 items-center justify-center rounded-xl border border-slate-200 text-sm font-medium hover:bg-slate-50 disabled:opacity-50"
          >
            Manter assinatura
          </button>
          <button
            onClick={confirmar}
            disabled={cancelando}
            className="flex min-h-[44px] flex-1 items-center justify-center rounded-xl bg-rose-500 text-sm font-semibold text-white hover:bg-rose-600 disabled:opacity-50"
          >
            {cancelando ? 'Cancelando...' : 'Cancelar assinatura'}
          </button>
        </div>
      </div>
    </Modal>
  )
}

const POLL_INTERVAL_MS = 5000

type EtapaCheckout = 'form' | 'aguardando'

interface QrCodePix {
  encodedImage: string
  payload: string
  expirationDate?: string
}

function CheckoutModal({ onClose }: { onClose: () => void }) {
  const user = useAuthStore((s) => s.user)
  const profile = useAuthStore((s) => s.profile)
  const refreshProfile = useAuthStore((s) => s.refreshProfile)

  const [etapa, setEtapa] = useState<EtapaCheckout>('form')
  const [formaPagamento, setFormaPagamento] = useState<'PIX' | 'CREDIT_CARD'>('PIX')
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [cardDeclined, setCardDeclined] = useState(false)
  const [qrCode, setQrCode] = useState<QrCodePix | null>(null)
  const [copiado, setCopiado] = useState(false)

  const [nome, setNome] = useState(profile?.nome_completo ?? '')
  const [telefone, setTelefone] = useState(profile?.telefone ?? '')
  const [cpfCnpj, setCpfCnpj] = useState(profile?.cpf_cnpj ?? '')

  const [numeroCartao, setNumeroCartao] = useState('')
  const [nomeImpresso, setNomeImpresso] = useState('')
  const [validade, setValidade] = useState('')
  const [cvv, setCvv] = useState('')
  const [cepTitular, setCepTitular] = useState('')
  const [numeroEndereco, setNumeroEndereco] = useState('')

  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Poll no profile a cada 5s enquanto aguarda o webhook do Asaas confirmar
  // o pagamento — troca pra tela de "assinatura ativa" sozinho, sem
  // precisar recarregar a página.
  useEffect(() => {
    if (etapa !== 'aguardando') return
    pollingRef.current = setInterval(() => {
      refreshProfile()
    }, POLL_INTERVAL_MS)
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current)
    }
  }, [etapa, refreshProfile])

  useEffect(() => {
    if (etapa === 'aguardando' && profile?.assinatura_status === 'ativa' && profile?.plano === 'pro') {
      if (pollingRef.current) clearInterval(pollingRef.current)
      toastSuccess('Pagamento confirmado! Sua assinatura PODIFY Pro está ativa.')
      onClose()
    }
  }, [etapa, profile?.assinatura_status, profile?.plano, onClose])

  function handleClose() {
    if (pollingRef.current) clearInterval(pollingRef.current)
    onClose()
  }

  async function confirmarAssinatura() {
    setErro(null)
    setCardDeclined(false)

    if (!nome.trim() || !cpfCnpj.trim()) {
      setErro('Preencha nome e CPF/CNPJ.')
      return
    }
    if (formaPagamento === 'CREDIT_CARD') {
      if (!numeroCartao.trim() || !nomeImpresso.trim() || !validade.trim() || !cvv.trim() || !cepTitular.trim() || !numeroEndereco.trim()) {
        setErro('Preencha todos os dados do cartão.')
        return
      }
    }

    setEnviando(true)
    try {
      const [validadeMes, validadeAno] = validade.split('/')
      const { data, error } = await supabase.functions.invoke('asaas-checkout', {
        body: {
          forma_pagamento: formaPagamento,
          cpf_cnpj: cpfCnpj,
          nome,
          email: user?.email,
          telefone,
          dados_cartao:
            formaPagamento === 'CREDIT_CARD'
              ? {
                  numero: numeroCartao,
                  nomeImpresso,
                  validadeMes,
                  validadeAno: validadeAno?.length === 2 ? `20${validadeAno}` : validadeAno,
                  cvv,
                  titularCep: cepTitular,
                  titularNumeroEndereco: numeroEndereco,
                }
              : undefined,
        },
      })

      if (error) {
        // supabase-js não parseia o corpo da resposta em erro (data vem
        // null), só devolve "Edge Function returned a non-2xx status
        // code" — a mensagem específica que a function manda (CPF
        // inválido, cartão recusado etc) tá no corpo da resposta, dentro
        // de error.context.
        let mensagem = 'Não foi possível concluir a assinatura. Tente novamente.'
        if (error instanceof FunctionsHttpError) {
          try {
            const corpo = await error.context.json()
            if (corpo?.error) mensagem = corpo.error
            if (corpo?.cardDeclined) setCardDeclined(true)
          } catch {
            // corpo não veio em JSON, mantém a mensagem genérica
          }
        } else if (error.message) {
          mensagem = error.message
        }
        setErro(mensagem)
        setEnviando(false)
        return
      }

      if (!data?.ok) {
        setErro(data?.error || 'Não foi possível concluir a assinatura. Tente novamente.')
        if (data?.cardDeclined) setCardDeclined(true)
        setEnviando(false)
        return
      }

      if (data.formaPagamento === 'PIX') {
        setQrCode(data.qrCode)
      }
      setEtapa('aguardando')
      setEnviando(false)
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Não foi possível concluir a assinatura. Tente novamente.')
      setEnviando(false)
    }
  }

  async function copiarCodigoPix() {
    if (!qrCode?.payload) return
    await navigator.clipboard.writeText(qrCode.payload)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
  }

  if (etapa === 'aguardando') {
    return (
      <Modal title="Confirmando pagamento" onClose={handleClose}>
        <div className="space-y-5 text-center">
          {formaPagamento === 'PIX' && qrCode ? (
            <>
              <p className="text-sm text-slate-500">Escaneie o QR Code com o app do seu banco</p>
              <img
                src={`data:image/png;base64,${qrCode.encodedImage}`}
                alt="QR Code Pix"
                className="mx-auto h-56 w-56 rounded-xl border border-slate-200 object-contain"
              />
              <div>
                <p className="mb-1.5 text-left text-xs font-semibold text-slate-400">OU COPIE O CÓDIGO PIX</p>
                <div className="flex items-center gap-2">
                  <input
                    readOnly
                    value={qrCode.payload}
                    className="input-field truncate text-xs text-slate-500"
                    onFocus={(e) => e.target.select()}
                  />
                  <button
                    onClick={copiarCodigoPix}
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-500 text-white hover:bg-brand-600"
                    title="Copiar código Pix"
                  >
                    <Copy size={16} />
                  </button>
                </div>
                {copiado && <p className="mt-1 text-left text-xs font-medium text-emerald-600">Copiado!</p>}
              </div>
            </>
          ) : (
            <div className="py-6">
              <CreditCard size={40} className="mx-auto mb-3 text-brand-300" />
              <p className="font-semibold text-ink-900">Processando seu pagamento...</p>
            </div>
          )}

          <div className="flex items-center justify-center gap-2 rounded-xl bg-brand-50 px-4 py-3 text-sm text-brand-700">
            <Loader2 size={16} className="animate-spin" />
            Aguardando confirmação do pagamento — isso atualiza sozinho aqui na tela.
          </div>
        </div>
      </Modal>
    )
  }

  return (
    <Modal title="Assinar PODIFY Pro" onClose={handleClose}>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setFormaPagamento('PIX')}
            className={`flex min-h-[52px] flex-col items-center justify-center gap-1 rounded-xl border-2 text-sm font-semibold transition ${
              formaPagamento === 'PIX' ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-slate-200 text-slate-500'
            }`}
          >
            <QrCode size={18} /> Pix
          </button>
          <button
            type="button"
            onClick={() => setFormaPagamento('CREDIT_CARD')}
            className={`flex min-h-[52px] flex-col items-center justify-center gap-1 rounded-xl border-2 text-sm font-semibold transition ${
              formaPagamento === 'CREDIT_CARD' ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-slate-200 text-slate-500'
            }`}
          >
            <CreditCard size={18} /> Cartão de Crédito
          </button>
        </div>

        <div>
          <label className="label-field">Nome completo *</label>
          <input className="input-field" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Seu nome completo" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label-field">CPF/CNPJ *</label>
            <input
              className="input-field"
              value={cpfCnpj}
              onChange={(e) => setCpfCnpj(mascaraCpfCnpj(e.target.value))}
              placeholder="000.000.000-00"
              inputMode="numeric"
            />
          </div>
          <div>
            <label className="label-field">Telefone</label>
            <input
              className="input-field"
              value={telefone}
              onChange={(e) => setTelefone(mascaraTelefone(e.target.value))}
              placeholder="(00) 00000-0000"
              inputMode="numeric"
            />
          </div>
        </div>

        {formaPagamento === 'CREDIT_CARD' && (
          <div className="space-y-4 border-t border-slate-100 pt-4">
            <div>
              <label className="label-field">Número do cartão *</label>
              <input
                className="input-field"
                value={numeroCartao}
                onChange={(e) => setNumeroCartao(mascaraCartao(e.target.value))}
                placeholder="0000 0000 0000 0000"
                inputMode="numeric"
              />
            </div>
            <div>
              <label className="label-field">Nome impresso no cartão *</label>
              <input
                className="input-field"
                value={nomeImpresso}
                onChange={(e) => setNomeImpresso(e.target.value.toUpperCase())}
                placeholder="COMO ESTÁ NO CARTÃO"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label-field">Validade (MM/AA) *</label>
                <input
                  className="input-field"
                  value={validade}
                  onChange={(e) => setValidade(mascaraValidadeCartao(e.target.value))}
                  placeholder="MM/AA"
                  inputMode="numeric"
                />
              </div>
              <div>
                <label className="label-field">CVV *</label>
                <input
                  className="input-field"
                  value={cvv}
                  onChange={(e) => setCvv(mascaraCvv(e.target.value))}
                  placeholder="000"
                  inputMode="numeric"
                />
              </div>
            </div>
            <p className="text-xs font-semibold text-slate-400">DADOS DO TITULAR (exigido para segurança)</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label-field">CEP *</label>
                <input
                  className="input-field"
                  value={cepTitular}
                  onChange={(e) => setCepTitular(mascaraCep(e.target.value))}
                  placeholder="00000-000"
                  inputMode="numeric"
                />
              </div>
              <div>
                <label className="label-field">Número do endereço *</label>
                <input
                  className="input-field"
                  value={numeroEndereco}
                  onChange={(e) => setNumeroEndereco(e.target.value)}
                  placeholder="123"
                  inputMode="numeric"
                />
              </div>
            </div>
          </div>
        )}

        {erro && (
          <div className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-600">
            <p>{erro}</p>
            {cardDeclined && (
              <button
                type="button"
                onClick={() => {
                  setFormaPagamento('PIX')
                  setErro(null)
                  setCardDeclined(false)
                }}
                className="mt-2 inline-flex items-center gap-1.5 font-semibold text-brand-600 hover:underline"
              >
                <QrCode size={14} /> Pagar com Pix em vez disso
              </button>
            )}
          </div>
        )}

        <button
          onClick={confirmarAssinatura}
          disabled={enviando}
          className="btn-brand flex w-full items-center justify-center gap-2 py-3.5"
        >
          {enviando ? (
            <>
              <Loader2 size={16} className="animate-spin" /> Processando...
            </>
          ) : (
            `Confirmar assinatura — R$ 29,90/mês`
          )}
        </button>
        <p className="flex items-center justify-center gap-1.5 text-center text-xs text-slate-400">
          <Lock size={12} /> Pagamento processado com segurança pelo Asaas
        </p>
      </div>
    </Modal>
  )
}
