import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { AppLayout } from '@/components/layout/AppLayout'
import { FootIcon } from '@/components/BrandMark'

export function ProtectedRoute() {
  const { user, loading } = useAuthStore()

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

  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  )
}
