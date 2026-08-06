import { FootIcon } from '@/components/BrandMark'

/** Tela de espera genérica pra qualquer momento em que a sessão ou o
 * profile do usuário ainda estão carregando (ProtectedRoute, AdminRoute,
 * Login) — nunca decida rota nenhuma antes desse estado resolver. */
export function SessionLoadingScreen() {
  return (
    <div className="flex h-dvh flex-col items-center justify-center gap-5 bg-surface">
      <div className="flex h-16 w-16 animate-pulse items-center justify-center rounded-full bg-white shadow-md ring-1 ring-slate-100">
        <FootIcon />
      </div>
    </div>
  )
}
