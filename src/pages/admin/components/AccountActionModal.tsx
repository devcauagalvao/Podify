import type { ReactNode } from 'react'
import type { AdminAccount } from '@/types/database'
import type { AcaoConta } from '../hooks/useAdminAccounts'
import { AdminModal } from './AdminModal'

const CONFIG: Record<AcaoConta, { titulo: string; corBotao: string; descricao: ReactNode }> = {
  ilimitado: {
    titulo: 'Liberar acesso ilimitado',
    corBotao: 'bg-brand-500 hover:bg-brand-600',
    descricao: (
      <>
        Essa conta passará a ter <strong>plano Pro vitalício</strong>, sem data de expiração, até que o acesso seja
        revogado manualmente.
      </>
    ),
  },
  ativo_30_dias: {
    titulo: 'Ativar por 30 dias',
    corBotao: 'bg-emerald-500 hover:bg-emerald-600',
    descricao: (
      <>
        Essa conta passará a ter <strong>plano Pro ativo por 30 dias</strong> a partir de hoje.
      </>
    ),
  },
  expirar: {
    titulo: 'Expirar acesso',
    corBotao: 'bg-rose-500 hover:bg-rose-600',
    descricao: (
      <>
        Essa conta voltará para o estado <strong>expirado</strong> e precisará assinar (ou reiniciar o trial) para
        continuar usando o Podify.
      </>
    ),
  },
}

export function AccountActionModal({
  conta,
  acao,
  salvando,
  onCancelar,
  onConfirmar,
}: {
  conta: AdminAccount
  acao: AcaoConta
  salvando: boolean
  onCancelar: () => void
  onConfirmar: () => void
}) {
  const cfg = CONFIG[acao]
  return (
    <AdminModal title={cfg.titulo} onClose={onCancelar}>
      <div className="space-y-5">
        <div className="rounded-xl bg-slate-800/60 p-4">
          <p className="font-semibold text-white">{conta.nome_clinica || conta.nome_completo || 'Sem nome'}</p>
          <p className="text-sm text-slate-400">{conta.email}</p>
        </div>
        <p className="text-sm text-slate-300">{cfg.descricao}</p>
        <div className="flex gap-3">
          <button
            onClick={onCancelar}
            className="min-h-[44px] flex-1 rounded-xl border border-slate-700 text-sm font-medium text-slate-300 hover:bg-slate-800"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirmar}
            disabled={salvando}
            className={`min-h-[44px] flex-1 rounded-xl text-sm font-semibold text-white transition disabled:opacity-50 ${cfg.corBotao}`}
          >
            {salvando ? 'Salvando...' : 'Confirmar'}
          </button>
        </div>
      </div>
    </AdminModal>
  )
}
