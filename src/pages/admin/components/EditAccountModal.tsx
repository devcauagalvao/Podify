import { useState, type FormEvent } from 'react'
import type { AdminAccount } from '@/types/database'
import type { EdicaoConta } from '../hooks/useAdminAccounts'
import { AdminModal } from './AdminModal'

const ADMIN_INPUT_CLASS =
  'w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent transition'

export function EditAccountModal({
  conta,
  salvando,
  onCancelar,
  onSalvar,
}: {
  conta: AdminAccount
  salvando: boolean
  onCancelar: () => void
  onSalvar: (edicao: EdicaoConta) => void
}) {
  const [nomeCompleto, setNomeCompleto] = useState(conta.nome_completo ?? '')
  const [nomeClinica, setNomeClinica] = useState(conta.nome_clinica ?? '')
  const [telefone, setTelefone] = useState(conta.telefone ?? '')

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    onSalvar({ nome_completo: nomeCompleto.trim(), nome_clinica: nomeClinica.trim(), telefone: telefone.trim() })
  }

  return (
    <AdminModal title="Editar cadastro" onClose={onCancelar}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-xs text-slate-500">
          E-mail <span className="text-slate-400">({conta.email})</span> não é editável aqui — mexe com o login da
          conta, fora de escopo por ora.
        </p>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-400">Nome completo</label>
          <input
            value={nomeCompleto}
            onChange={(e) => setNomeCompleto(e.target.value)}
            className={ADMIN_INPUT_CLASS}
            placeholder="Nome completo"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-400">Nome da clínica</label>
          <input
            value={nomeClinica}
            onChange={(e) => setNomeClinica(e.target.value)}
            className={ADMIN_INPUT_CLASS}
            placeholder="Nome da clínica"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-400">Telefone</label>
          <input
            value={telefone}
            onChange={(e) => setTelefone(e.target.value)}
            className={ADMIN_INPUT_CLASS}
            placeholder="(00) 00000-0000"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onCancelar}
            className="min-h-[44px] flex-1 rounded-xl border border-slate-700 text-sm font-medium text-slate-300 hover:bg-slate-800"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={salvando}
            className="min-h-[44px] flex-1 rounded-xl bg-brand-500 text-sm font-semibold text-white transition hover:bg-brand-600 disabled:opacity-50"
          >
            {salvando ? 'Salvando...' : 'Salvar alterações'}
          </button>
        </div>
      </form>
    </AdminModal>
  )
}
