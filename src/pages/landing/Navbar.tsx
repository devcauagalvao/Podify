import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ChevronDown, CreditCard, LayoutGrid, Menu, Sparkles, User, X } from 'lucide-react'
import { FootIcon } from '@/components/BrandMark'

const NAV_LINKS = [
  { href: '#funcionalidades', label: 'Funcionalidades', icon: LayoutGrid },
  { href: '#planos', label: 'Planos', icon: CreditCard },
  { href: '#sobre', label: 'Sobre', icon: User },
]

const RECURSOS_LINKS = [
  { to: '/termos', label: 'Termos de Uso' },
  { to: '/privacidade', label: 'Política de Privacidade' },
]

const MENU_CLOSE_ANIMATION_MS = 150

export function Navbar() {
  const [open, setOpen] = useState(false)
  const [closing, setClosing] = useState(false)

  function closeMenu() {
    if (!open || closing) return
    setClosing(true)
    setTimeout(() => {
      setOpen(false)
      setClosing(false)
    }, MENU_CLOSE_ANIMATION_MS)
  }

  function toggleMenu() {
    if (open) closeMenu()
    else setOpen(true)
  }

  return (
    <header className="fixed inset-x-0 top-0 z-40 px-4 pt-4 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div
          className={`border border-slate-200/70 bg-white/90 shadow-lg shadow-slate-200/50 backdrop-blur-sm transition-[border-radius] duration-300 ${
            open ? 'rounded-[28px]' : 'rounded-full'
          }`}
        >
          <div className="flex items-center justify-between px-4 py-2 sm:px-5">
          <Link to="/" aria-label="Podify" className="shrink-0">
            <FootIcon />
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {NAV_LINKS.slice(0, 2).map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="flex flex-col items-center gap-0.5 rounded-full px-4 py-1 text-slate-500 transition hover:text-brand-600"
              >
                <l.icon size={17} />
                <span className="text-xs font-medium">{l.label}</span>
              </a>
            ))}

            <div className="group relative">
              <button
                type="button"
                className="flex flex-col items-center gap-0.5 rounded-full px-4 py-1 text-slate-500 transition hover:text-brand-600"
              >
                <Sparkles size={17} />
                <span className="flex items-center gap-1 text-xs font-medium">
                  Recursos
                  <ChevronDown size={12} className="transition group-hover:rotate-180" />
                </span>
              </button>
              <div className="invisible absolute left-1/2 top-full z-50 w-52 -translate-x-1/2 pt-3 opacity-0 transition group-hover:visible group-hover:opacity-100">
                <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white py-2 shadow-lg shadow-slate-200/60">
                  {RECURSOS_LINKS.map((r) => (
                    <Link
                      key={r.to}
                      to={r.to}
                      className="block px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-brand-50 hover:text-brand-700"
                    >
                      {r.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {NAV_LINKS.slice(2).map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="flex flex-col items-center gap-0.5 rounded-full px-4 py-1 text-slate-500 transition hover:text-brand-600"
              >
                <l.icon size={17} />
                <span className="text-xs font-medium">{l.label}</span>
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-4 md:flex">
            <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-ink-900">
              Entrar
            </Link>
            <Link
              to="/signup"
              className="group flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-600 to-brand-400 px-5 py-2 text-sm font-semibold text-white shadow-sm shadow-brand-500/30 transition hover:shadow-md hover:shadow-brand-500/40"
            >
              Testar grátis
              <ArrowRight size={16} className="transition group-hover:translate-x-0.5" />
            </Link>
          </div>

          <button
            type="button"
            onClick={toggleMenu}
            className="relative flex h-9 w-9 items-center justify-center rounded-full text-ink-900 md:hidden"
            aria-label={open ? 'Fechar menu' : 'Abrir menu'}
          >
            <Menu size={20} className={`absolute transition-all duration-200 ${open ? 'rotate-90 opacity-0' : 'rotate-0 opacity-100'}`} />
            <X size={20} className={`absolute transition-all duration-200 ${open ? 'rotate-0 opacity-100' : '-rotate-90 opacity-0'}`} />
          </button>
        </div>

        {open && (
          <div className={`overflow-hidden md:hidden ${closing ? 'animate-nav-menu-out' : 'animate-nav-menu-in'}`}>
            <nav className="flex flex-col gap-1 border-t border-slate-100 px-4 pb-4 pt-3">
              {NAV_LINKS.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={closeMenu}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600"
                >
                  <l.icon size={18} className="text-brand-500" /> {l.label}
                </a>
              ))}

              <p className="mt-2 flex items-center gap-2 px-3 text-xs font-bold uppercase tracking-wide text-slate-400">
                <Sparkles size={14} /> Recursos
              </p>
              {RECURSOS_LINKS.map((r) => (
                <Link
                  key={r.to}
                  to={r.to}
                  onClick={closeMenu}
                  className="rounded-xl px-3 py-2.5 pl-11 text-sm font-medium text-slate-600"
                >
                  {r.label}
                </Link>
              ))}

              <div className="mt-3 flex flex-col gap-3 border-t border-slate-100 pt-4">
                <Link to="/login" onClick={closeMenu} className="px-3 text-sm font-medium text-slate-600">
                  Entrar
                </Link>
                <Link
                  to="/signup"
                  onClick={closeMenu}
                  className="flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-brand-600 to-brand-400 py-3 text-center text-sm font-semibold text-white"
                >
                  Testar grátis <ArrowRight size={16} />
                </Link>
              </div>
            </nav>
          </div>
        )}
        </div>
      </div>
    </header>
  )
}
