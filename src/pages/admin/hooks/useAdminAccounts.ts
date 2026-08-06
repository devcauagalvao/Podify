import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { toastError, toastSuccess } from '@/store/toastStore'
import type { AdminAccount } from '@/types/database'

export type AcaoConta = 'ilimitado' | 'ativo_30_dias' | 'expirar'

export interface EdicaoConta {
  nome_completo: string
  nome_clinica: string
  telefone: string
}

const MENSAGEM_SUCESSO: Record<AcaoConta, string> = {
  ilimitado: 'Acesso ilimitado liberado com sucesso!',
  ativo_30_dias: 'Assinatura ativada por 30 dias com sucesso!',
  expirar: 'Acesso expirado com sucesso!',
}

function patchParaAcao(acao: AcaoConta) {
  switch (acao) {
    case 'ilimitado':
      return { plano: 'pro', assinatura_status: 'ativa', assinatura_expira_em: null as string | null }
    case 'ativo_30_dias': {
      const expira = new Date()
      expira.setDate(expira.getDate() + 30)
      return { plano: 'pro', assinatura_status: 'ativa', assinatura_expira_em: expira.toISOString() }
    }
    case 'expirar':
      return { plano: 'expirado', assinatura_status: 'expirada', assinatura_expira_em: null as string | null }
  }
}

export function useAdminAccounts() {
  const [contas, setContas] = useState<AdminAccount[]>([])
  const [loading, setLoading] = useState(true)

  const carregar = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase.rpc('admin_list_accounts')
    if (error) toastError(`Não foi possível carregar as contas: ${error.message}`)
    setContas(data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => {
    carregar()
  }, [carregar])

  async function aplicarAcao(conta: AdminAccount, acao: AcaoConta) {
    const patch = patchParaAcao(acao)
    const { error } = await supabase.from('profiles').update(patch).eq('id', conta.id)
    if (error) {
      toastError(`Não foi possível atualizar o acesso: ${error.message}`)
      return false
    }
    setContas((atual) => atual.map((c) => (c.id === conta.id ? { ...c, ...patch } : c)))
    toastSuccess(MENSAGEM_SUCESSO[acao])
    return true
  }

  async function editarConta(id: string, edicao: EdicaoConta) {
    const { error } = await supabase.from('profiles').update(edicao).eq('id', id)
    if (error) {
      toastError(`Não foi possível salvar as alterações: ${error.message}`)
      return false
    }
    setContas((atual) =>
      atual.map((c) =>
        c.id === id
          ? { ...c, nome_completo: edicao.nome_completo, nome_clinica: edicao.nome_clinica }
          : c,
      ),
    )
    toastSuccess('Cadastro atualizado com sucesso!')
    return true
  }

  return { contas, loading, carregar, aplicarAcao, editarConta }
}
