import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Users, CalendarCheck, DollarSign, AlertTriangle, Footprints, Heart, UserPlus, ClipboardPlus, CalendarPlus, Stethoscope } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { toastError } from '@/store/toastStore'

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
    receitaMes: 0,
    alertaEstoque: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const hoje = new Date().toISOString().slice(0, 10)
      const inicioMes = new Date()
      inicioMes.setDate(1)

      const [clientesRes, consultasRes, financeiroRes, estoqueRes] = await Promise.all([
        supabase.from('clientes').select('id', { count: 'exact', head: true }),
        supabase.from('consultas').select('id', { count: 'exact', head: true }).eq('data', hoje),
        supabase
          .from('financeiro_registros')
          .select('valor, tipo')
          .gte('data', inicioMes.toISOString().slice(0, 10)),
        supabase.from('estoque_produtos').select('id, quantidade, quantidade_minima'),
      ])

      const erro = clientesRes.error || consultasRes.error || financeiroRes.error || estoqueRes.error
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
        receitaMes,
        alertaEstoque,
      })
      setLoading(false)
    }
    load()
  }, [])

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

        <div className="mt-6 flex flex-wrap gap-3">
          <div className="flex items-center gap-3 rounded-xl bg-white/15 px-4 py-3 backdrop-blur-sm">
            <CalendarCheck size={18} />
            <div className="text-sm">
              <p className="font-bold leading-none">{stats.consultasHoje}</p>
              <p className="text-white/80">Hoje consultas</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl bg-white/15 px-4 py-3 backdrop-blur-sm">
            <Users size={18} />
            <div className="text-sm">
              <p className="font-bold leading-none">{stats.clientes}</p>
              <p className="text-white/80">Total clientes</p>
            </div>
          </div>
        </div>
      </div>

      {/* Cards de estatística */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={Users} label="Clientes" sub="cadastrados" value={stats.clientes} tone="brand" />
        <StatCard icon={CalendarCheck} label="Consultas Hoje" sub="agendadas" value={stats.consultasHoje} tone="brand" />
        <StatCard
          icon={DollarSign}
          label="Receita do Mês"
          sub={new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(new Date())}
          value={stats.receitaMes.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          tone="brand-dark"
        />
        <StatCard icon={AlertTriangle} label="Alerta de Estoque" sub="itens baixos" value={stats.alertaEstoque} tone="danger" />
      </div>

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
          <EmptyState icon={Footprints} text="Nenhum cliente cadastrado ainda" cta="Cadastrar primeiro cliente" to="/clientes" />
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
          <EmptyState icon={Heart} text="Dia livre hoje!" sub="Nenhuma consulta agendada." cta="Agendar consulta" to="/agenda" />
        </div>
      </div>

      {/* Acesso rápido */}
      <div>
        <p className="mb-3 text-xs font-bold tracking-wider text-slate-400">ACESSO RÁPIDO</p>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <QuickAccess icon={UserPlus} title="Novo Cliente" sub="Cadastrar" to="/clientes" />
          <QuickAccess icon={ClipboardPlus} title="Nova Ficha" sub="Anamnese" to="/anamnese/nova" />
          <QuickAccess icon={CalendarPlus} title="Agendar" sub="Consulta" to="/agenda" />
          <QuickAccess icon={Stethoscope} title="LIA Podologa" sub="Consultar IA" to="/lia" />
        </div>
      </div>

      {loading && <p className="text-center text-xs text-slate-400">Carregando dados…</p>}
    </div>
  )
}

function StatCard({
  icon: Icon,
  label,
  sub,
  value,
  tone,
}: {
  icon: typeof Users
  label: string
  sub: string
  value: string | number
  tone: 'brand' | 'brand-dark' | 'danger'
}) {
  const bg = tone === 'danger' ? 'bg-rose-500' : tone === 'brand-dark' ? 'bg-brand-700' : 'bg-brand-400'
  return (
    <div className="card p-5">
      <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${bg} text-white`}>
        <Icon size={18} />
      </div>
      <p className="text-2xl font-extrabold text-ink-900">{value}</p>
      <p className="text-sm font-medium text-slate-600">{label}</p>
      <p className="text-xs text-slate-400">{sub}</p>
    </div>
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
