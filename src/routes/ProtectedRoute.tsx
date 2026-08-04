import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { AppLayout } from '@/components/layout/AppLayout'
import { FootIcon } from '@/components/BrandMark'

export function ProtectedRoute() {
  const { user, profile, loading } = useAuthStore()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex h-dvh flex-col items-center justify-center gap-5 bg-surface">
        <div className="flex h-16 w-16 animate-pulse items-center justify-center rounded-full bg-white shadow-md ring-1 ring-slate-100">
          <FootIcon />
        </div>
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />

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
