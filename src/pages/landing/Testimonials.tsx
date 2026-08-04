import { Quote, Star } from 'lucide-react'

// Flag simples — só vira true quando houver depoimentos reais de clientes
// pra colocar aqui. Troque o conteúdo de TESTEMUNHOS abaixo antes de ativar.
export const SHOW_TESTIMONIALS = false

const TESTEMUNHOS = [
  { texto: 'Depoimento real de um cliente do Podify entra aqui.', tag: '' },
  { texto: 'Depoimento real de um cliente do Podify entra aqui.', tag: '' },
  { texto: 'Depoimento real de um cliente do Podify entra aqui.', tag: '' },
]

export function Testimonials() {
  if (!SHOW_TESTIMONIALS) return null

  return (
    <section id="depoimentos" className="px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-4 py-1.5 text-xs font-semibold text-brand-700">
            Quem usa, recomenda
          </span>
          <h2 className="mt-4 text-3xl font-extrabold text-ink-900 sm:text-4xl">
            Profissionais reais. Resultados reais.
          </h2>
          <p className="mt-4 text-slate-600">Depoimentos de quem já usa o Podify no dia a dia da clínica.</p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {TESTEMUNHOS.map((t, i) => (
            <div key={i} className="card relative p-6">
              <Quote size={28} className="absolute right-5 top-5 text-brand-100" />
              <div className="flex gap-0.5 text-amber-400">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star key={j} size={16} fill="currentColor" />
                ))}
              </div>
              <p className="mt-4 text-sm leading-relaxed text-slate-600">&ldquo;{t.texto}&rdquo;</p>
              {t.tag && (
                <span className="mt-4 inline-block rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600">
                  {t.tag}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
