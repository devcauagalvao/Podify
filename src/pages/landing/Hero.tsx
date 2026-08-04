import { Link } from 'react-router-dom'
import { Check, Sparkles } from 'lucide-react'
import dashboardPreview from '@/assets/landing/dashboard-preview.png'
import { Reveal } from '@/components/Reveal'

const TRUST_ITEMS = ['Cancele quando quiser', 'Sem compromisso', 'Dados protegidos e criptografados', 'Acesso imediato']

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-brand-50 via-surface to-surface px-6 pb-20 pt-28 sm:pt-32">
      <div
        aria-hidden
        className="pointer-events-none absolute -left-32 -top-24 h-96 w-96 rounded-full bg-brand-200/40 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 top-20 h-80 w-80 rounded-full bg-brand-400/20 blur-3xl"
      />

      <div className="relative mx-auto max-w-4xl text-center">
        <Reveal>
          <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-xs font-semibold text-brand-700 shadow-sm ring-1 ring-brand-100 sm:text-sm">
            <Sparkles size={14} className="text-brand-500" />
            Feito para podólogos, direto da rotina real de clínica
          </span>
        </Reveal>

        <Reveal delay={80}>
          <h1 className="mt-6 font-display text-4xl font-semibold leading-[1.08] tracking-tight text-ink-900 sm:text-5xl lg:text-6xl">
            O sistema que transforma{' '}
            <span className="bg-gradient-to-r from-brand-600 to-brand-400 bg-clip-text italic text-transparent">
              sua clínica
            </span>{' '}
            em referência.
          </h1>
        </Reveal>

        <Reveal delay={140}>
          <p className="mx-auto mt-6 max-w-2xl text-base text-slate-600 sm:text-lg">
            Gestão completa para podólogos e podólogas que querem mais tempo para cuidar das
            pessoas — e menos tempo com burocracia.
          </p>
        </Reveal>

        <Reveal delay={200}>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              to="/signup"
              className="btn-brand flex w-full items-center justify-center gap-2 px-8 py-4 text-base transition hover:-translate-y-0.5 sm:w-auto"
            >
              <Sparkles size={18} /> Começar 7 dias grátis
            </Link>
            <a
              href="#funcionalidades"
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-8 py-4 text-base font-semibold text-ink-900 transition hover:-translate-y-0.5 hover:bg-slate-50 sm:w-auto"
            >
              Ver como funciona
            </a>
          </div>
        </Reveal>

        <Reveal delay={260}>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            {TRUST_ITEMS.map((item) => (
              <span key={item} className="flex items-center gap-1.5 text-xs font-medium text-slate-500 sm:text-sm">
                <Check size={14} className="text-brand-500" /> {item}
              </span>
            ))}
          </div>
        </Reveal>
      </div>

      <Reveal delay={320} className="relative mx-auto mt-14 max-w-5xl">
        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-2xl shadow-brand-900/10">
          <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50 px-4 py-3">
            <span className="h-3 w-3 rounded-full bg-rose-300" />
            <span className="h-3 w-3 rounded-full bg-amber-300" />
            <span className="h-3 w-3 rounded-full bg-emerald-300" />
            <span className="ml-3 truncate rounded-md bg-white px-3 py-1 text-xs text-slate-400 ring-1 ring-slate-100">
              app.podify.com.br/dashboard
            </span>
          </div>
          <img src={dashboardPreview} alt="Painel do Podify em uso" className="w-full" />
        </div>
        <p className="mt-3 text-center text-xs text-slate-400">
          Print real do painel do Podify — dados de exemplo.
        </p>
      </Reveal>
    </section>
  )
}
