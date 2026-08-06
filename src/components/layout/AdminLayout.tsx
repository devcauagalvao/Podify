import type { ReactNode } from 'react'
import { LogOut, ShieldCheck } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'

/** Layout exclusivo de /admin — deliberadamente nada parecido com o
 * AppLayout do cliente (sem Sidebar, sem logo do Podify, paleta escura).
 * Isso é intencional: quem está aqui precisa perceber de cara que não é
 * "sou um cliente usando o sistema", é "sou o admin olhando tudo por
 * cima" — não reaproveita AppLayout nem o Sidebar de navegação. */
export function AdminLayout({ children }: { children: ReactNode }) {
  const signOut = useAuthStore((s) => s.signOut)

  return (
    <div className="min-h-dvh bg-slate-950 text-slate-100">
      <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-900/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-500/15 text-brand-400 ring-1 ring-brand-500/30">
              <ShieldCheck size={18} />
            </div>
            <div className="leading-tight">
              <p className="text-sm font-bold tracking-wide text-white">Podify Admin</p>
              <p className="text-[11px] text-slate-500">Painel interno — não visível para clientes</p>
            </div>
          </div>
          <button
            onClick={signOut}
            className="flex min-h-[40px] items-center gap-2 rounded-lg border border-slate-700 px-3.5 text-sm font-medium text-slate-300 transition hover:border-slate-600 hover:bg-slate-800 hover:text-white"
          >
            <LogOut size={16} /> Sair
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">{children}</main>
    </div>
  )
}
