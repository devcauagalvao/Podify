import { useState } from 'react'
import { useSearchParams, Navigate, Link } from 'react-router-dom'
import { ShieldCheck } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { AuthCard, AuthHeader } from '@/components/BrandMark'

export default function ConfirmarRedefinicao() {
  const [searchParams] = useSearchParams()
  const tokenHash = searchParams.get('token_hash')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  async function handleConfirm() {
    if (!tokenHash) return
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: 'recovery' })
    setLoading(false)

    if (error) {
      setError('Este link expirou ou já foi usado. Solicite um novo na tela de login.')
      return
    }
    setDone(true)
  }

  if (done) return <Navigate to="/redefinir-senha" replace />

  if (!tokenHash) {
    return (
      <AuthCard>
        <AuthHeader title="Link inválido" subtitle="Este link de redefinição de senha está incompleto ou corrompido." />
        <Link to="/esqueci-senha" className="btn-primary mt-7 block w-full py-3 text-center">
          Solicitar novo link
        </Link>
      </AuthCard>
    )
  }

  return (
    <AuthCard>
      <AuthHeader
        title="Confirmar redefinição de senha"
        subtitle="Clique no botão abaixo para continuar com segurança"
      />
      <div className="mt-7 space-y-5">
        <p className="text-sm text-slate-500">
          Essa confirmação manual evita que verificadores automáticos de link, usados por alguns provedores de
          email, invalidem seu link antes de você conseguir usá-lo.
        </p>

        {error && <p className="text-sm text-rose-500">{error}</p>}

        <button
          onClick={handleConfirm}
          disabled={loading}
          className="btn-primary flex w-full items-center justify-center gap-2 py-3"
        >
          <ShieldCheck size={16} />
          {loading ? 'Confirmando...' : 'Confirmar e continuar'}
        </button>
      </div>
    </AuthCard>
  )
}
