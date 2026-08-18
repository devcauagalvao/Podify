import { useState, type FormEvent } from 'react'
import { Navigate, Link, useLocation } from 'react-router-dom'
import { Mail, Lock } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { AuthCard, AuthHeader, GoogleIcon } from '@/components/BrandMark'
import { SessionLoadingScreen } from '@/components/SessionLoadingScreen'
import { SUPPORT_WHATSAPP_URL, SUPPORT_EMAIL } from '@/lib/contact'
import glvLogo from '@/assets/logos/glv-tecnologia.png'

export default function Login() {
  const { user, profile, signInWithPassword, signInWithGoogle } = useAuthStore()
  const location = useLocation()
  const passwordResetSuccess = Boolean(
    (location.state as { passwordResetSuccess?: boolean } | null)?.passwordResetSuccess,
  )
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  if (user) {
    // profile (de onde vem is_admin) é populado depois do user — decidir o
    // destino antes dele chegar podia mandar um admin de verdade pro
    // /dashboard de cliente por engano (mesma corrida corrigida no
    // AdminRoute.tsx).
    if (!profile) return <SessionLoadingScreen />
    return <Navigate to={profile.is_admin ? '/admin' : '/dashboard'} replace />
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const { error } = await signInWithPassword(email, password)
    if (error) setError(error)
    setLoading(false)
  }

  return (
    <AuthCard compact>
      <AuthHeader compact title="Bem-vindo(a) ao PODIFY" subtitle="Entre para continuar" />

      {passwordResetSuccess && (
        <p className="mt-3 rounded-xl bg-brand-50 px-4 py-3 text-sm text-ink-900">
          Senha redefinida com sucesso. Faça login com sua nova senha.
        </p>
      )}

      <button
        onClick={signInWithGoogle}
        type="button"
        className="mt-4 flex min-h-[44px] w-full items-center justify-center gap-2.5 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-ink-900 transition hover:bg-slate-50"
      >
        <GoogleIcon />
        Continuar com o Google
      </button>

      <div className="my-3 flex items-center gap-4">
        <div className="h-px flex-1 bg-slate-200" />
        <span className="text-xs font-medium text-slate-400">OU</span>
        <div className="h-px flex-1 bg-slate-200" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="label-field">Email</label>
          <div className="relative">
            <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@exemplo.com"
              className="input-field pl-11"
            />
          </div>
        </div>

        <div>
          <label className="label-field">Senha</label>
          <div className="relative">
            <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="input-field pl-11"
            />
          </div>
        </div>

        {error && <p className="text-sm text-rose-500">{error}</p>}

        <button type="submit" disabled={loading} className="btn-primary w-full py-2.5">
          {loading ? 'Aguarde...' : 'Entrar'}
        </button>
      </form>

      <div className="mt-3 flex items-center justify-between text-sm">
        <Link to="/esqueci-senha" className="text-slate-500 hover:text-ink-900">
          Esqueceu a senha?
        </Link>
        <Link to="/signup" className="text-slate-500">
          Não tem conta? <span className="font-semibold text-ink-900">Criar conta</span>
        </Link>
      </div>

      <p className="mt-4 text-center text-xs text-slate-400">
        Não conseguiu entrar? Fale com a gente pelo{' '}
        <a href={SUPPORT_WHATSAPP_URL} target="_blank" rel="noreferrer" className="font-medium text-slate-500 hover:text-ink-900">
          WhatsApp
        </a>{' '}
        ou{' '}
        <a href={`mailto:${SUPPORT_EMAIL}`} className="font-medium text-slate-500 hover:text-ink-900">
          {SUPPORT_EMAIL}
        </a>
      </p>

      <a
        href="https://glvtecnologia.com.br"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-1 flex items-center justify-center opacity-90 transition hover:opacity-60"
      >
        <img src={glvLogo} alt="GLV Tecnologia" className="h-20 w-auto object-contain" />
      </a>
    </AuthCard>
  )
}
