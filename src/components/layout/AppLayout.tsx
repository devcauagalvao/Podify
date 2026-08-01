import { useState, type ReactNode } from 'react'
import { Menu, X } from 'lucide-react'
import { Sidebar } from './Sidebar'

export function AppLayout({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-surface">
      {/* Sidebar fixa — desktop */}
      <aside className="hidden w-72 shrink-0 border-r border-slate-100 lg:block">
        <Sidebar />
      </aside>

      {/* Sidebar drawer — mobile */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 w-72 shadow-xl">
            <div className="flex justify-end p-3">
              <button
                onClick={() => setMobileOpen(false)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>
            <div className="-mt-14">
              <Sidebar onNavigate={() => setMobileOpen(false)} />
            </div>
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Top bar — mobile only */}
        <header className="flex items-center justify-between border-b border-slate-100 bg-white px-4 py-3 lg:hidden">
          <button
            onClick={() => setMobileOpen(true)}
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
          >
            <Menu size={22} />
          </button>
          <span className="text-lg font-extrabold text-ink-900">
            <span className="text-brand-500">P</span>ODIFY
          </span>
          <div className="w-9" />
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  )
}
