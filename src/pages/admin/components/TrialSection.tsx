import { Clock3, ArrowRight } from 'lucide-react'
import type { AdminAccount } from '@/types/database'
import { diasRestantes, statusConta } from '../utils'

const MAX_VISIVEIS = 8

export function TrialSection({ contas, onVerTodos }: { contas: AdminAccount[]; onVerTodos: () => void }) {
  const trials = contas
    .filter((c) => statusConta(c) === 'trial' && c.trial_expira_em)
    .map((c) => ({ conta: c, dias: diasRestantes(c.trial_expira_em) ?? 0 }))
    .sort((a, b) => a.dias - b.dias)

  if (trials.length === 0) return null

  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 sm:p-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-sm font-bold text-amber-700">
          <Clock3 size={16} /> Período de teste (7 dias) — {trials.length}{' '}
          {trials.length === 1 ? 'conta, ordenada' : 'contas, ordenadas'} por quem vence primeiro
        </h2>
        <button
          onClick={onVerTodos}
          className="flex items-center gap-1 text-xs font-semibold text-amber-700 hover:text-amber-800"
        >
          Ver na lista completa <ArrowRight size={14} />
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {trials.slice(0, MAX_VISIVEIS).map(({ conta, dias }) => (
          <div
            key={conta.id}
            className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs ${
              dias <= 1
                ? 'border-rose-200 bg-rose-50 text-rose-700'
                : dias <= 3
                  ? 'border-amber-300 bg-amber-100 text-amber-800'
                  : 'border-slate-200 bg-white text-slate-600'
            }`}
          >
            <span className="max-w-[160px] truncate font-semibold">
              {conta.nome_clinica || conta.nome_completo || conta.email}
            </span>
            <span className="shrink-0 opacity-80">{dias < 0 ? 'vencido' : dias === 0 ? 'vence hoje' : `${dias}d`}</span>
          </div>
        ))}
      </div>
      {trials.length > MAX_VISIVEIS && (
        <p className="mt-2 text-[11px] text-amber-700/80">
          +{trials.length - MAX_VISIVEIS} outras contas em trial — veja a lista completa.
        </p>
      )}
    </div>
  )
}
