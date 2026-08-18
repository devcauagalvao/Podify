import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUp, ShieldCheck } from 'lucide-react'
import { FootIcon } from '@/components/BrandMark'
import glvLogoUrl from '@/assets/logos/glv-tecnologia.png'
import { SUPPORT_EMAIL, SUPPORT_PHONE_DISPLAY, SUPPORT_WHATSAPP_URL } from '@/lib/contact'
import { SHOW_TESTIMONIALS } from './Testimonials'

function FooterRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2 border-b border-white/10 py-5 sm:flex-row sm:gap-6">
      <p className="w-28 shrink-0 text-xs font-bold uppercase tracking-wide text-white/50">{label}</p>
      <div className="flex flex-wrap items-center gap-x-8 gap-y-2 text-sm text-white/70 sm:border-l sm:border-white/15 sm:pl-6">
        {children}
      </div>
    </div>
  )
}

export function Footer() {
  return (
    <footer className="bg-ink-900 px-6 pt-10 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center justify-between border-b border-white/15 pb-5">
          <div className="flex items-center gap-2">
            <FootIcon />
            <span className="font-display text-lg font-semibold">Podify</span>
          </div>
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-white/60 transition hover:text-white"
          >
            Voltar ao topo <ArrowUp size={13} />
          </button>
        </div>

        <div className="py-2">
          <FooterRow label="Sobre">
            <a href="#funcionalidades" className="hover:text-white">
              Funcionalidades
            </a>
            <a href="#planos" className="hover:text-white">
              Planos
            </a>
            {SHOW_TESTIMONIALS && (
              <a href="#depoimentos" className="hover:text-white">
                Depoimentos
              </a>
            )}
            <Link to="/termos" className="hover:text-white">
              Termos de Uso
            </Link>
            <Link to="/privacidade" className="hover:text-white">
              Política de Privacidade
            </Link>
          </FooterRow>

          <FooterRow label="Contato">
            <a href={SUPPORT_WHATSAPP_URL} target="_blank" rel="noreferrer" className="hover:text-white">
              WhatsApp: {SUPPORT_PHONE_DISPLAY}
            </a>
            <a href={`mailto:${SUPPORT_EMAIL}`} className="hover:text-white">
              {SUPPORT_EMAIL}
            </a>
          </FooterRow>

          <FooterRow label="Segurança">
            <span className="flex items-center gap-1.5">
              <ShieldCheck size={14} /> Dados protegidos com criptografia SSL
            </span>
          </FooterRow>
        </div>

        <div className="flex flex-col gap-4 py-6 sm:flex-row sm:items-center sm:justify-between">
          <a
            href="https://glvtecnologia.com.br"
            target="_blank"
            rel="noreferrer"
            className="inline-block w-fit opacity-90 transition hover:opacity-100"
          >
            <img src={glvLogoUrl} alt="by GLV Tecnologia" className="h-20 w-auto object-contain" loading="lazy" />
          </a>
          <div className="flex flex-col gap-1 sm:items-end">
            <span className="font-display text-sm font-bold uppercase tracking-[0.25em] text-white">Podify</span>
            <span className="text-xs text-white/50">© {new Date().getFullYear()} Podify. Todos os direitos reservados.</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
