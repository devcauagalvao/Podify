import { useState, type FormEvent } from 'react'
import type { AdminAccount } from '@/types/database'
import type { EdicaoConta } from '../hooks/useAdminAccounts'
import { Modal } from '@/components/layout/Modal'

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
    <Modal title="Editar cadastro" onClose={onCancelar}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-xs text-slate-500">
          E-mail <span className="text-slate-400">({conta.email})</span> não é editável aqui — mexe com o login da
          conta, fora de escopo por ora.
        </p>

        <div>
          <label className="label-field">Nome completo</label>
          <input
            value={nomeCompleto}
            onChange={(e) => setNomeCompleto(e.target.value)}
            className="input-field"
            placeholder="Nome completo"
          />
        </div>

        <div>
          <label className="label-field">Nome da clínica</label>
          <input
            value={nomeClinica}
            onChange={(e) => setNomeClinica(e.target.value)}
            className="input-field"
            placeholder="Nome da clínica"
          />
        </div>

        <div>
          <label className="label-field">Telefone</label>
          <input
            value={telefone}
            onChange={(e) => setTelefone(e.target.value)}
            className="input-field"
            placeholder="(00) 00000-0000"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onCancelar}
            className="min-h-[44px] flex-1 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            Cancelar
          </button>
          <button type="submit" disabled={salvando} className="btn-brand flex-1">
            {salvando ? 'Salvando...' : 'Salvar alterações'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
