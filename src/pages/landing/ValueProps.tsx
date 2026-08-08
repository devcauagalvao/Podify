import { Bot, ClipboardList, Heart, LayoutGrid } from 'lucide-react'
import { Reveal } from '@/components/Reveal'

// Substitui a métrica de "500+ profissionais"/número de usuários que não
// temos ainda — só claims verdadeiros sobre o que o produto faz.
const VALUE_PROPS = [
  { icon: LayoutGrid, label: 'Tudo em um só lugar', sub: 'Clientes, agenda, financeiro e estoque' },
  { icon: ClipboardList, label: 'Ficha 100% digital', sub: 'Anamnese com assinatura do cliente, sem papel' },
  { icon: Bot, label: 'LIA — IA Podóloga', sub: 'Apoio especializado direto no atendimento' },
  { icon: Heart, label: 'Feito para a rotina real', sub: 'Pensado com podólogos, não adaptado de outro sistema' },
]

export function ValueProps() {
  return (
    <section id="sobre" className="px-4 py-10 sm:px-6">
      <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-brand-800 to-brand-500 px-6 py-16 shadow-xl shadow-brand-900/10 sm:px-10 sm:py-20">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/10 blur-3xl"
        />

        <div className="relative mx-auto max-w-2xl text-center">
          <Reveal>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-4 py-1.5 text-xs font-semibold text-white ring-1 ring-white/20">
              Sobre o Podify
            </span>
          </Reveal>
          <Reveal delay={80}>
            <h2 className="mt-4 font-display text-3xl font-semibold text-white sm:text-4xl">
              Construído para quem cuida de pés — não adaptado de outro sistema.
            </h2>
          </Reveal>
        </div>

        <div className="relative mx-auto mt-12 grid max-w-6xl gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {VALUE_PROPS.map(({ icon: Icon, label, sub }, i) => (
            <Reveal key={label} delay={i * 90}>
              <div className="flex h-full flex-col items-center rounded-2xl border border-white/10 bg-white/10 p-6 text-center text-white backdrop-blur-sm transition hover:-translate-y-1 hover:bg-white/15">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15">
                  <Icon size={24} />
                </div>
                <p className="text-base font-bold">{label}</p>
                <p className="mt-1 text-sm text-white/75">{sub}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
