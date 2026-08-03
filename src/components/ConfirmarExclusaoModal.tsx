import { AlertTriangle } from 'lucide-react'
import { Modal } from './layout/Modal'

export function ConfirmarExclusaoModal({
  titulo,
  mensagem,
  excluindo,
  onConfirmar,
  onClose,
}: {
  titulo: string
  mensagem: string
  excluindo: boolean
  onConfirmar: () => void
  onClose: () => void
}) {
  return (
    <Modal title={titulo} onClose={onClose}>
      <div className="space-y-5">
        <div className="flex items-start gap-3 rounded-xl bg-rose-50 p-4">
          <AlertTriangle size={20} className="mt-0.5 shrink-0 text-rose-500" />
          <p className="text-sm text-rose-700">{mensagem}</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={excluindo}
            className="flex min-h-[44px] flex-1 items-center justify-center rounded-xl border border-slate-200 text-sm font-medium hover:bg-slate-50 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirmar}
            disabled={excluindo}
            className="flex min-h-[44px] flex-1 items-center justify-center rounded-xl bg-rose-500 text-sm font-semibold text-white hover:bg-rose-600 disabled:opacity-50"
          >
            {excluindo ? 'Excluindo...' : 'Excluir'}
          </button>
        </div>
      </div>
    </Modal>
  )
}
