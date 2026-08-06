import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { FootIcon } from '@/components/BrandMark'

function AdminLoadingScreen() {
  return (
    <div className="flex h-dvh flex-col items-center justify-center gap-5 bg-slate-950">
      <div className="flex h-16 w-16 animate-pulse items-center justify-center rounded-full bg-white shadow-md ring-1 ring-slate-100">
        <FootIcon />
      </div>
    </div>
  )
}

// Fora do <ProtectedRoute> de propósito (ver App.tsx) — /admin tem layout
// próprio (AdminLayout), não o AppLayout de cliente, então precisa da sua
// própria checagem de sessão/loading em vez de herdar do ProtectedRoute.
//
// Três estados, não dois. `profile` (de onde vem is_admin) começa null e só
// é preenchido depois de um round-trip assíncrono ao Supabase — se o guard
// tratasse "profile ainda não chegou" igual a "não é admin", um admin de
// verdade seria chutado pro /dashboard bem antes do dado real chegar:
//   1. loading=true (authStore ainda inicializando) OU sessão com usuário
//      mas profile ainda null → aguarda, não decide nada ainda. A segunda
//      metade importa mesmo com loading=false: o listener onAuthStateChange
//      do authStore dispara refreshProfile() fora do fluxo que controla
//      `loading`, então existe uma janela real onde loading já é false mas
//      profile ainda não chegou.
//   2. profile carregado e is_admin=true → renderiza a rota admin
//   3. profile carregado e is_admin=false (ou profile nunca chega) →
//      redireciona pro /dashboard
export function AdminRoute({ children }: { children: ReactNode }) {
  const { user, profile, loading } = useAuthStore()

  if (loading) return <AdminLoadingScreen />
  if (!user) return <Navigate to="/login" replace />
  if (!profile) return <AdminLoadingScreen />
  if (!profile.is_admin) return <Navigate to="/dashboard" replace />

  return <AdminLayout>{children}</AdminLayout>
}
