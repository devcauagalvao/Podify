import type { ReactNode } from 'react'
import { LogOut, ShieldCheck } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'

/** Layout exclusivo de /admin — sem Sidebar de navegação de cliente (só
 * essa parte muda). A paleta é a mesma do resto do app (brand/ink/surface
 * de tailwind.config.js); o que marca a área como "diferente" é a barra
 * superior com gradiente ocupando a largura toda (no cliente o gradiente
 * fica dentro da página, no Dashboard) e o selo "Admin" ao lado da logo. */
export function AdminLayout({ children }: { children: ReactNode }) {
  const signOut = useAuthStore((s) => s.signOut)

  return (
    <div className="min-h-dvh bg-surface">
      <header className="sticky top-0 z-40 bg-gradient-to-r from-brand-600 to-brand-300 shadow-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15 text-white ring-1 ring-white/30">
              <ShieldCheck size={18} />
            </div>
            <div className="leading-tight">
              <p className="flex items-center gap-2 text-sm font-bold text-white">
                Podify
                <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                  Admin
                </span>
              </p>
              <p className="text-[11px] text-white/80">Painel interno — não visível para clientes</p>
            </div>
          </div>
          <button
            onClick={signOut}
            className="flex min-h-[40px] items-center gap-2 rounded-lg bg-white/10 px-3.5 text-sm font-medium text-white transition hover:bg-white/20"
          >
            <LogOut size={16} /> Sair
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">{children}</main>
    </div>
  )
}
