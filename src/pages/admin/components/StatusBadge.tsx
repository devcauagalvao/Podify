import { Infinity as InfinityIcon } from 'lucide-react'
import type { AdminAccount } from '@/types/database'
import { diasRestantes, formatDataBR, statusConta } from '../utils'

export function StatusBadge({ conta }: { conta: AdminAccount }) {
  const status = statusConta(conta)

  if (status === 'trial') {
    const dias = diasRestantes(conta.trial_expira_em)
    const vencido = dias !== null && dias < 0
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${
          vencido ? 'bg-rose-500/15 text-rose-400' : 'bg-amber-500/15 text-amber-400'
        }`}
      >
        Trial · {dias === null ? '—' : vencido ? 'vencido' : dias === 0 ? 'vence hoje' : `${dias}d restantes`}
      </span>
    )
  }

  if (status === 'ilimitado') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-brand-500/15 px-2.5 py-1 text-xs font-bold text-brand-400">
        <InfinityIcon size={12} /> Ilimitado
      </span>
    )
  }

  if (status === 'ativo') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-bold text-emerald-400">
        Ativo até {formatDataBR(conta.assinatura_expira_em) ?? '—'}
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-slate-500/20 px-2.5 py-1 text-xs font-bold text-slate-400">
      Expirado
    </span>
  )
}
