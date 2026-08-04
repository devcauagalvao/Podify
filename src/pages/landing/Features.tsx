import { useState } from 'react'
import {
  Bell,
  Bot,
  CalendarDays,
  Check,
  ClipboardList,
  DollarSign,
  Headphones,
  Package,
  Search,
  Share2,
  ShieldCheck,
  Smartphone,
  TrendingUp,
  Users,
} from 'lucide-react'
import logoHorizontalUrl from '@/assets/logos/podify-horizontal.png'
import { Reveal } from '@/components/Reveal'

const FEATURES = [
  {
    id: 'clientes',
    icon: Users,
    title: 'Gestão de Clientes',
    navLabel: 'Clientes',
    badge: 'Mais usado',
    description: 'Cadastro completo, histórico de atendimentos e busca rápida — tudo organizado num só lugar.',
  },
  {
    id: 'anamnese',
    icon: ClipboardList,
    title: 'Anamnese Digital',
    navLabel: 'Anamnese',
    badge: null,
    description: 'Ficha clínica completa, fotos e assinatura digital do cliente, sem papel.',
  },
  {
    id: 'agenda',
    icon: CalendarDays,
    title: 'Agenda Inteligente',
    navLabel: 'Agenda',
    badge: null,
    description: 'Agende e gerencie consultas com visão diária e semanal. Nunca mais perca um horário.',
  },
  {
    id: 'financeiro',
    icon: DollarSign,
    title: 'Controle Financeiro',
    navLabel: 'Financeiro',
    badge: null,
    description: 'Entradas, saídas e receita do mês num painel simples de acompanhar.',
  },
  {
    id: 'estoque',
    icon: Package,
    title: 'Gestão de Estoque',
    navLabel: 'Estoque',
    badge: null,
    description: 'Controle de produtos e alerta automático quando algo está acabando.',
  },
  {
    id: 'lia',
    icon: Bot,
    title: 'LIA — IA Podóloga',
    navLabel: 'LIA Podóloga',
    badge: 'Exclusivo',
    description: 'Assistente de IA especializada em podologia, direto no seu fluxo de atendimento.',
  },
] as const

type FeatureId = (typeof FEATURES)[number]['id']

const HIGHLIGHTS = [
  {
    icon: Share2,
    title: 'Tudo conectado',
    description: 'Informações integradas e atualizadas em tempo real.',
  },
  {
    icon: ShieldCheck,
    title: 'Segurança',
    description: 'Seus dados protegidos com criptografia de ponta.',
  },
  {
    icon: Smartphone,
    title: 'Acesso fácil',
    description: 'Acesse de onde estiver, quando precisar.',
  },
  {
    icon: Headphones,
    title: 'Suporte humanizado',
    description: 'Nossa equipe está sempre pronta para ajudar.',
  },
] as const

export function Features() {
  const [selecionado, setSelecionado] = useState<FeatureId>('agenda')
  const feature = FEATURES.find((f) => f.id === selecionado)!

  return (
    <section id="funcionalidades" className="px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-4 py-1.5 text-xs font-semibold text-brand-700">
            Veja como funciona
          </span>
          <h2 className="mt-4 font-display text-3xl font-semibold text-ink-900 sm:text-4xl">
            Cada detalhe foi pensado para sua rotina.
          </h2>
          <p className="mt-4 text-slate-600">
            Uma plataforma completa que acompanha cada passo da sua clínica — do cadastro ao
            financeiro.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-6 lg:grid-cols-[380px_1fr]">
          <Reveal className="relative space-y-3">
            <div className="pointer-events-none absolute bottom-6 left-[27px] top-6 -z-10 w-px bg-slate-200" />
            {FEATURES.map((f, i) => {
              const ativo = f.id === selecionado
              const Icon = f.icon
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setSelecionado(f.id)}
                  className={`flex w-full items-start gap-4 rounded-2xl border-2 p-4 text-left transition ${
                    ativo ? 'border-brand-500 bg-brand-50' : 'border-transparent bg-white hover:border-slate-200'
                  }`}
                >
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                      ativo ? 'bg-brand-500 text-white' : 'bg-brand-50 text-brand-600'
                    }`}
                  >
                    <Icon size={20} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-400">{String(i + 1).padStart(2, '0')}</p>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-bold text-ink-900">{f.title}</p>
                      {f.badge && (
                        <span className="rounded-full bg-brand-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand-700">
                          {f.badge}
                        </span>
                      )}
                    </div>
                    {ativo && <p className="mt-1 text-sm text-slate-600">{f.description}</p>}
                  </div>
                </button>
              )
            })}
          </Reveal>

          <Reveal delay={120}>
            <FeaturePreview id={feature.id} onSelect={setSelecionado} />
          </Reveal>
        </div>

        <div className="mt-16 grid gap-6 border-t border-slate-100 pt-12 sm:grid-cols-2 lg:grid-cols-4">
          {HIGHLIGHTS.map((h, i) => {
            const Icon = h.icon
            return (
              <Reveal key={h.title} delay={i * 80} className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                  <Icon size={18} />
                </div>
                <div>
                  <p className="font-bold text-ink-900">{h.title}</p>
                  <p className="mt-0.5 text-sm text-slate-500">{h.description}</p>
                </div>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function FeaturePreview({ id, onSelect }: { id: FeatureId; onSelect: (id: FeatureId) => void }) {
  const feature = FEATURES.find((f) => f.id === id)!

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg shadow-slate-200/60">
      <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50 px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-rose-300" />
        <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-300" />
        <span className="ml-2 text-xs text-slate-400">app.podify.com.br · {feature.title}</span>
        <div className="ml-auto flex items-center gap-3 text-slate-300">
          <Search size={14} />
          <Bell size={14} />
          <span className="h-5 w-5 rounded-full bg-brand-100 text-center text-[10px] font-bold leading-5 text-brand-700">
            PD
          </span>
        </div>
      </div>
      <div className="flex">
        <div className="hidden w-[168px] shrink-0 flex-col border-r border-slate-100 bg-white py-5 md:flex">
          <img src={logoHorizontalUrl} alt="Podify" className="mb-4 h-auto w-[104px] px-4 object-contain" />
          <nav className="space-y-1 px-3">
            {FEATURES.map((f) => {
              const ativo = f.id === id
              const Icon = f.icon
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => onSelect(f.id)}
                  className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-xs font-medium transition ${
                    ativo ? 'bg-brand-400 text-white shadow-sm' : 'text-slate-600 hover:bg-brand-50 hover:text-brand-700'
                  }`}
                >
                  <Icon size={15} />
                  <span className="truncate">{f.navLabel}</span>
                </button>
              )
            })}
          </nav>
        </div>
        <div className="min-w-0 flex-1 p-6">{renderPreview(id)}</div>
      </div>
    </div>
  )
}

function renderPreview(id: FeatureId) {
  switch (id) {
    case 'clientes':
      return (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm font-bold text-ink-900">Clientes</p>
            <p className="text-xs text-slate-400">128 cadastrados</p>
          </div>
          <div className="space-y-2">
            {[
              { nome: 'Maria Fernandes', info: 'Última visita há 3 dias' },
              { nome: 'João Pereira', info: 'Última visita há 1 semana' },
              { nome: 'Ana Costa', info: 'Retorno agendado' },
            ].map((c) => (
              <div
                key={c.nome}
                className="flex items-center gap-3 rounded-xl border border-slate-100 p-3 transition hover:border-brand-100 hover:bg-brand-50/40"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-50 text-sm font-bold text-brand-600">
                  {c.nome[0]}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-ink-900">{c.nome}</p>
                  <p className="truncate text-xs text-slate-400">{c.info}</p>
                </div>
                <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-600">
                  Ativo
                </span>
              </div>
            ))}
          </div>
        </div>
      )
    case 'anamnese':
      return (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm font-bold text-ink-900">Anamnese · Maria Fernandes</p>
            <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-semibold text-brand-700">
              4/4 preenchido
            </span>
          </div>
          <div className="space-y-2">
            {['Dados gerais', 'Avaliação clínica', 'Fotos do procedimento', 'Assinatura digital'].map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-xl border border-slate-100 p-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-500 text-white">
                  <Check size={13} />
                </div>
                <p className="text-sm font-medium text-ink-900">{item}</p>
              </div>
            ))}
          </div>
        </div>
      )
    case 'agenda':
      return (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm font-bold text-ink-900">Maio 2025</p>
            <div className="flex items-center gap-3 text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-brand-500" /> Agendado
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-brand-50 ring-1 ring-brand-200" /> Disponível
              </span>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-1.5 text-center text-xs">
            {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, i) => (
              <span key={i} className="pb-1 font-semibold text-slate-400">
                {d}
              </span>
            ))}
            {Array.from({ length: 28 }, (_, i) => i + 1).map((dia) => (
              <span
                key={dia}
                className={`rounded-lg py-2 ${
                  [5, 12, 19].includes(dia)
                    ? 'bg-brand-500 font-bold text-white'
                    : [3, 10, 17, 24].includes(dia)
                      ? 'bg-brand-50 text-brand-700'
                      : 'text-slate-500'
                }`}
              >
                {dia}
              </span>
            ))}
          </div>
        </div>
      )
    case 'financeiro':
      return (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400">Receita do mês</p>
              <p className="text-lg font-extrabold text-ink-900">R$ 18.420,00</p>
            </div>
            <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-600">
              <TrendingUp size={12} /> +14,8%
            </span>
          </div>
          <div className="flex h-28 items-end gap-2.5">
            {[40, 65, 50, 80, 60, 95].map((h, i) => (
              <div
                key={i}
                className={`flex-1 rounded-t-lg ${i === 5 ? 'bg-brand-500' : 'bg-brand-100'}`}
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
          <div className="mt-2 flex justify-between text-[11px] text-slate-400">
            <span>Semana 1</span>
            <span>Semana 6</span>
          </div>
        </div>
      )
    case 'estoque':
      return (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm font-bold text-ink-900">Produtos</p>
            <p className="text-xs text-slate-400">32 cadastrados</p>
          </div>
          <div className="space-y-2">
            {[
              { nome: 'Lixa de unha', qtd: 42, status: 'ok' },
              { nome: 'Antisséptico', qtd: 3, status: 'baixo' },
              { nome: 'Algodão', qtd: 58, status: 'ok' },
            ].map((p) => (
              <div key={p.nome} className="flex items-center gap-3 rounded-xl border border-slate-100 p-3">
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                    p.status === 'ok' ? 'bg-brand-50 text-brand-600' : 'bg-amber-50 text-amber-600'
                  }`}
                >
                  <Package size={16} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-ink-900">{p.nome}</p>
                  <p className="text-xs text-slate-400">{p.qtd} unidades</p>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                    p.status === 'ok' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                  }`}
                >
                  {p.status === 'ok' ? 'Em estoque' : 'Estoque baixo'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )
    case 'lia':
      return (
        <div>
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-500 text-white">
              <Bot size={16} />
            </div>
            <div>
              <p className="text-sm font-bold text-ink-900">LIA</p>
              <p className="text-xs text-slate-400">IA Podóloga · online</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="ml-auto max-w-[85%] rounded-xl rounded-tr-none bg-slate-100 p-3 text-sm text-slate-600">
              Qual o protocolo recomendado para onicocriptose leve?
            </div>
            <div className="mr-auto max-w-[85%] rounded-xl rounded-tl-none bg-brand-500 p-3 text-sm text-white">
              Para onicocriptose leve, o protocolo geralmente envolve remoção parcial da lâmina,
              curativo local e reavaliação em 7 dias.
            </div>
          </div>
        </div>
      )
  }
}
