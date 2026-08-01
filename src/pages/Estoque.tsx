import { useEffect, useState } from 'react'
import { Plus, Search, Package, AlertTriangle, Check } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { toastError, toastSuccess } from '@/store/toastStore'
import { useDirtyBeforeUnload } from '@/hooks/useDirtyBeforeUnload'
import { useSavedFlash } from '@/hooks/useSavedFlash'
import { Modal } from '@/components/layout/Modal'
import { SkeletonList } from '@/components/Skeleton'
import type { EstoqueProduto } from '@/types/database'

export default function Estoque() {
  const user = useAuthStore((s) => s.user)
  const [produtos, setProdutos] = useState<EstoqueProduto[]>([])
  const [busca, setBusca] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  async function carregar() {
    setLoading(true)
    const { data, error } = await supabase.from('estoque_produtos').select('*').order('nome')
    if (error) toastError(`Não foi possível carregar o estoque: ${error.message}`)
    setProdutos(data ?? [])
    setLoading(false)
  }

  useEffect(() => {
    carregar()
  }, [])

  const filtrados = produtos.filter((p) => p.nome.toLowerCase().includes(busca.toLowerCase()))
  const emAlerta = produtos.filter((p) => p.quantidade <= p.quantidade_minima).length

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-ink-900">Estoque</h1>
          <p className="text-sm text-slate-500">
            {produtos.length} produtos · {emAlerta} em alerta
          </p>
        </div>
        <button onClick={() => setModalOpen(true)} className="btn-brand flex items-center gap-2">
          <Plus size={16} /> Novo Produto
        </button>
      </div>

      <div className="relative max-w-md">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar produto..."
          className="input-field pl-11"
        />
      </div>

      {loading ? (
        <SkeletonList rows={5} />
      ) : filtrados.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Package size={40} className="mb-3 text-slate-300" />
          <p className="font-semibold text-slate-500">Nenhum produto encontrado</p>
        </div>
      ) : (
        <div className="card divide-y divide-slate-100">
          {filtrados.map((p) => {
            const baixo = p.quantidade <= p.quantidade_minima
            return (
              <div key={p.id} className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold text-ink-900">{p.nome}</p>
                  <p className="text-sm text-slate-400">{p.categoria || 'Sem categoria'}</p>
                </div>
                <div className="flex items-center gap-4">
                  {baixo && <AlertTriangle size={16} className="text-rose-500" />}
                  <span className={`font-bold ${baixo ? 'text-rose-500' : 'text-ink-900'}`}>
                    {p.quantidade} un.
                  </span>
                  {p.preco != null && (
                    <span className="text-sm text-slate-400">
                      {Number(p.preco).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {modalOpen && (
        <NovoProdutoModal
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

function NovoProdutoModal({
  ownerId,
  onClose,
  onSaved,
}: {
  ownerId: string
  onClose: () => void
  onSaved: () => void
}) {
  const [form, setForm] = useState({ nome: '', categoria: '', qtd: '0', qtdMin: '5', preco: '' })
  const [saving, setSaving] = useState(false)
  const { markDirty, markClean, confirmDiscard } = useDirtyBeforeUnload()
  const { justSaved, flashThen } = useSavedFlash()

  function updateForm(patch: Partial<typeof form>) {
    markDirty()
    setForm((f) => ({ ...f, ...patch }))
  }

  function handleClose() {
    if (!confirmDiscard('Descartar este produto?')) return
    onClose()
  }

  async function salvar() {
    if (!form.nome.trim()) return
    setSaving(true)
    const { error } = await supabase.from('estoque_produtos').insert({
      owner_id: ownerId,
      nome: form.nome,
      categoria: form.categoria || null,
      quantidade: Number(form.qtd),
      quantidade_minima: Number(form.qtdMin),
      preco: form.preco ? Number(form.preco) : null,
    })
    if (error) {
      setSaving(false)
      toastError(`Não foi possível cadastrar o produto: ${error.message}`)
      return
    }
    markClean()
    toastSuccess('Produto cadastrado com sucesso!')
    flashThen(onSaved)
  }

  return (
    <Modal title="Novo Produto" onClose={handleClose}>
      <div className="space-y-4">
        <div>
          <label className="label-field">Nome *</label>
          <input
            className="input-field"
            value={form.nome}
            onChange={(e) => updateForm({ nome: e.target.value })}
            placeholder="Nome do produto"
          />
        </div>
        <div>
          <label className="label-field">Categoria</label>
          <input
            className="input-field"
            value={form.categoria}
            onChange={(e) => updateForm({ categoria: e.target.value })}
            placeholder="Ex: Materiais, Equipamentos"
          />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="label-field">Qtd *</label>
            <input
              type="number"
              className="input-field"
              value={form.qtd}
              onChange={(e) => updateForm({ qtd: e.target.value })}
            />
          </div>
          <div>
            <label className="label-field">Qtd Mín.</label>
            <input
              type="number"
              className="input-field"
              value={form.qtdMin}
              onChange={(e) => updateForm({ qtdMin: e.target.value })}
            />
          </div>
          <div>
            <label className="label-field">Preço</label>
            <input
              type="number"
              step="0.01"
              className="input-field"
              value={form.preco}
              onChange={(e) => updateForm({ preco: e.target.value })}
              placeholder="0.00"
            />
          </div>
        </div>
        <button onClick={salvar} disabled={saving} className="btn-brand flex w-full items-center justify-center gap-2">
          {justSaved ? (
            <>
              <Check size={16} /> Salvo!
            </>
          ) : saving ? (
            'Salvando...'
          ) : (
            'Cadastrar Produto'
          )}
        </button>
      </div>
    </Modal>
  )
}
