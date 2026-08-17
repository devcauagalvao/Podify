import { useEffect, useRef, useState } from 'react'
import { MoreVertical, Pencil, Infinity as InfinityIcon, CalendarPlus, Ban } from 'lucide-react'
import type { AdminAccount } from '@/types/database'
import type { AcaoConta } from '../hooks/useAdminAccounts'
import { formatDataBR } from '../utils'
import { StatusBadge } from './StatusBadge'
import { OrigemBadge } from './OrigemBadge'

export function AccountRow({
  conta,
  onEditar,
  onAcao,
}: {
  conta: AdminAccount
  onEditar: (conta: AdminAccount) => void
  onAcao: (conta: AdminAccount, acao: AcaoConta) => void
}) {
  const [menuAberto, setMenuAberto] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!menuAberto) return
    function onClickFora(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuAberto(false)
    }
    document.addEventListener('mousedown', onClickFora)
    return () => document.removeEventListener('mousedown', onClickFora)
  }, [menuAberto])

  function acionar(acao: AcaoConta) {
    setMenuAberto(false)
    onAcao(conta, acao)
  }

  return (
    <tr className="hover:bg-slate-50">
      <td className="px-5 py-4">
        <p className="font-semibold text-ink-900">
          {conta.nome_clinica || conta.nome_completo || 'Sem nome'}
          {conta.is_admin && (
            <span className="ml-2 rounded-full bg-brand-100 px-2 py-0.5 text-[10px] font-bold uppercase text-brand-700">
              Admin
            </span>
          )}
        </p>
        <p className="text-xs text-slate-400">{conta.email}</p>
      </td>
      <td className="px-4 py-4">
        <StatusBadge conta={conta} />
      </td>
      <td className="px-4 py-4">
        <OrigemBadge conta={conta} />
      </td>
      <td className="px-4 py-4 text-slate-600">{formatDataBR(conta.created_at)}</td>
      <td className="px-4 py-4 text-slate-600">{conta.clientes_count}</td>
      <td className="relative px-5 py-4 text-right">
        <button
          onClick={() => setMenuAberto((v) => !v)}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-ink-900"
          aria-label="Ações"
        >
          <MoreVertical size={18} />
        </button>
        {menuAberto && (
          <div
            ref={menuRef}
            className="absolute right-4 top-14 z-10 w-56 overflow-hidden rounded-xl border border-slate-100 bg-white py-1.5 text-left shadow-xl"
          >
            <button
              onClick={() => {
                setMenuAberto(false)
                onEditar(conta)
              }}
              className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-ink-900 hover:bg-slate-50"
            >
              <Pencil size={15} /> Editar cadastro
            </button>
            <div className="my-1 border-t border-slate-100" />
            <button
              onClick={() => acionar('ilimitado')}
              className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-brand-600 hover:bg-slate-50"
            >
              <InfinityIcon size={15} /> Liberar ilimitado
            </button>
            <button
              onClick={() => acionar('ativo_30_dias')}
              className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-emerald-600 hover:bg-slate-50"
            >
              <CalendarPlus size={15} /> Ativo por 30 dias
            </button>
            <button
              onClick={() => acionar('expirar')}
              className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-rose-600 hover:bg-slate-50"
            >
              <Ban size={15} /> Expirar acesso
            </button>
          </div>
        )}
      </td>
    </tr>
  )
}
