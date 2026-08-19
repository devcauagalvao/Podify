import { useCallback, useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Users, CalendarCheck, DollarSign, AlertTriangle, Footprints, Coffee, UserPlus, ClipboardPlus, Bot, Truck } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { toastError } from '@/store/toastStore'
import { Skeleton, SkeletonStatCards } from '@/components/Skeleton'

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Bom dia'
  if (h < 18) return 'Boa tarde'
  return 'Boa noite'
}

export default function Dashboard() {
  const profile = useAuthStore((s) => s.profile)
  const [stats, setStats] = useState({
    clientes: 0,
    consultasHoje: 0,
    consultasProximos7Dias: 0,
    receitaMes: 0,
    alertaEstoque: 0,
  })
  const [loading, setLoading] = useState(true)
  const location = useLocation()

  const load = useCallback(async () => {
    const hoje = new Date()
    const hojeStr = hoje.toISOString().slice(0, 10)
    const amanha = new Date(hoje)
    amanha.setDate(amanha.getDate() + 1)
    const em7Dias = new Date(hoje)
    em7Dias.setDate(em7Dias.getDate() + 7)
    const inicioMes = new Date()
    inicioMes.setDate(1)

    const [clientesRes, consultasRes, consultasProximosRes, financeiroRes, estoqueRes] = await Promise.all([
      supabase.from('clientes').select('id', { count: 'exact', head: true }).is('deleted_at', null),
      supabase.from('consultas').select('id', { count: 'exact', head: true }).eq('data', hojeStr),
      // Próximos 7 dias a partir de amanhã — não repete a contagem de "hoje"
      // que já aparece no header, mostra informação nova no card.
      supabase
        .from('consultas')
        .select('id', { count: 'exact', head: true })
        .gte('data', amanha.toISOString().slice(0, 10))
        .lte('data', em7Dias.toISOString().slice(0, 10)),
      supabase
        .from('financeiro_registros')
        .select('valor, tipo')
        .gte('data', inicioMes.toISOString().slice(0, 10)),
      supabase.from('estoque_produtos').select('id, quantidade, quantidade_minima'),
    ])

    const erro =
      clientesRes.error || consultasRes.error || consultasProximosRes.error || financeiroRes.error || estoqueRes.error
    if (erro) toastError(`Não foi possível carregar os dados do painel: ${erro.message}`)

    const receitaMes = (financeiroRes.data ?? [])
      .filter((r) => r.tipo === 'entrada')
      .reduce((sum, r) => sum + Number(r.valor), 0)

    const alertaEstoque = (estoqueRes.data ?? []).filter(
      (p) => p.quantidade <= p.quantidade_minima
    ).length

    setStats({
      clientes: clientesRes.count ?? 0,
      consultasHoje: consultasRes.count ?? 0,
      consultasProximos7Dias: consultasProximosRes.count ?? 0,
      receitaMes,
      alertaEstoque,
    })
    setLoading(false)
  }, [])

  // location.key muda a cada navegação — mesmo voltando pra /dashboard
  // depois de cadastrar algo em outra tela — então refaz a busca sempre
  // que o usuário revisita o painel, em vez de confiar só no mount inicial.
  useEffect(() => {
    load()
  }, [load, location.key])

  // Cobre o caso de o usuário deixar a aba aberta em /dashboard e voltar
  // pra ela depois de cadastrar algo em outra aba/janela.
  useEffect(() => {
    function onFocus() {
      load()
    }
    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
  }, [load])

  const nome = profile?.nome_completo?.split(' ')[0] ?? profile?.nome_clinica ?? ''

  const dataFormatada = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date())

  return (
    <div className="space-y-6">
      {/* Header gradiente */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-600 to-brand-300 p-6 text-white sm:p-8">
        <h1 className="text-2xl font-extrabold sm:text-3xl">
          {greeting()}
          {nome ? `, ${nome}!` : '!'}
        </h1>
        <p className="mt-1 text-sm capitalize text-white/85">
          {dataFormatada} · {new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' }).format(new Date())}
        </p>

        {/* grid-cols-2 fixo (em vez de flex-wrap) garante que os dois cards
            fiquem sempre lado a lado, mesmo em telas bem estreitas — o
            conteúdo encolhe/trunca em vez de quebrar linha. */}
        <div className="mt-6 grid grid-cols-2 gap-2 sm:gap-3">
          <div className="flex items-center gap-2 rounded-xl bg-white/15 px-3 py-2.5 backdrop-blur-sm sm:gap-3 sm:px-4 sm:py-3">
            <CalendarCheck size={16} className="shrink-0 sm:hidden" />
            <CalendarCheck size={18} className="hidden shrink-0 sm:block" />
            <div className="min-w-0 text-xs sm:text-sm">
              <p className="font-bold leading-none">{stats.consultasHoje}</p>
              <p className="truncate text-white/80">Consultas hoje</p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-white/15 px-3 py-2.5 backdrop-blur-sm sm:gap-3 sm:px-4 sm:py-3">
            <Users size={16} className="shrink-0 sm:hidden" />
            <Users size={18} className="hidden shrink-0 sm:block" />
            <div className="min-w-0 text-xs sm:text-sm">
              <p className="font-bold leading-none">{stats.clientes}</p>
              <p className="truncate text-white/80">Total clientes</p>
            </div>
          </div>
        </div>
      </div>

      {/* Cards de estatística */}
      {loading ? (
        <SkeletonStatCards count={4} className="grid-cols-2 gap-4 lg:grid-cols-4" />
      ) : (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard icon={Users} label="Clientes" sub="cadastrados" value={stats.clientes} tone="brand" to="/clientes" />
          <StatCard
            icon={CalendarCheck}
            label="Próximos 7 Dias"
            sub="consultas agendadas"
            value={stats.consultasProximos7Dias}
            tone="brand"
            to="/agenda"
          />
          <StatCard
            icon={DollarSign}
            label="Receita do Mês"
            sub={new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(new Date())}
            value={stats.receitaMes.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            tone="brand-dark"
            to="/financeiro"
          />
          <StatCard
            icon={AlertTriangle}
            label="Alerta de Estoque"
            sub="itens baixos"
            value={stats.alertaEstoque}
            tone="danger"
            to="/estoque"
          />
        </div>
      )}

      {/* Clientes recentes / Consultas de hoje */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-bold text-ink-900">
              <Users size={18} className="text-brand-500" /> Clientes Recentes
            </h2>
            <Link to="/clientes" className="text-sm font-medium text-brand-600 hover:underline">
              Ver todos →
            </Link>
          </div>
          {loading ? (
            <RecentListSkeleton />
          ) : (
            <EmptyState icon={Footprints} text="Nenhum cliente cadastrado ainda" cta="Cadastrar primeiro cliente" to="/clientes" />
          )}
        </div>

        <div className="card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-bold text-ink-900">
              <CalendarCheck size={18} className="text-brand-500" /> Consultas de Hoje
            </h2>
            <Link to="/agenda" className="text-sm font-medium text-brand-600 hover:underline">
              Ver agenda →
            </Link>
          </div>
          {loading ? (
            <RecentListSkeleton />
          ) : (
            <EmptyState icon={Coffee} text="Dia livre hoje!" sub="Nenhuma consulta agendada." cta="Agendar consulta" to="/agenda" />
          )}
        </div>
      </div>

      {/* Acesso rápido */}
      <div>
        <p className="mb-3 text-xs font-bold tracking-wider text-slate-400">ACESSO RÁPIDO</p>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <QuickAccess icon={UserPlus} title="Novo Cliente" sub="Cadastrar" to="/clientes" />
          <QuickAccess icon={ClipboardPlus} title="Nova Ficha" sub="Anamnese" to="/anamnese/nova" />
          <QuickAccess icon={Truck} title="Fornecedores" sub="Ver todos" to="/fornecedores" />
          <QuickAccess icon={Bot} title="LIA Podóloga" sub="Consultar IA" to="/lia" />
        </div>
      </div>
    </div>
  )
}

function RecentListSkeleton() {
  return (
    <div className="space-y-4 py-1">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3.5 w-32" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
      ))}
    </div>
  )
}

function StatCard({
  icon: Icon,
  label,
  sub,
  value,
  tone,
  to,
}: {
  icon: typeof Users
  label: string
  sub: string
  value: string | number
  tone: 'brand' | 'brand-dark' | 'danger'
  to: string
}) {
  const bg = tone === 'danger' ? 'bg-rose-500' : tone === 'brand-dark' ? 'bg-brand-700' : 'bg-brand-400'
  // Valores em R$ com muitos dígitos (ex: "R$ 123.456.789,00") não cabem no
  // tamanho de fonte padrão do card — reduz progressivamente conforme o
  // texto formatado fica mais longo, em vez de vazar ou quebrar o layout.
  const valorTexto = String(value)
  const fonteClasse =
    valorTexto.length > 16 ? 'text-base' : valorTexto.length > 12 ? 'text-lg' : 'text-2xl'
  return (
    <Link to={to} className="card block p-5 transition hover:-translate-y-0.5 hover:shadow-md">
      <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${bg} text-white`}>
        <Icon size={18} />
      </div>
      <p className={`truncate font-extrabold text-ink-900 ${fonteClasse}`} title={valorTexto}>
        {value}
      </p>
      <p className="text-sm font-medium text-slate-600">{label}</p>
      <p className="text-xs text-slate-400">{sub}</p>
    </Link>
  )
}

function EmptyState({
  icon: Icon,
  text,
  sub,
  cta,
  to,
}: {
  icon: typeof Footprints
  text: string
  sub?: string
  cta: string
  to: string
}) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <Icon size={32} className="mb-3 text-brand-300" />
      <p className="font-semibold text-ink-900">{text}</p>
      {sub && <p className="text-sm text-slate-400">{sub}</p>}
      <Link to={to} className="mt-2 text-sm font-medium text-brand-600 hover:underline">
        + {cta}
      </Link>
    </div>
  )
}

function QuickAccess({
  icon: Icon,
  title,
  sub,
  to,
}: {
  icon: typeof UserPlus
  title: string
  sub: string
  to: string
}) {
  return (
    <Link to={to} className="card flex items-center gap-3 p-4 transition hover:shadow-md">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-400 text-white">
        <Icon size={18} />
      </div>
      <div className="min-w-0">
        <p className="truncate font-semibold text-ink-900">{title}</p>
        <p className="text-xs text-slate-400">{sub}</p>
      </div>
    </Link>
  )
}
