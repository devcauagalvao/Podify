import { Link } from 'react-router-dom'
import { Sparkles } from 'lucide-react'
import { Reveal } from '@/components/Reveal'

export function FinalCta() {
  return (
    <section className="px-4 py-10 sm:px-6">
      <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-brand-800 to-brand-500 px-6 py-16 text-center text-white shadow-xl shadow-brand-900/10 sm:px-10 sm:py-20">
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
          className="pointer-events-none absolute -left-20 -bottom-20 h-72 w-72 rounded-full bg-white/10 blur-3xl"
        />

        <Reveal className="relative mx-auto max-w-2xl">
          <h2 className="font-display text-3xl font-semibold sm:text-4xl">Sua clínica no próximo nível.</h2>
          <p className="mt-4 text-white/85">Comece hoje e sinta a diferença já nos primeiros atendimentos.</p>
          <p className="mt-2 text-white/85">
            Não fique para trás. Cada dia sem o Podify é um dia de burocracia que poderia ser um
            dia de atendimento.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              to="/signup"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-white px-8 py-4 text-base font-bold text-brand-700 shadow-md transition hover:-translate-y-0.5 hover:scale-[1.02] hover:bg-white/90 sm:w-auto"
            >
              <Sparkles size={18} /> Criar conta grátis agora
            </Link>
            <Link
              to="/login"
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/40 px-8 py-4 text-base font-semibold text-white transition hover:-translate-y-0.5 hover:bg-white/10 sm:w-auto"
            >
              Já tenho conta
            </Link>
          </div>

          <p className="mt-4 text-xs text-white/70">Acesso imediato · Cancele quando quiser · Sem compromisso</p>
        </Reveal>
      </div>
    </section>
  )
}
