import { Bot, ClipboardList, Heart, LayoutGrid } from 'lucide-react'

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
    <section className="bg-gradient-to-br from-brand-800 to-brand-500 px-6 py-16">
      <div className="mx-auto grid max-w-6xl gap-10 sm:grid-cols-2 lg:grid-cols-4">
        {VALUE_PROPS.map(({ icon: Icon, label, sub }) => (
          <div key={label} className="flex flex-col items-center text-center text-white">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15">
              <Icon size={24} />
            </div>
            <p className="text-base font-bold">{label}</p>
            <p className="mt-1 text-sm text-white/75">{sub}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
