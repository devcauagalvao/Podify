import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { FootIcon } from '@/components/BrandMark'
import { SHOW_TESTIMONIALS } from './Testimonials'

const NAV_LINKS = [
  { href: '#funcionalidades', label: 'Funcionalidades' },
  ...(SHOW_TESTIMONIALS ? [{ href: '#depoimentos', label: 'Depoimentos' }] : []),
  { href: '#planos', label: 'Planos' },
]

export function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 border-b border-slate-100/80 bg-white/85 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-2">
          <FootIcon />
          <span className="text-lg font-extrabold tracking-tight text-ink-900">PODIFY</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((l) => (
            <a key={l.href} href={l.href} className="text-sm font-medium text-slate-600 hover:text-ink-900">
              {l.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-ink-900">
            Entrar
          </Link>
          <Link to="/signup" className="btn-brand px-5 py-2.5 text-sm">
            Testar grátis
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-ink-900 md:hidden"
          aria-label={open ? 'Fechar menu' : 'Abrir menu'}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div className="border-t border-slate-100 bg-white px-6 py-4 md:hidden">
          <nav className="flex flex-col gap-4">
            {NAV_LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="text-sm font-medium text-slate-600"
              >
                {l.label}
              </a>
            ))}
            <Link to="/login" onClick={() => setOpen(false)} className="text-sm font-medium text-slate-600">
              Entrar
            </Link>
            <Link to="/signup" onClick={() => setOpen(false)} className="btn-brand py-2.5 text-center text-sm">
              Testar grátis
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}
