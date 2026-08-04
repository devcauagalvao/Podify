import { useState, type FormEvent } from 'react'
import { Navigate, Link, useLocation } from 'react-router-dom'
import { Mail, Lock } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { AuthCard, AuthHeader, GoogleIcon } from '@/components/BrandMark'
import { SUPPORT_WHATSAPP_URL, SUPPORT_EMAIL } from '@/lib/contact'

export default function Login() {
  const { user, signInWithPassword, signInWithGoogle } = useAuthStore()
  const location = useLocation()
  const passwordResetSuccess = Boolean(
    (location.state as { passwordResetSuccess?: boolean } | null)?.passwordResetSuccess,
  )
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  if (user) return <Navigate to="/dashboard" replace />

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const { error } = await signInWithPassword(email, password)
    if (error) setError(error)
    setLoading(false)
  }

  return (
    <AuthCard>
      <AuthHeader title="Bem-vindo(a) ao PODIFY" subtitle="Entre para continuar" />

      {passwordResetSuccess && (
        <p className="mt-5 rounded-xl bg-brand-50 px-4 py-3 text-sm text-ink-900">
          Senha redefinida com sucesso. Faça login com sua nova senha.
        </p>
      )}

      <button
        onClick={signInWithGoogle}
        type="button"
        className="mt-7 flex min-h-[44px] w-full items-center justify-center gap-2.5 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-ink-900 transition hover:bg-slate-50"
      >
        <GoogleIcon />
        Continuar com o Google
      </button>

      <div className="my-6 flex items-center gap-4">
        <div className="h-px flex-1 bg-slate-200" />
        <span className="text-xs font-medium text-slate-400">OU</span>
        <div className="h-px flex-1 bg-slate-200" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
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

        <button type="submit" disabled={loading} className="btn-primary w-full py-3">
          {loading ? 'Aguarde...' : 'Entrar'}
        </button>
      </form>

      <div className="mt-5 flex items-center justify-between text-sm">
        <Link to="/esqueci-senha" className="text-slate-500 hover:text-ink-900">
          Esqueceu a senha?
        </Link>
        <Link to="/signup" className="text-slate-500">
          Não tem conta? <span className="font-semibold text-ink-900">Criar conta</span>
        </Link>
      </div>

      <p className="mt-8 text-center text-xs text-slate-400">
        Não conseguiu entrar? Fale com a gente pelo{' '}
        <a href={SUPPORT_WHATSAPP_URL} target="_blank" rel="noreferrer" className="font-medium text-slate-500 hover:text-ink-900">
          WhatsApp
        </a>{' '}
        ou{' '}
        <a href={`mailto:${SUPPORT_EMAIL}`} className="font-medium text-slate-500 hover:text-ink-900">
          {SUPPORT_EMAIL}
        </a>
      </p>
    </AuthCard>
  )
}
