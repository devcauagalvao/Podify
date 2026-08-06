import { forwardRef, useMemo, useState } from 'react'
import { Search, Users2 } from 'lucide-react'
import { SkeletonList } from '@/components/Skeleton'
import type { AdminAccount } from '@/types/database'
import type { AcaoConta, EdicaoConta } from '../hooks/useAdminAccounts'
import type { StatusConta } from '../utils'
import { AccountRow } from './AccountRow'
import { AccountActionModal } from './AccountActionModal'
import { EditAccountModal } from './EditAccountModal'
import { statusConta } from '../utils'

export type FiltroStatus = 'todos' | StatusConta

const FILTROS: { valor: FiltroStatus; label: string }[] = [
  { valor: 'todos', label: 'Todos' },
  { valor: 'trial', label: 'Trial' },
  { valor: 'ativo', label: 'Ativo' },
  { valor: 'ilimitado', label: 'Ilimitado' },
  { valor: 'expirado', label: 'Expirado' },
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

  const filtradas = useMemo(() => {
    const termo = busca.trim().toLowerCase()
    return contas.filter((c) => {
      if (filtroStatus !== 'todos' && statusConta(c) !== filtroStatus) return false
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
        <h2 className="text-sm font-bold text-slate-300">
          {contas.length} {contas.length === 1 ? 'conta cadastrada' : 'contas cadastradas'} no Podify
        </h2>
        <div className="relative w-full max-w-xs sm:w-auto">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por nome ou e-mail..."
            className="w-full rounded-xl border border-slate-700 bg-slate-900 py-2.5 pl-11 pr-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent sm:w-72"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTROS.map((f) => (
          <button
            key={f.valor}
            onClick={() => setFiltroStatus(f.valor)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
              filtroStatus === f.valor
                ? 'bg-brand-500 text-white'
                : 'border border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <SkeletonList rows={6} avatar={false} trailing="text" />
      ) : filtradas.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-800 bg-slate-900 py-24 text-center">
          <Users2 size={40} className="mb-3 text-slate-700" />
          <p className="font-semibold text-slate-500">Nenhuma conta encontrada</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <th className="px-5 py-3">Conta</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Cadastro</th>
                <th className="px-4 py-3">Clientes</th>
                <th className="px-5 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
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
