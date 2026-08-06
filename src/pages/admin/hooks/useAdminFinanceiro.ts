import { useCallback, useEffect, useState } from 'react'
import { FunctionsHttpError } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { toastError } from '@/store/toastStore'

export interface HistoricoMes {
  mes: string // YYYY-MM
  valor: number
}

export interface FinanceiroData {
  mrr: number
  recebidoMes: number
  assinantesPagantes: number
  assinantesCortesia: number
  historicoMensal: HistoricoMes[]
  atualizadoEm: string
  cache: boolean
}

export function useAdminFinanceiro() {
  const [dados, setDados] = useState<FinanceiroData | null>(null)
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  const carregar = useCallback(async () => {
    setLoading(true)
    setErro(null)
    const { data, error } = await supabase.functions.invoke('admin-financeiro')

    if (error || !data?.ok) {
      let mensagem = 'Não foi possível carregar os dados financeiros.'
      if (error instanceof FunctionsHttpError) {
        try {
          const corpo = await error.context.json()
          if (corpo?.error) mensagem = corpo.error
        } catch {
          // corpo não veio em JSON, mantém a mensagem genérica
        }
      } else if (data?.error) {
        mensagem = data.error
      }
      setErro(mensagem)
      toastError(mensagem)
    } else {
      setDados(data as FinanceiroData)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    carregar()
  }, [carregar])

  return { dados, loading, erro, recarregar: carregar }
}
