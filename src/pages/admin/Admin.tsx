import { useRef, useState } from 'react'
import { ShieldCheck } from 'lucide-react'
import { useAdminAccounts } from './hooks/useAdminAccounts'
import { SummaryCards } from './components/SummaryCards'
import { TrialSection } from './components/TrialSection'
import { AccountsTable, type FiltroStatus } from './components/AccountsTable'
import { FinanceiroSection } from './components/FinanceiroSection'

export default function Admin() {
  const { contas, loading, aplicarAcao, editarConta } = useAdminAccounts()
  const [filtroStatus, setFiltroStatus] = useState<FiltroStatus>('todos')
  const tabelaRef = useRef<HTMLDivElement>(null)

  function irParaTrialsNaLista() {
    setFiltroStatus('trial')
    tabelaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-extrabold text-white">
          <ShieldCheck size={24} className="text-brand-400" /> Cadastros e financeiro
        </h1>
        <p className="text-sm text-slate-500">Visão geral de todas as contas cadastradas no Podify.</p>
      </div>

      <SummaryCards contas={contas} />

      <TrialSection contas={contas} onVerTodos={irParaTrialsNaLista} />

      <AccountsTable
        ref={tabelaRef}
        contas={contas}
        loading={loading}
        filtroStatus={filtroStatus}
        setFiltroStatus={setFiltroStatus}
        onAplicarAcao={aplicarAcao}
        onEditarConta={editarConta}
      />

      <FinanceiroSection />
    </div>
  )
}
