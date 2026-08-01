import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { AuthCard, AuthHeader } from '@/components/BrandMark'

export default function RedefinirSenha() {
  const { updatePassword, signOut } = useAuthStore()
  const navigate = useNavigate()

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)

    if (password.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres.')
      return
    }
    if (password !== confirmPassword) {
      setError('As senhas não coincidem.')
      return
    }

    setLoading(true)
    const { error } = await updatePassword(password)

    if (error) {
      setLoading(false)
      setError(error)
      return
    }

    await signOut()
    setLoading(false)
    navigate('/login', { replace: true, state: { passwordResetSuccess: true } })
  }

  return (
    <AuthCard>
      <AuthHeader title="Redefinir senha" subtitle="Escolha uma nova senha para sua conta" />

      <form onSubmit={handleSubmit} className="mt-7 space-y-5">
        <div>
          <label className="label-field">Nova senha</label>
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
          <label className="label-field">Confirmar nova senha</label>
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
          {loading ? 'Aguarde...' : 'Salvar nova senha'}
        </button>
      </form>
    </AuthCard>
  )
}
