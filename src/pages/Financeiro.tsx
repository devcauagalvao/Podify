import { useEffect, useState } from 'react'
import { Plus, TrendingUp, TrendingDown, Wallet, Check } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { toastError, toastSuccess } from '@/store/toastStore'
import { useDirtyBeforeUnload } from '@/hooks/useDirtyBeforeUnload'
import { useSavedFlash } from '@/hooks/useSavedFlash'
import { Modal } from '@/components/layout/Modal'
import { Skeleton, SkeletonList, SkeletonStatCards } from '@/components/Skeleton'
import type { FinanceiroRegistro } from '@/types/database'

const PERIODOS = [30, 60, 90] as const

export default function Financeiro() {
  const user = useAuthStore((s) => s.user)
  const [periodo, setPeriodo] = useState<(typeof PERIODOS)[number]>(30)
  const [registros, setRegistros] = useState<FinanceiroRegistro[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  async function carregar() {
    setLoading(true)
    const desde = new Date()
    desde.setDate(desde.getDate() - periodo)
    const { data, error } = await supabase
      .from('financeiro_registros')
      .select('*')
      .gte('data', desde.toISOString().slice(0, 10))
      .order('data', { ascending: false })
    if (error) toastError(`Não foi possível carregar os registros financeiros: ${error.message}`)
    setRegistros(data ?? [])
    setLoading(false)
  }

  useEffect(() => {
    carregar()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [periodo])

  const entradas = registros.filter((r) => r.tipo === 'entrada').reduce((s, r) => s + Number(r.valor), 0)
  const saidas = registros.filter((r) => r.tipo === 'saida').reduce((s, r) => s + Number(r.valor), 0)
  const saldo = entradas - saidas

  const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-ink-900">Financeiro</h1>
          <p className="text-sm text-slate-500">Controle de entradas e saídas</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-xl bg-white p-1 shadow-sm ring-1 ring-slate-100">
            {PERIODOS.map((p) => (
              <button
                key={p}
                onClick={() => setPeriodo(p)}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                  periodo === p ? 'bg-brand-400 text-white' : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                {p}d
              </button>
            ))}
          </div>
          <button onClick={() => setModalOpen(true)} className="btn-brand flex items-center gap-2">
            <Plus size={16} /> Novo Registro
          </button>
        </div>
      </div>

      <p className="text-sm text-slate-400">
        Exibindo: <span className="font-medium text-slate-600">Últimos {periodo} dias</span> — {registros.length} registro(s)
      </p>

      {loading ? (
        <SkeletonStatCards count={3} />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="card flex items-center gap-3 p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
              <TrendingUp size={18} />
            </div>
            <div>
              <p className="text-sm text-slate-500">Entradas</p>
              <p className="text-xl font-extrabold text-emerald-600">{fmt(entradas)}</p>
            </div>
          </div>
          <div className="card flex items-center gap-3 p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 text-rose-500">
              <TrendingDown size={18} />
            </div>
            <div>
              <p className="text-sm text-slate-500">Saídas</p>
              <p className="text-xl font-extrabold text-rose-500">{fmt(saidas)}</p>
            </div>
          </div>
          <div className="card flex items-center gap-3 p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100 text-brand-600">
              <Wallet size={18} />
            </div>
            <div>
              <p className="text-sm text-slate-500">Saldo</p>
              <p className="text-xl font-extrabold text-ink-900">{fmt(saldo)}</p>
            </div>
          </div>
        </div>
      )}

      <div className="card p-6">
        <h2 className="mb-4 font-bold text-ink-900">Registros do Período</h2>
        {loading && (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between py-1">
                <div className="space-y-2">
                  <Skeleton className="h-3.5 w-40" />
                  <Skeleton className="h-3 w-28" />
                </div>
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        )}
        {!loading && registros.length === 0 && (
          <p className="py-10 text-center text-sm text-slate-400">Nenhum registro no período selecionado.</p>
        )}
        {!loading && registros.length > 0 && (
          <div className="divide-y divide-slate-100">
            {registros.map((r) => (
              <div key={r.id} className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium text-ink-900">{r.descricao || r.categoria}</p>
                  <p className="text-xs text-slate-400">
                    {new Date(r.data).toLocaleDateString('pt-BR')} · {r.categoria} · {r.status_pagamento}
                  </p>
                </div>
                <span className={`font-bold ${r.tipo === 'entrada' ? 'text-emerald-600' : 'text-rose-500'}`}>
                  {r.tipo === 'entrada' ? '+' : '-'} {fmt(Number(r.valor))}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {modalOpen && (
        <NovoRegistroModal
          ownerId={user!.id}
          onClose={() => setModalOpen(false)}
          onSaved={() => {
            setModalOpen(false)
            carregar()
          }}
        />
      )}
    </div>
  )
}

function NovoRegistroModal({
  ownerId,
  onClose,
  onSaved,
}: {
  ownerId: string
  onClose: () => void
  onSaved: () => void
}) {
  const [form, setForm] = useState({
    tipo: 'entrada',
    categoria: 'consulta',
    descricao: '',
    valor: '',
    data: new Date().toISOString().slice(0, 10),
    status_pagamento: 'pago',
  })
  const [saving, setSaving] = useState(false)
  const { markDirty, markClean, confirmDiscard } = useDirtyBeforeUnload()
  const { justSaved, flashThen } = useSavedFlash()

  function updateForm(patch: Partial<typeof form>) {
    markDirty()
    setForm((f) => ({ ...f, ...patch }))
  }

  function handleClose() {
    if (!confirmDiscard('Descartar este registro financeiro?')) return
    onClose()
  }

  async function salvar() {
    if (!form.valor) return
    setSaving(true)
    const { error } = await supabase.from('financeiro_registros').insert({
      owner_id: ownerId,
      tipo: form.tipo,
      categoria: form.categoria,
      descricao: form.descricao || null,
      valor: Number(form.valor),
      data: form.data,
      status_pagamento: form.status_pagamento,
    })
    if (error) {
      setSaving(false)
      toastError(`Não foi possível salvar o registro financeiro: ${error.message}`)
      return
    }
    markClean()
    toastSuccess('Registro financeiro salvo com sucesso!')
    flashThen(onSaved)
  }

  return (
    <Modal title="Novo Registro Financeiro" onClose={handleClose}>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label-field">Tipo *</label>
            <select
              className="input-field"
              value={form.tipo}
              onChange={(e) => updateForm({ tipo: e.target.value })}
            >
              <option value="entrada">Entrada</option>
              <option value="saida">Saída</option>
            </select>
          </div>
          <div>
            <label className="label-field">Categoria</label>
            <select
              className="input-field"
              value={form.categoria}
              onChange={(e) => updateForm({ categoria: e.target.value })}
            >
              <option value="consulta">Consulta</option>
              <option value="material">Material</option>
              <option value="produto">Produto</option>
              <option value="outro">Outro</option>
            </select>
          </div>
        </div>
        <div>
          <label className="label-field">Descrição</label>
          <input
            className="input-field"
            value={form.descricao}
            onChange={(e) => updateForm({ descricao: e.target.value })}
            placeholder="Descrição do registro"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label-field">Valor (R$) *</label>
            <input
              type="number"
              step="0.01"
              className="input-field"
              value={form.valor}
              onChange={(e) => updateForm({ valor: e.target.value })}
              placeholder="0.00"
            />
          </div>
          <div>
            <label className="label-field">Data *</label>
            <input
              type="date"
              className="input-field"
              value={form.data}
              onChange={(e) => updateForm({ data: e.target.value })}
            />
          </div>
        </div>
        <div>
          <label className="label-field">Status de Pagamento</label>
          <select
            className="input-field"
            value={form.status_pagamento}
            onChange={(e) => updateForm({ status_pagamento: e.target.value })}
          >
            <option value="pago">Pago</option>
            <option value="pendente">Pendente</option>
          </select>
        </div>
        <button onClick={salvar} disabled={saving} className="btn-brand flex w-full items-center justify-center gap-2">
          {justSaved ? (
            <>
              <Check size={16} /> Salvo!
            </>
          ) : saving ? (
            'Salvando...'
          ) : (
            'Salvar Registro'
          )}
        </button>
      </div>
    </Modal>
  )
}
