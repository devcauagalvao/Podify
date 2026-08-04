import { Link } from 'react-router-dom'
import { Sparkles } from 'lucide-react'

export function FinalCta() {
  return (
    <section className="bg-gradient-to-br from-brand-800 to-brand-500 px-6 py-20 text-center text-white">
      <div className="mx-auto max-w-2xl">
        <h2 className="text-3xl font-extrabold sm:text-4xl">Sua clínica no próximo nível.</h2>
        <p className="mt-4 text-white/85">Comece hoje e sinta a diferença já nos primeiros atendimentos.</p>
        <p className="mt-2 text-white/85">
          Não fique para trás. Cada dia sem o Podify é um dia de burocracia que poderia ser um
          dia de atendimento.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            to="/signup"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-white px-8 py-4 text-base font-bold text-brand-700 shadow-md hover:bg-white/90 sm:w-auto"
          >
            <Sparkles size={18} /> Criar conta grátis agora
          </Link>
          <Link
            to="/login"
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/40 px-8 py-4 text-base font-semibold text-white hover:bg-white/10 sm:w-auto"
          >
            Já tenho conta
          </Link>
        </div>

        <p className="mt-4 text-xs text-white/70">Acesso imediato · Cancele quando quiser · Sem compromisso</p>
      </div>
    </section>
  )
}
