import { DollarSign, RefreshCw } from 'lucide-react'
import { SkeletonStatCards } from '@/components/Skeleton'
import { useAdminFinanceiro } from '../hooks/useAdminFinanceiro'
import { FinanceiroChart } from './FinanceiroChart'
import { formatMoeda } from '../utils'

export function FinanceiroSection() {
  const { dados, loading, erro, recarregar } = useAdminFinanceiro()

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-sm font-bold text-slate-300">
          <DollarSign size={16} className="text-brand-400" /> Financeiro
        </h2>
        <button
          onClick={recarregar}
          disabled={loading}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 transition hover:text-slate-200 disabled:opacity-50"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} /> Atualizar
        </button>
      </div>

      {loading && !dados ? (
        <SkeletonStatCards count={4} className="grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4" />
      ) : erro && !dados ? (
        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/[0.04] p-5 text-sm text-rose-300">{erro}</div>
      ) : dados ? (
        <>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4 sm:p-5 lg:col-span-2">
              <p className="text-xs text-slate-500">MRR — receita recorrente projetada</p>
              <p className="mt-1 text-3xl font-extrabold text-white">
                {formatMoeda(dados.mrr)}
                <span className="text-base font-medium text-slate-500">/mês</span>
              </p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4 sm:p-5">
              <p className="text-xs text-slate-500">Recebido este mês</p>
              <p className="mt-1 text-2xl font-extrabold text-emerald-400">{formatMoeda(dados.recebidoMes)}</p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4 sm:p-5">
              <p className="text-xs text-slate-500">Assinantes</p>
              <p className="mt-1">
                <span className="text-xl font-extrabold text-white">{dados.assinantesPagantes}</span>{' '}
                <span className="text-sm text-slate-400">pagantes</span>
              </p>
              <p className="text-xs text-slate-500">{dados.assinantesCortesia} com acesso cortesia</p>
            </div>
          </div>

          <FinanceiroChart historico={dados.historicoMensal} />

          <p className="text-[11px] text-slate-600">
            {dados.cache ? 'Dados em cache' : 'Dados atualizados agora'} · última atualização{' '}
            {new Date(dados.atualizadoEm).toLocaleString('pt-BR')}
          </p>
        </>
      ) : null}
    </section>
  )
}
