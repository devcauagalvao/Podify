import { Check, Infinity as InfinityIcon } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'

const RECURSOS = [
  'Pacientes ilimitados',
  'Fichas de anamnese',
  'Agenda completa',
  'Controle financeiro',
  'Controle de estoque',
  'LIA — IA Podóloga',
  'Registro fotográfico',
  'Assinatura digital',
]

export default function Assinatura() {
  const profile = useAuthStore((s) => s.profile)
  const ilimitado = profile?.plano === 'pro' && !profile?.assinatura_expira_em

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-ink-900">Assinatura</h1>
        <p className="text-sm text-slate-500">Gerencie seu plano PODIFY</p>
      </div>

      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-600 to-brand-300 p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20">
              <span className="text-xl">🦶</span>
            </div>
            <div>
              <p className="font-bold">PODIFY Pro</p>
              <p className="text-sm text-white/85">Acesso ilimitado</p>
            </div>
          </div>
          <span className="rounded-full bg-white/25 px-3 py-1 text-xs font-bold">
            {ilimitado ? 'Ilimitado' : profile?.plano ?? 'Trial'}
          </span>
        </div>
        {ilimitado && (
          <p className="mt-4 flex items-center gap-2 text-sm text-white/85">
            <InfinityIcon size={16} /> Acesso liberado pelo administrador — sem expiração
          </p>
        )}
      </div>

      <div className="card p-6">
        <p className="mb-4 flex items-center gap-2 font-bold text-ink-900">⭐ O que está incluído</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {RECURSOS.map((r) => (
            <div key={r} className="flex items-center gap-2 text-sm text-slate-600">
              <Check size={16} className="text-emerald-500" /> {r}
            </div>
          ))}
        </div>
      </div>

      {ilimitado ? (
        <div className="rounded-2xl bg-emerald-50 p-5 text-sm text-emerald-800">
          <p className="font-semibold">Acesso ilimitado ativo</p>
          <p className="mt-1 text-emerald-700">
            Seu acesso foi liberado pelo administrador sem data de expiração. Aproveite todos os
            recursos!
          </p>
        </div>
      ) : (
        <button className="btn-brand w-full py-3">Assinar Podify Pro — cobrança mensal via Pix</button>
      )}
    </div>
  )
}
