import { supabase } from './supabase'

export const DIAS_RETENCAO_LIXEIRA = 7

/** Move o cliente pra lixeira e cascateia a exclusão pras fichas de
 * anamnese que ainda não estavam deletadas (ver função soft_delete_cliente
 * no banco — é atômico, os dois updates acontecem juntos ou nenhum). */
export async function excluirClienteComCascata(clienteId: string): Promise<string | null> {
  const { error } = await supabase.rpc('soft_delete_cliente', { p_cliente_id: clienteId })
  return error?.message ?? null
}

/** Restaura o cliente e as fichas que foram pra lixeira JUNTO com ele
 * (ver função restore_cliente no banco). */
export async function restaurarClienteComCascata(clienteId: string): Promise<string | null> {
  const { error } = await supabase.rpc('restore_cliente', { p_cliente_id: clienteId })
  return error?.message ?? null
}

/** "Excluído há 2 dias" / "Excluído hoje" / "Excluído ontem". */
export function formatarExcluidoHa(deletedAt: string): string {
  const dias = Math.floor((Date.now() - new Date(deletedAt).getTime()) / 86_400_000)
  if (dias <= 0) return 'Excluído hoje'
  if (dias === 1) return 'Excluído ontem'
  return `Excluído há ${dias} dias`
}

/** Dias restantes antes do expurgo definitivo (nunca negativo — a partir
 * daqui a limpeza automática já deveria ter rodado). */
export function diasRestantesParaExpurgo(deletedAt: string): number {
  const decorridos = (Date.now() - new Date(deletedAt).getTime()) / 86_400_000
  return Math.max(0, Math.ceil(DIAS_RETENCAO_LIXEIRA - decorridos))
}
