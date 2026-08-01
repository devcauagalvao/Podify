import { useState, type FormEvent } from 'react'
import { Navigate, Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, User, Building2 } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { AuthCard, AuthHeader, GoogleIcon } from '@/components/BrandMark'

export default function SignUp() {
  const { user, signUp, signInWithGoogle } = useAuthStore()
  const navigate = useNavigate()

  const [nomeCompleto, setNomeCompleto] = useState('')
  const [nomeClinica, setNomeClinica] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  if (user) return <Navigate to="/dashboard" replace />

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)

    if (!nomeCompleto.trim()) {
      setError('Informe seu nome completo.')
      return
    }
    if (password.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres.')
      return
    }
    if (password !== confirmPassword) {
      setError('As senhas não coincidem.')
      return
    }

    setLoading(true)
    const { error } = await signUp(email, password, {
      full_name: nomeCompleto.trim(),
      nome_clinica: nomeClinica.trim() || undefined,
    })
    setLoading(false)

    if (error) {
      setError(error)
      return
    }

    navigate('/dashboard', { replace: true })
  }

  return (
    <AuthCard>
      <AuthHeader title="Crie sua conta" subtitle="Comece a usar o PODIFY agora" />

      <button
        onClick={signInWithGoogle}
        type="button"
        className="mt-7 flex w-full items-center justify-center gap-2.5 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-ink-900 transition hover:bg-slate-50"
      >
        <GoogleIcon />
        Continue with Google
      </button>

      <div className="my-6 flex items-center gap-4">
        <div className="h-px flex-1 bg-slate-200" />
        <span className="text-xs font-medium text-slate-400">OR</span>
        <div className="h-px flex-1 bg-slate-200" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="label-field">Nome completo</label>
          <div className="relative">
            <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              required
              value={nomeCompleto}
              onChange={(e) => setNomeCompleto(e.target.value)}
              placeholder="Seu nome completo"
              className="input-field pl-11"
            />
          </div>
        </div>

        <div>
          <label className="label-field">Nome da clínica (opcional)</label>
          <div className="relative">
            <Building2 size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={nomeClinica}
              onChange={(e) => setNomeClinica(e.target.value)}
              placeholder="Nome da sua clínica"
              className="input-field pl-11"
            />
          </div>
        </div>

        <div>
          <label className="label-field">Email</label>
          <div className="relative">
            <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
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

        <div>
          <label className="label-field">Confirmar senha</label>
          <div className="relative">
            <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="password"
              required
              minLength={6}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="input-field pl-11"
            />
          </div>
        </div>

        {error && <p className="text-sm text-rose-500">{error}</p>}

        <button type="submit" disabled={loading} className="btn-primary w-full py-3">
          {loading ? 'Aguarde...' : 'Criar conta'}
        </button>
      </form>

      <div className="mt-5 flex items-center justify-center text-sm">
        <Link to="/login" className="text-slate-500">
          Já tem conta? <span className="font-semibold text-ink-900">Entrar</span>
        </Link>
      </div>
    </AuthCard>
  )
}
