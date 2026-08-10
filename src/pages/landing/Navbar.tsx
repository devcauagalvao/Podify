import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ChevronDown, CreditCard, LayoutGrid, Menu, Sparkles, User, X } from 'lucide-react'
import { clsx } from 'clsx'
import { FootIcon } from '@/components/BrandMark'
import { useLockBodyScroll } from '@/hooks/useLockBodyScroll'

const NAV_LINKS = [
  { href: '#funcionalidades', label: 'Funcionalidades', icon: LayoutGrid },
  { href: '#planos', label: 'Planos', icon: CreditCard },
  { href: '#sobre', label: 'Sobre', icon: User },
]

const RECURSOS_LINKS = [
  { to: '/termos', label: 'Termos de Uso' },
  { to: '/privacidade', label: 'Política de Privacidade' },
]

export function Navbar() {
  const [open, setOpen] = useState(false)

  useLockBodyScroll(open)

  function closeMenu() {
    setOpen(false)
  }

  function toggleMenu() {
    setOpen((o) => !o)
  }

  // Links de âncora (#planos etc.) rolam a própria landing, não navegam de
  // rota — interceptamos pra fechar o menu e rolar manualmente. O scroll do
  // body só é destravado quando o cleanup do useLockBodyScroll roda (efeito
  // assíncrono, depois do commit de `open=false`), então rolar na mesma
  // chamada síncrona não tem efeito nenhum (um body position:fixed não
  // rola). Dois rAF garantem que já passou um ciclo de commit+paint antes
  // de tentar rolar.
  function handleAnchorClick(e: React.MouseEvent, href: string) {
    e.preventDefault()
    closeMenu()
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        document.querySelector(href)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      })
    })
  }

  return (
    <header className="fixed inset-x-0 top-0 z-40 px-4 pt-4 sm:px-6">
      <div className="mx-auto max-w-6xl">
        {/* O próprio card do header é o menu — no mobile ele cresce de um
            pill compacto (logo + botão, com uma folga mínima de 13rem) pra
            ocupar a largura toda, revelando os links abaixo, em vez de
            abrir um painel separado por cima da página. Mesmo padrão do
            menu mobile do site da GLV (glvtecnologia.com.br): raio de
            borda SEMPRE constante (nunca varia entre um valor "pill" e
            outro "quadrado", o que causava a distorção em blob na primeira
            tentativa) — só a largura anima, suave. No desktop o card
            sempre ocupa a largura toda (md:w-full), já que ali mostra o
            nav completo o tempo todo, sem botão de menu. */}
        <div
          className={clsx(
            'mx-auto flex flex-col overflow-hidden rounded-[28px] border border-slate-200/70 shadow-lg shadow-slate-200/50 transition-[width] duration-300 ease-out md:w-full',
            open ? 'w-full bg-white' : 'w-[13rem] bg-white/90 backdrop-blur-sm'
          )}
        >
          <div className="flex shrink-0 items-center justify-between gap-6 px-5 py-2.5">
            <Link to="/" aria-label="Podify" className="shrink-0" onClick={closeMenu}>
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
              className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-ink-900 md:hidden"
              aria-label={open ? 'Fechar menu' : 'Abrir menu'}
              aria-expanded={open}
            >
              <Menu size={20} className={`absolute transition-all duration-200 ${open ? 'rotate-90 opacity-0' : 'rotate-0 opacity-100'}`} />
              <X size={20} className={`absolute transition-all duration-200 ${open ? 'rotate-0 opacity-100' : '-rotate-90 opacity-0'}`} />
            </button>
          </div>

          {/* Sempre montado (nunca desmonta o conteúdo) — é o que permite
              animar suavemente até a altura real dele em vez de só
              aparecer/sumir seco. `grid-rows-[0fr]→[1fr]` é o truque pra
              transicionar até "altura automática" sem precisar medir nada
              em JS; o `overflow-hidden` interno garante que nada vaza
              enquanto a linha ainda está encolhida. */}
          <div
            className={clsx(
              'grid transition-[grid-template-rows,opacity] duration-300 ease-out md:hidden',
              open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
            )}
            aria-hidden={!open}
          >
            <div className="overflow-hidden">
              <div className="mx-5 border-t border-slate-100" />

              <nav className="flex flex-col gap-2 px-5 pb-2 pt-4">
                {NAV_LINKS.map((l) => (
                  <a
                    key={l.href}
                    href={l.href}
                    tabIndex={open ? undefined : -1}
                    onClick={(e) => handleAnchorClick(e, l.href)}
                    className="flex min-h-[44px] items-center gap-3 rounded-2xl bg-brand-50 px-4 py-3.5 text-base font-semibold text-ink-900"
                  >
                    <l.icon size={19} className="text-brand-600" /> {l.label}
                  </a>
                ))}

                <p className="mt-3 px-1 text-xs font-bold uppercase tracking-wide text-slate-400">Recursos</p>
                {RECURSOS_LINKS.map((r) => (
                  <Link
                    key={r.to}
                    to={r.to}
                    tabIndex={open ? undefined : -1}
                    onClick={closeMenu}
                    className="flex min-h-[44px] items-center rounded-xl px-4 py-3 text-base font-medium text-slate-600 hover:bg-slate-50"
                  >
                    {r.label}
                  </Link>
                ))}

                <Link
                  to="/login"
                  tabIndex={open ? undefined : -1}
                  onClick={closeMenu}
                  className="mt-1 flex min-h-[44px] items-center justify-center rounded-2xl border border-slate-200 px-4 py-3 text-base font-medium text-slate-600"
                >
                  Entrar
                </Link>
              </nav>

              <div className="px-5 pb-5 pt-3">
                <Link
                  to="/signup"
                  tabIndex={open ? undefined : -1}
                  onClick={closeMenu}
                  className="flex min-h-[44px] items-center justify-center gap-2 rounded-2xl bg-brand-500 py-3.5 text-center text-base font-semibold text-white"
                >
                  Começar 7 dias grátis <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
