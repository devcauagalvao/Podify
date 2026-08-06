import { useEffect, useMemo, useState } from 'react'
import { Search, ShieldCheck, Infinity as InfinityIcon, ArrowDownUp, Users2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { toastError, toastSuccess } from '@/store/toastStore'
import { Modal } from '@/components/layout/Modal'
import { SkeletonList } from '@/components/Skeleton'
import type { AdminAccount } from '@/types/database'

function formatDataBR(iso: string | null | undefined) {
  if (!iso) return null
  const data = new Date(iso)
  if (Number.isNaN(data.getTime())) return iso
  return data.toLocaleDateString('pt-BR', { timeZone: 'UTC' })
}

const PLANO_BADGE: Record<string, { label: string; className: string }> = {
  trial: { label: 'Trial', className: 'bg-amber-100 text-amber-700' },
  pro: { label: 'Pro', className: 'bg-emerald-100 text-emerald-700' },
  expirado: { label: 'Expirado', className: 'bg-rose-100 text-rose-700' },
}

function PlanoBadge({ plano }: { plano: string }) {
  const cfg = PLANO_BADGE[plano] ?? { label: plano, className: 'bg-slate-100 text-slate-600' }
  return <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${cfg.className}`}>{cfg.label}</span>
}

// "Ilimitado" = liberado manualmente pelo admin: plano pro sem data de
// expiração (mesma regra usada em ProtectedRoute e Assinatura.tsx pra nunca
// bloquear o acesso dessas contas).
function isIlimitado(conta: AdminAccount) {
  return conta.plano === 'pro' && !conta.assinatura_expira_em
}

type Acao = { tipo: 'liberar' | 'revogar'; conta: AdminAccount }

export default function Admin() {
  const [contas, setContas] = useState<AdminAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState('')
  const [ordemAsc, setOrdemAsc] = useState(false)
  const [acao, setAcao] = useState<Acao | null>(null)
  const [salvando, setSalvando] = useState(false)

  async function carregar() {
    setLoading(true)
    const { data, error } = await supabase.rpc('admin_list_accounts')
    if (error) toastError(`Não foi possível carregar as contas: ${error.message}`)
    setContas(data ?? [])
    setLoading(false)
  }

  useEffect(() => {
    carregar()
  }, [])

  const filtradas = useMemo(() => {
    const termo = busca.trim().toLowerCase()
    const lista = !termo
      ? contas
      : contas.filter((c) =>
          [c.nome_completo, c.nome_clinica, c.email].some((v) => v?.toLowerCase().includes(termo))
        )
    return [...lista].sort((a, b) => {
      const diff = new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      return ordemAsc ? diff : -diff
    })
  }, [contas, busca, ordemAsc])

  async function confirmarAcao() {
    if (!acao) return
    setSalvando(true)
    const patch =
      acao.tipo === 'liberar'
        ? { plano: 'pro', assinatura_status: 'ativa', assinatura_expira_em: null }
        : { plano: 'expirado' }

    const { error } = await supabase.from('profiles').update(patch).eq('id', acao.conta.id)
    setSalvando(false)

    if (error) {
      toastError(`Não foi possível atualizar o acesso: ${error.message}`)
      return
    }

    toastSuccess(
      acao.tipo === 'liberar' ? 'Acesso ilimitado liberado com sucesso!' : 'Acesso ilimitado revogado com sucesso!'
    )
    setAcao(null)
    carregar()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-extrabold text-ink-900">
            <ShieldCheck size={24} className="text-brand-500" /> Administração
          </h1>
          <p className="text-sm text-slate-500">
            {contas.length} {contas.length === 1 ? 'conta cadastrada' : 'contas cadastradas'} no Podify
          </p>
        </div>
        <button
          onClick={() => setOrdemAsc((v) => !v)}
          className="flex min-h-[44px] items-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-medium text-slate-600 hover:bg-slate-50"
        >
          <ArrowDownUp size={16} /> {ordemAsc ? 'Mais antigos primeiro' : 'Mais recentes primeiro'}
        </button>
      </div>

      <div className="relative max-w-md">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar por nome ou e-mail..."
          className="input-field pl-11"
        />
      </div>

      {loading ? (
        <SkeletonList rows={6} avatar={false} trailing="text" />
      ) : filtradas.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Users2 size={40} className="mb-3 text-slate-300" />
          <p className="font-semibold text-slate-500">Nenhuma conta encontrada</p>
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[880px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs font-semibold uppercase tracking-wider text-slate-400">
                <th className="px-5 py-3">Conta</th>
                <th className="px-4 py-3">Plano</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Expira em</th>
                <th className="px-4 py-3">Cadastro</th>
                <th className="px-4 py-3">Clientes</th>
                <th className="px-5 py-3 text-right">Acesso</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtradas.map((conta) => {
                const ilimitado = isIlimitado(conta)
                return (
                  <tr key={conta.id}>
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
                      <PlanoBadge plano={conta.plano} />
                    </td>
                    <td className="px-4 py-4 text-slate-600">{conta.assinatura_status}</td>
                    <td className="px-4 py-4 text-slate-600">
                      {ilimitado ? (
                        <span className="flex items-center gap-1.5 text-brand-600">
                          <InfinityIcon size={14} /> Vitalício
                        </span>
                      ) : (
                        formatDataBR(conta.assinatura_expira_em) ?? '—'
                      )}
                    </td>
                    <td className="px-4 py-4 text-slate-600">{formatDataBR(conta.created_at)}</td>
                    <td className="px-4 py-4 text-slate-600">{conta.clientes_count}</td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => setAcao({ tipo: ilimitado ? 'revogar' : 'liberar', conta })}
                        className={`min-h-[38px] rounded-lg px-3.5 text-xs font-semibold transition ${
                          ilimitado
                            ? 'bg-rose-50 text-rose-600 hover:bg-rose-100'
                            : 'bg-brand-50 text-brand-700 hover:bg-brand-100'
                        }`}
                      >
                        {ilimitado ? 'Revogar acesso ilimitado' : 'Liberar acesso ilimitado'}
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {acao && (
        <Modal title={acao.tipo === 'liberar' ? 'Liberar acesso ilimitado' : 'Revogar acesso ilimitado'} onClose={() => setAcao(null)}>
          <div className="space-y-5">
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="font-semibold text-ink-900">
                {acao.conta.nome_clinica || acao.conta.nome_completo || 'Sem nome'}
              </p>
              <p className="text-sm text-slate-500">{acao.conta.email}</p>
            </div>
            <p className="text-sm text-slate-600">
              {acao.tipo === 'liberar' ? (
                <>
                  Essa conta passará a ter <strong>plano Pro vitalício</strong>, sem data de expiração, até que o
                  acesso seja revogado manualmente.
                </>
              ) : (
                <>
                  Essa conta voltará para o estado <strong>expirado</strong> e precisará assinar (ou reiniciar o
                  trial) para continuar usando o Podify.
                </>
              )}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setAcao(null)}
                className="min-h-[44px] flex-1 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarAcao}
                disabled={salvando}
                className={`min-h-[44px] flex-1 rounded-xl text-sm font-semibold text-white transition disabled:opacity-50 ${
                  acao.tipo === 'liberar' ? 'bg-brand-500 hover:bg-brand-600' : 'bg-rose-500 hover:bg-rose-600'
                }`}
              >
                {salvando ? 'Salvando...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
