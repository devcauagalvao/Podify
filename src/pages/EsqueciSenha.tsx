import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Mail } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { AuthCard, AuthHeader } from '@/components/BrandMark'

export default function EsqueciSenha() {
  const { resetPasswordForEmail } = useAuthStore()
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const { error } = await resetPasswordForEmail(email)
    setLoading(false)

    if (error) {
      setError(error)
      return
    }
    setSent(true)
  }

  return (
    <AuthCard>
      <AuthHeader
        title="Esqueceu sua senha?"
        subtitle="Informe seu email para receber o link de recuperação"
      />

      {sent ? (
        <div className="mt-7 space-y-5">
          <p className="rounded-xl bg-brand-50 px-4 py-3 text-sm text-ink-900">
            Se esse email existir, enviamos um link de recuperação.
          </p>
          <Link to="/login" className="btn-primary block w-full py-3 text-center">
            Voltar para o login
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-7 space-y-5">
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

          {error && <p className="text-sm text-rose-500">{error}</p>}

          <button type="submit" disabled={loading} className="btn-primary w-full py-3">
            {loading ? 'Aguarde...' : 'Enviar link de recuperação'}
          </button>
        </form>
      )}

      <div className="mt-5 flex items-center justify-center text-sm">
        <Link to="/login" className="text-slate-500">
          Lembrou a senha? <span className="font-semibold text-ink-900">Entrar</span>
        </Link>
      </div>
    </AuthCard>
  )
}
