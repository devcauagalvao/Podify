import { Users2, Clock3, DollarSign, ShieldCheck, XCircle } from 'lucide-react'
import type { AdminAccount } from '@/types/database'
import { origemConta, statusConta } from '../utils'

export function SummaryCards({ contas }: { contas: AdminAccount[] }) {
  const total = contas.length
  const pagantesReais = contas.filter((c) => origemConta(c) === 'pagante').length
  const acessoManual = contas.filter((c) => origemConta(c) === 'manual').length
  const trial = contas.filter((c) => statusConta(c) === 'trial').length
  const expiradas = contas.filter((c) => statusConta(c) === 'expirado').length

  const cards = [
    { label: 'Contas cadastradas', valor: total, icon: Users2, bg: 'bg-slate-500' },
    { label: 'Pagantes reais', valor: pagantesReais, icon: DollarSign, bg: 'bg-emerald-500' },
    { label: 'Acesso manual / Cortesia', valor: acessoManual, icon: ShieldCheck, bg: 'bg-blue-500' },
    { label: 'Em trial', valor: trial, icon: Clock3, bg: 'bg-amber-500' },
    { label: 'Expirados', valor: expiradas, icon: XCircle, bg: 'bg-rose-500' },
  ]

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-5">
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
