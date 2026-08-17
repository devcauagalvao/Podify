import { forwardRef, useMemo, useState } from 'react'
import { Search, Users2, DollarSign, ShieldCheck, Clock3, XCircle } from 'lucide-react'
import { SkeletonList } from '@/components/Skeleton'
import type { AdminAccount } from '@/types/database'
import type { AcaoConta, EdicaoConta } from '../hooks/useAdminAccounts'
import type { OrigemConta } from '../utils'
import { AccountRow } from './AccountRow'
import { AccountActionModal } from './AccountActionModal'
import { EditAccountModal } from './EditAccountModal'
import { origemConta } from '../utils'

export type FiltroStatus = 'todos' | OrigemConta

const ABAS: {
  valor: FiltroStatus
  label: string
  icon: typeof Users2
  ativo: string
  badgeAtivo: string
  inativo: string
}[] = [
  {
    valor: 'todos',
    label: 'Todos',
    icon: Users2,
    ativo: 'border-slate-500 text-slate-900',
    badgeAtivo: 'bg-slate-200 text-slate-800',
    inativo: 'border-transparent text-slate-500 hover:text-ink-900',
  },
  {
    valor: 'pagante',
    label: 'Pagantes reais',
    icon: DollarSign,
    ativo: 'border-emerald-500 text-emerald-700',
    badgeAtivo: 'bg-emerald-100 text-emerald-700',
    inativo: 'border-transparent text-slate-500 hover:text-emerald-700',
  },
  {
    valor: 'manual',
    label: 'Acesso manual',
    icon: ShieldCheck,
    ativo: 'border-blue-500 text-blue-700',
    badgeAtivo: 'bg-blue-100 text-blue-700',
    inativo: 'border-transparent text-slate-500 hover:text-blue-700',
  },
  {
    valor: 'trial',
    label: 'Trial',
    icon: Clock3,
    ativo: 'border-amber-500 text-amber-700',
    badgeAtivo: 'bg-amber-100 text-amber-700',
    inativo: 'border-transparent text-slate-500 hover:text-amber-700',
  },
  {
    valor: 'expirado',
    label: 'Expirados',
    icon: XCircle,
    ativo: 'border-rose-500 text-rose-700',
    badgeAtivo: 'bg-rose-100 text-rose-700',
    inativo: 'border-transparent text-slate-500 hover:text-rose-700',
  },
]

interface Props {
  contas: AdminAccount[]
  loading: boolean
  filtroStatus: FiltroStatus
  setFiltroStatus: (f: FiltroStatus) => void
  onAplicarAcao: (conta: AdminAccount, acao: AcaoConta) => Promise<boolean>
  onEditarConta: (id: string, edicao: EdicaoConta) => Promise<boolean>
}

export const AccountsTable = forwardRef<HTMLDivElement, Props>(function AccountsTable(
  { contas, loading, filtroStatus, setFiltroStatus, onAplicarAcao, onEditarConta },
  ref,
) {
  const [busca, setBusca] = useState('')
  const [acaoPendente, setAcaoPendente] = useState<{ conta: AdminAccount; acao: AcaoConta } | null>(null)
  const [contaEditando, setContaEditando] = useState<AdminAccount | null>(null)
  const [salvando, setSalvando] = useState(false)

  const contagens = useMemo(() => {
    const base: Record<FiltroStatus, number> = { todos: contas.length, pagante: 0, manual: 0, trial: 0, expirado: 0 }
    for (const c of contas) base[origemConta(c)]++
    return base
  }, [contas])

  const filtradas = useMemo(() => {
    const termo = busca.trim().toLowerCase()
    return contas.filter((c) => {
      if (filtroStatus !== 'todos' && origemConta(c) !== filtroStatus) return false
      if (!termo) return true
      return [c.nome_completo, c.nome_clinica, c.email].some((v) => v?.toLowerCase().includes(termo))
    })
  }, [contas, busca, filtroStatus])

  async function confirmarAcao() {
    if (!acaoPendente) return
    setSalvando(true)
    const ok = await onAplicarAcao(acaoPendente.conta, acaoPendente.acao)
    setSalvando(false)
    if (ok) setAcaoPendente(null)
  }

  async function confirmarEdicao(edicao: EdicaoConta) {
    if (!contaEditando) return
    setSalvando(true)
    const ok = await onEditarConta(contaEditando.id, edicao)
    setSalvando(false)
    if (ok) setContaEditando(null)
  }

  return (
    <div ref={ref} className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-sm font-bold text-slate-500">
          {contas.length} {contas.length === 1 ? 'conta cadastrada' : 'contas cadastradas'} no Podify
        </h2>
        <div className="relative w-full max-w-xs sm:w-auto">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por nome ou e-mail..."
            className="input-field pl-11 sm:w-72"
          />
        </div>
      </div>

      <div className="flex gap-1 overflow-x-auto border-b border-slate-200">
        {ABAS.map(({ valor, label, icon: Icon, ativo, badgeAtivo, inativo }) => (
          <button
            key={valor}
            onClick={() => setFiltroStatus(valor)}
            className={`flex shrink-0 items-center gap-2 border-b-2 px-3.5 py-2.5 text-sm font-semibold transition ${
              filtroStatus === valor ? ativo : inativo
            }`}
          >
            <Icon size={15} />
            {label}
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                filtroStatus === valor ? badgeAtivo : 'bg-slate-100 text-slate-500'
              }`}
            >
              {contagens[valor]}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <SkeletonList rows={6} avatar={false} trailing="text" />
      ) : filtradas.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-100 bg-white py-24 text-center">
          <Users2 size={40} className="mb-3 text-slate-300" />
          <p className="font-semibold text-slate-500">Nenhuma conta encontrada</p>
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[840px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs font-semibold uppercase tracking-wider text-slate-400">
                <th className="px-5 py-3">Conta</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Origem</th>
                <th className="px-4 py-3">Cadastro</th>
                <th className="px-4 py-3">Clientes</th>
                <th className="px-5 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtradas.map((conta) => (
                <AccountRow
                  key={conta.id}
                  conta={conta}
                  onEditar={setContaEditando}
                  onAcao={(c, acao) => setAcaoPendente({ conta: c, acao })}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {acaoPendente && (
        <AccountActionModal
          conta={acaoPendente.conta}
          acao={acaoPendente.acao}
          salvando={salvando}
          onCancelar={() => setAcaoPendente(null)}
          onConfirmar={confirmarAcao}
        />
      )}

      {contaEditando && (
        <EditAccountModal
          conta={contaEditando}
          salvando={salvando}
          onCancelar={() => setContaEditando(null)}
          onSalvar={confirmarEdicao}
        />
      )}
    </div>
  )
})
