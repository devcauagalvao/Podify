import { Users2, Clock3, BadgeCheck, XCircle } from 'lucide-react'
import type { AdminAccount } from '@/types/database'
import { statusConta } from '../utils'

export function SummaryCards({ contas }: { contas: AdminAccount[] }) {
  const total = contas.length
  const trial = contas.filter((c) => statusConta(c) === 'trial').length
  const pagantes = contas.filter((c) => c.plano === 'pro').length
  const expiradas = contas.filter((c) => statusConta(c) === 'expirado').length

  const cards = [
    { label: 'Contas cadastradas', valor: total, icon: Users2, cor: 'text-slate-300' },
    { label: 'Em trial', valor: trial, icon: Clock3, cor: 'text-amber-400' },
    { label: 'Pagantes (pro)', valor: pagantes, icon: BadgeCheck, cor: 'text-brand-400' },
    { label: 'Expiradas', valor: expiradas, icon: XCircle, cor: 'text-rose-400' },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      {cards.map(({ label, valor, icon: Icon, cor }) => (
        <div key={label} className="rounded-2xl border border-slate-800 bg-slate-900 p-4 sm:p-5">
          <div className={`mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-slate-800 ${cor}`}>
            <Icon size={18} />
          </div>
          <p className="text-2xl font-extrabold text-white">{valor}</p>
          <p className="text-xs text-slate-500">{label}</p>
        </div>
      ))}
    </div>
  )
}
