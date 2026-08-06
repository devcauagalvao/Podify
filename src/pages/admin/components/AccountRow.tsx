import { useEffect, useRef, useState } from 'react'
import { MoreVertical, Pencil, Infinity as InfinityIcon, CalendarPlus, Ban } from 'lucide-react'
import type { AdminAccount } from '@/types/database'
import type { AcaoConta } from '../hooks/useAdminAccounts'
import { formatDataBR } from '../utils'
import { StatusBadge } from './StatusBadge'

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
    <tr className="hover:bg-slate-800/40">
      <td className="px-5 py-4">
        <p className="font-semibold text-white">
          {conta.nome_clinica || conta.nome_completo || 'Sem nome'}
          {conta.is_admin && (
            <span className="ml-2 rounded-full bg-brand-500/15 px-2 py-0.5 text-[10px] font-bold uppercase text-brand-400">
              Admin
            </span>
          )}
        </p>
        <p className="text-xs text-slate-500">{conta.email}</p>
      </td>
      <td className="px-4 py-4">
        <StatusBadge conta={conta} />
      </td>
      <td className="px-4 py-4 text-slate-400">{formatDataBR(conta.created_at)}</td>
      <td className="px-4 py-4 text-slate-400">{conta.clientes_count}</td>
      <td className="relative px-5 py-4 text-right">
        <button
          onClick={() => setMenuAberto((v) => !v)}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-800 hover:text-white"
          aria-label="Ações"
        >
          <MoreVertical size={18} />
        </button>
        {menuAberto && (
          <div
            ref={menuRef}
            className="absolute right-4 top-14 z-10 w-56 overflow-hidden rounded-xl border border-slate-700 bg-slate-800 py-1.5 text-left shadow-xl"
          >
            <button
              onClick={() => {
                setMenuAberto(false)
                onEditar(conta)
              }}
              className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-slate-200 hover:bg-slate-700"
            >
              <Pencil size={15} /> Editar cadastro
            </button>
            <div className="my-1 border-t border-slate-700" />
            <button
              onClick={() => acionar('ilimitado')}
              className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-brand-300 hover:bg-slate-700"
            >
              <InfinityIcon size={15} /> Liberar ilimitado
            </button>
            <button
              onClick={() => acionar('ativo_30_dias')}
              className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-emerald-300 hover:bg-slate-700"
            >
              <CalendarPlus size={15} /> Ativo por 30 dias
            </button>
            <button
              onClick={() => acionar('expirar')}
              className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-rose-300 hover:bg-slate-700"
            >
              <Ban size={15} /> Expirar acesso
            </button>
          </div>
        )}
      </td>
    </tr>
  )
}
