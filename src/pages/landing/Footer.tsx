import { Link } from 'react-router-dom'
import { Mail, MessageCircle, ShieldCheck } from 'lucide-react'
import { FootIcon } from '@/components/BrandMark'
import glvLogoUrl from '@/assets/logos/glv-tecnologia.png'
import { SUPPORT_EMAIL, SUPPORT_PHONE_DISPLAY, SUPPORT_WHATSAPP_URL } from '@/lib/contact'
import { SHOW_TESTIMONIALS } from './Testimonials'

export function Footer() {
  return (
    <footer className="bg-ink-900 px-6 pt-16 text-white">
      <div className="mx-auto grid max-w-6xl gap-10 pb-12 sm:grid-cols-3">
        <div>
          <div className="flex items-center gap-2">
            <FootIcon />
            <span className="font-display text-lg font-semibold">Podify</span>
          </div>
          <p className="mt-3 max-w-xs text-sm text-white/60">
            Plataforma de gestão completa para podólogos e clínicas de podologia. Mais tempo
            cuidando de pessoas, menos tempo com burocracia.
          </p>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-white/50">Links</p>
          <nav className="mt-4 flex flex-col gap-2.5 text-sm text-white/70">
            <a href="#funcionalidades" className="hover:text-white">
              Funcionalidades
            </a>
            {SHOW_TESTIMONIALS && (
              <a href="#depoimentos" className="hover:text-white">
                Depoimentos
              </a>
            )}
            <a href="#planos" className="hover:text-white">
              Planos
            </a>
            <Link to="/termos" className="hover:text-white">
              Termos de Uso
            </Link>
            <Link to="/privacidade" className="hover:text-white">
              Política de Privacidade
            </Link>
          </nav>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-white/50">Suporte Podify</p>
          <div className="mt-4 flex flex-col gap-3 text-sm text-white/70">
            <a
              href={SUPPORT_WHATSAPP_URL}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2.5 hover:text-white"
            >
              <MessageCircle size={16} /> WhatsApp: {SUPPORT_PHONE_DISPLAY}
            </a>
            <a href={`mailto:${SUPPORT_EMAIL}`} className="flex items-center gap-2.5 hover:text-white">
              <Mail size={16} /> {SUPPORT_EMAIL}
            </a>
          </div>
          <a
            href="https://glvtecnologia.com.br"
            target="_blank"
            rel="noreferrer"
            className="mt-6 inline-block w-fit opacity-90 transition hover:opacity-100"
          >
            <img src={glvLogoUrl} alt="by GLV Tecnologia" className="h-12 w-auto object-contain" />
          </a>
        </div>
      </div>

      <div className="flex flex-col items-center justify-between gap-3 border-t border-white/10 py-6 text-xs text-white/50 sm:flex-row">
        <span className="flex items-center gap-1.5">
          <ShieldCheck size={14} /> Dados protegidos com criptografia SSL
        </span>
        <span>© {new Date().getFullYear()} Podify. Todos os direitos reservados.</span>
      </div>
    </footer>
  )
}
