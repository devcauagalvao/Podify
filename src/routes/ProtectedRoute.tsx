import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { AppLayout } from '@/components/layout/AppLayout'
import { SessionLoadingScreen } from '@/components/SessionLoadingScreen'

export function ProtectedRoute() {
  const { user, profile, loading } = useAuthStore()
  const location = useLocation()

  if (loading) return <SessionLoadingScreen />
  if (!user) return <Navigate to="/login" replace />

  // Chegada em /dashboard (destino padrão pós-login, inclusive do callback
  // do Google OAuth) com conta admin: manda direto pro /admin. Só decide
  // isso depois que o profile (de onde vem is_admin) realmente carregou —
  // ele é populado depois do user, então decidir antes podia mandar um
  // admin de verdade pro dashboard de cliente (mesma corrida corrigida no
  // AdminRoute.tsx). Só espera nessa rota específica — as demais mantêm o
  // comportamento de sempre, sem travar renderização por causa disso.
  if (location.pathname === '/dashboard' && !profile) return <SessionLoadingScreen />
  if (profile?.is_admin && location.pathname === '/dashboard') {
    return <Navigate to="/admin" replace />
  }

  // plano/assinatura_expira_em/trial_expira_em nulos (trial vitalício ou
  // pro liberado manualmente) nunca bloqueiam — só vence quem tem data de
  // corte definida.
  const assinaturaVencida =
    profile?.plano === 'expirado' ||
    (profile?.plano === 'trial' && !!profile?.trial_expira_em && new Date(profile.trial_expira_em) < new Date()) ||
    (!!profile?.assinatura_expira_em && new Date(profile.assinatura_expira_em) < new Date())

  if (assinaturaVencida && location.pathname !== '/assinatura') {
    return <Navigate to="/assinatura" replace />
  }

  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  )
}
