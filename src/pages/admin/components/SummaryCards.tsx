import { Users2, Clock3, BadgeCheck, XCircle } from 'lucide-react'
import type { AdminAccount } from '@/types/database'
import { statusConta } from '../utils'

export function SummaryCards({ contas }: { contas: AdminAccount[] }) {
  const total = contas.length
  const trial = contas.filter((c) => statusConta(c) === 'trial').length
  const pagantes = contas.filter((c) => c.plano === 'pro').length
  const expiradas = contas.filter((c) => statusConta(c) === 'expirado').length

  const cards = [
    { label: 'Contas cadastradas', valor: total, icon: Users2, bg: 'bg-slate-500' },
    { label: 'Em trial', valor: trial, icon: Clock3, bg: 'bg-amber-500' },
    { label: 'Pagantes (pro)', valor: pagantes, icon: BadgeCheck, bg: 'bg-brand-500' },
    { label: 'Expiradas', valor: expiradas, icon: XCircle, bg: 'bg-rose-500' },
  ]

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {cards.map(({ label, valor, icon: Icon, bg }) => (
        <div key={label} className="card p-5">
          <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${bg} text-white`}>
            <Icon size={18} />
          </div>
          <p className="text-2xl font-extrabold text-ink-900">{valor}</p>
          <p className="text-sm font-medium text-slate-600">{label}</p>
        </div>
      ))}
    </div>
  )
}
