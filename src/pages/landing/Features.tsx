import { useState } from 'react'
import { Bot, CalendarDays, Check, ClipboardList, DollarSign, Package, Users } from 'lucide-react'

const FEATURES = [
  {
    id: 'clientes',
    icon: Users,
    title: 'Gestão de Clientes',
    badge: 'Mais usado',
    description: 'Cadastro completo, histórico de atendimentos e busca rápida — tudo organizado num só lugar.',
  },
  {
    id: 'anamnese',
    icon: ClipboardList,
    title: 'Anamnese Digital',
    badge: null,
    description: 'Ficha clínica completa, fotos e assinatura digital do cliente, sem papel.',
  },
  {
    id: 'agenda',
    icon: CalendarDays,
    title: 'Agenda Inteligente',
    badge: null,
    description: 'Agende e gerencie consultas com visão diária e semanal. Nunca mais perca um horário.',
  },
  {
    id: 'financeiro',
    icon: DollarSign,
    title: 'Controle Financeiro',
    badge: null,
    description: 'Entradas, saídas e receita do mês num painel simples de acompanhar.',
  },
  {
    id: 'estoque',
    icon: Package,
    title: 'Gestão de Estoque',
    badge: null,
    description: 'Controle de produtos e alerta automático quando algo está acabando.',
  },
  {
    id: 'lia',
    icon: Bot,
    title: 'LIA — IA Podóloga',
    badge: 'Exclusivo',
    description: 'Assistente de IA especializada em podologia, direto no seu fluxo de atendimento.',
  },
] as const

type FeatureId = (typeof FEATURES)[number]['id']

export function Features() {
  const [selecionado, setSelecionado] = useState<FeatureId>('agenda')
  const feature = FEATURES.find((f) => f.id === selecionado)!

  return (
    <section id="funcionalidades" className="px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-4 py-1.5 text-xs font-semibold text-brand-700">
            Veja como funciona
          </span>
          <h2 className="mt-4 text-3xl font-extrabold text-ink-900 sm:text-4xl">
            Cada detalhe foi pensado para sua rotina.
          </h2>
          <p className="mt-4 text-slate-600">
            Uma plataforma completa que acompanha cada passo da sua clínica — do cadastro ao
            financeiro.
          </p>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-[380px_1fr]">
          <div className="space-y-3">
            {FEATURES.map((f) => {
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
          </div>

          <FeaturePreview id={feature.id} />
        </div>
      </div>
    </section>
  )
}

function FeaturePreview({ id }: { id: FeatureId }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50 px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-rose-300" />
        <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-300" />
        <span className="ml-2 text-xs text-slate-400">Podify · prévia ilustrativa</span>
      </div>
      <div className="p-6">{renderPreview(id)}</div>
    </div>
  )
}

function renderPreview(id: FeatureId) {
  switch (id) {
    case 'clientes':
      return (
        <div className="space-y-3">
          {['Maria Fernandes', 'João Pereira', 'Ana Costa'].map((nome) => (
            <div key={nome} className="flex items-center gap-3 rounded-xl border border-slate-100 p-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-50 text-sm font-bold text-brand-600">
                {nome[0]}
              </div>
              <div>
                <p className="text-sm font-semibold text-ink-900">{nome}</p>
                <p className="text-xs text-slate-400">Cliente ativo</p>
              </div>
            </div>
          ))}
        </div>
      )
    case 'anamnese':
      return (
        <div className="space-y-3">
          {['Dados gerais', 'Avaliação clínica', 'Fotos do procedimento', 'Assinatura digital'].map((item) => (
            <div key={item} className="flex items-center gap-3 rounded-xl border border-slate-100 p-3">
              <Check size={16} className="text-brand-500" />
              <p className="text-sm font-medium text-ink-900">{item}</p>
            </div>
          ))}
        </div>
      )
    case 'agenda':
      return (
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
      )
    case 'financeiro':
      return (
        <div className="space-y-3">
          <div className="flex items-end gap-2">
            {[40, 65, 50, 80, 60, 90].map((h, i) => (
              <div key={i} className="flex-1 rounded-t-lg bg-brand-200" style={{ height: `${h}px` }} />
            ))}
          </div>
          <p className="text-xs text-slate-400">Receita ao longo do mês</p>
        </div>
      )
    case 'estoque':
      return (
        <div className="space-y-3">
          {[
            { nome: 'Lixa de unha', status: 'ok' },
            { nome: 'Antisséptico', status: 'baixo' },
            { nome: 'Algodão', status: 'ok' },
          ].map((p) => (
            <div key={p.nome} className="flex items-center justify-between rounded-xl border border-slate-100 p-3">
              <p className="text-sm font-medium text-ink-900">{p.nome}</p>
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
      )
    case 'lia':
      return (
        <div className="space-y-3">
          <div className="rounded-xl rounded-tl-none bg-slate-50 p-3 text-sm text-slate-600">
            Qual o protocolo recomendado para onicocriptose leve?
          </div>
          <div className="rounded-xl rounded-tr-none bg-brand-500 p-3 text-sm text-white">
            Para onicocriptose leve, o protocolo geralmente envolve...
          </div>
        </div>
      )
  }
}
