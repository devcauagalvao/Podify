import { DollarSign, ShieldCheck, Clock3, XCircle } from 'lucide-react'
import type { AdminAccount } from '@/types/database'
import { origemConta } from '../utils'

const ESTILOS = {
  pagante: { label: 'Pagante', className: 'bg-emerald-100 text-emerald-700', icon: DollarSign },
  manual: { label: 'Acesso manual', className: 'bg-blue-100 text-blue-700', icon: ShieldCheck },
  trial: { label: 'Trial', className: 'bg-amber-100 text-amber-700', icon: Clock3 },
  expirado: { label: 'Expirado', className: 'bg-rose-100 text-rose-700', icon: XCircle },
} as const

export function OrigemBadge({ conta }: { conta: AdminAccount }) {
  const { label, className, icon: Icon } = ESTILOS[origemConta(conta)]
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${className}`}>
      <Icon size={12} /> {label}
    </span>
  )
}
