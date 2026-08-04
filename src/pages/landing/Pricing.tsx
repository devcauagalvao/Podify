import { Link } from 'react-router-dom'
import { Check, Gift, Lock, ShieldCheck, Sparkles } from 'lucide-react'

const RECURSOS = [
  'Clientes ilimitados',
  'Anamnese digital completa',
  'Agenda inteligente',
  'Controle financeiro',
  'Gestão de estoque',
  'LIA — IA Podóloga exclusiva',
  'Assinatura digital do cliente',
  'Relatórios e métricas',
  'Fotos clínicas do cliente',
  'Acesso em qualquer dispositivo',
]

export function Pricing() {
  return (
    <section id="planos" className="bg-brand-50/60 px-6 py-20">
      <div className="mx-auto max-w-3xl text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-1.5 text-xs font-semibold text-brand-700 shadow-sm">
          Preço simples e justo
        </span>
        <p className="mt-6 text-5xl font-extrabold text-ink-900">
          R$ 29,90<span className="text-xl font-semibold text-slate-500">/mês</span>
        </p>
        <p className="mt-2 text-slate-600">Acesso completo. Sem surpresas.</p>
        <p className="mt-1 font-semibold text-brand-700">Os primeiros 7 dias são totalmente gratuitos.</p>

        <div className="mt-10 overflow-hidden rounded-3xl bg-white text-left shadow-xl shadow-brand-900/5">
          <div className="flex items-center justify-between bg-gradient-to-br from-brand-700 to-brand-500 px-8 py-6 text-white">
            <div>
              <p className="text-xs font-medium text-white/75">Plano único</p>
              <p className="text-xl font-extrabold">PODIFY PRO</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-extrabold">R$ 29,90</p>
              <p className="text-xs text-white/75">/mês · tudo incluso</p>
            </div>
          </div>

          <div className="grid gap-3 p-8 sm:grid-cols-2">
            {RECURSOS.map((r) => (
              <div key={r} className="flex items-center gap-2.5 text-sm text-slate-700">
                <Check size={16} className="shrink-0 text-brand-500" /> {r}
              </div>
            ))}
          </div>

          <div className="px-8 pb-8">
            <Link to="/signup" className="btn-brand flex w-full items-center justify-center gap-2 py-4 text-base">
              <Sparkles size={18} /> Começar grátis por 7 dias
            </Link>
            <p className="mt-3 text-center text-xs text-slate-400">Sem compromisso. Cancele quando quiser.</p>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 border-t border-slate-100 pt-6 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <ShieldCheck size={14} /> Pagamento seguro
              </span>
              <span className="flex items-center gap-1.5">
                <Lock size={14} /> Sem fidelidade
              </span>
              <span className="flex items-center gap-1.5">
                <Gift size={14} /> 7 dias grátis
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
