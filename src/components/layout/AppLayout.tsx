import { useEffect, useState, type ReactNode } from 'react'
import { Menu, X } from 'lucide-react'
import { clsx } from 'clsx'
import { Sidebar } from './Sidebar'

export function AppLayout({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false)

  // Trava o scroll da página por trás enquanto o drawer mobile está aberto
  // (senão o conteúdo por trás rola junto no touch/scroll do celular).
  // Usa position:fixed pra travar de verdade no iOS e restaura a posição
  // de rolagem exata ao fechar.
  useEffect(() => {
    if (!mobileOpen) return
    const scrollY = window.scrollY
    const { style } = document.body
    style.position = 'fixed'
    style.top = `-${scrollY}px`
    style.left = '0'
    style.right = '0'
    style.overflow = 'hidden'
    return () => {
      style.position = ''
      style.top = ''
      style.left = ''
      style.right = ''
      style.overflow = ''
      window.scrollTo(0, scrollY)
    }
  }, [mobileOpen])

  function closeMobile() {
    setMobileOpen(false)
  }

  return (
    <div className="flex h-dvh overflow-hidden bg-surface">
      {/* Sidebar fixa — desktop */}
      <aside className="hidden w-72 shrink-0 border-r border-slate-100 lg:block">
        <Sidebar />
      </aside>

      {/* Sidebar drawer — mobile. Fica sempre montada (visibilidade via
          translate-x) pra transição de slide ficar suave, sem flash de
          aparecer/sumir abruptamente. z-[60] fica acima de qualquer Modal
          (z-50), então o drawer continua visível por cima se for aberto
          com um modal atrás dele. */}
      <div
        className={clsx('fixed inset-0 z-[60] lg:hidden', mobileOpen ? 'pointer-events-auto' : 'pointer-events-none')}
        aria-hidden={!mobileOpen}
      >
        <div
          className={clsx(
            'absolute inset-0 bg-black/40 transition-opacity duration-300',
            mobileOpen ? 'opacity-100' : 'opacity-0'
          )}
          onClick={closeMobile}
        />
        <aside
          className={clsx(
            'absolute inset-y-0 left-0 w-72 max-w-[85vw] overflow-y-auto bg-white shadow-xl transition-transform duration-300 ease-out',
            mobileOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          <button
            onClick={closeMobile}
            className="absolute right-3 top-3 z-10 flex h-11 w-11 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
          >
            <X size={20} />
          </button>
          <Sidebar onNavigate={closeMobile} />
        </aside>
      </div>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Top bar — mobile only. z-[55]: fica acima de qualquer Modal
            (z-50) pra o botão de menu continuar clicável mesmo com um
            modal aberto — senão o backdrop do modal bloqueia o toque nele
            e o usuário nunca consegue abrir o drawer por cima. Continua
            abaixo do drawer (z-[60]), que deve cobrir tudo quando aberto. */}
        <header className="relative z-[55] flex items-center justify-between border-b border-slate-100 bg-white px-4 py-2 lg:hidden">
          <button
            onClick={() => setMobileOpen(true)}
            className="flex h-11 w-11 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100"
          >
            <Menu size={22} />
          </button>
          <span className="text-lg font-extrabold text-ink-900">
            <span className="text-brand-500">P</span>ODIFY
          </span>
          <div className="w-11" />
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  )
}
