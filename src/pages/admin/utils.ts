import type { AdminAccount } from '@/types/database'

export function formatDataBR(iso: string | null | undefined) {
  if (!iso) return null
  const data = new Date(iso)
  if (Number.isNaN(data.getTime())) return iso
  return data.toLocaleDateString('pt-BR', { timeZone: 'UTC' })
}

export type StatusConta = 'trial' | 'ativo' | 'ilimitado' | 'expirado'

// "Ilimitado" = liberado manualmente pelo admin: plano pro sem data de
// expiração (mesma regra usada em ProtectedRoute e Assinatura.tsx pra nunca
// bloquear o acesso dessas contas).
export function statusConta(conta: AdminAccount): StatusConta {
  if (conta.plano === 'trial') return 'trial'
  if (conta.plano === 'pro') return conta.assinatura_expira_em ? 'ativo' : 'ilimitado'
  return 'expirado'
}

export type OrigemConta = 'pagante' | 'manual' | 'trial' | 'expirado'

// asaas_subscription_id preenchido = tem assinatura ativa no Asaas (pagou de
// verdade). Nulo com plano=pro = liberado manualmente pelo admin (botão
// "Ilimitado" ou "Ativo por 30 dias"), sem nunca ter passado pelo checkout.
export function origemConta(conta: AdminAccount): OrigemConta {
  if (conta.plano === 'trial') return 'trial'
  if (conta.plano === 'pro') return conta.asaas_subscription_id ? 'pagante' : 'manual'
  return 'expirado'
}

/** Dias até `iso`, arredondado pra cima (hoje mesmo vira 0, não negativo
 * por causa de horas já passadas no dia). Null se não houver data, pode
 * vir negativo se `iso` já passou. */
export function diasRestantes(iso: string | null | undefined): number | null {
  if (!iso) return null
  const alvo = new Date(iso).getTime()
  if (Number.isNaN(alvo)) return null
  return Math.ceil((alvo - Date.now()) / (1000 * 60 * 60 * 24))
}

export function formatMoeda(valor: number) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}
