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
          vencido ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
        }`}
      >
        Trial · {dias === null ? '—' : vencido ? 'vencido' : dias === 0 ? 'vence hoje' : `${dias}d restantes`}
      </span>
    )
  }

  if (status === 'ilimitado') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-brand-100 px-2.5 py-1 text-xs font-bold text-brand-700">
        <InfinityIcon size={12} /> Ilimitado
      </span>
    )
  }

  if (status === 'ativo') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-700">
        Ativo até {formatDataBR(conta.assinatura_expira_em) ?? '—'}
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2.5 py-1 text-xs font-bold text-rose-700">
      Expirado
    </span>
  )
}
