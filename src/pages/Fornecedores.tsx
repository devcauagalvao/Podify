import { useEffect, useState } from 'react'
import { Plus, Search, Truck, Check } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { toastError, toastSuccess } from '@/store/toastStore'
import { useDirtyBeforeUnload } from '@/hooks/useDirtyBeforeUnload'
import { useSavedFlash } from '@/hooks/useSavedFlash'
import { Modal } from '@/components/layout/Modal'
import { SkeletonList } from '@/components/Skeleton'
import type { Fornecedor } from '@/types/database'

export default function Fornecedores() {
  const user = useAuthStore((s) => s.user)
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([])
  const [busca, setBusca] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  async function carregar() {
    setLoading(true)
    const { data, error } = await supabase.from('fornecedores').select('*').order('nome_empresa')
    if (error) toastError(`Não foi possível carregar os fornecedores: ${error.message}`)
    setFornecedores(data ?? [])
    setLoading(false)
  }

  useEffect(() => {
    carregar()
  }, [])

  const filtrados = fornecedores.filter((f) =>
    f.nome_empresa.toLowerCase().includes(busca.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-ink-900">Fornecedores</h1>
          <p className="text-sm text-slate-500">{fornecedores.length} fornecedores cadastrados</p>
        </div>
        <button onClick={() => setModalOpen(true)} className="btn-brand flex items-center gap-2">
          <Plus size={16} /> Novo Fornecedor
        </button>
      </div>

      <div className="relative max-w-md">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar fornecedor..."
          className="input-field pl-11"
        />
      </div>

      {loading ? (
        <SkeletonList rows={5} />
      ) : filtrados.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Truck size={40} className="mb-3 text-slate-300" />
          <p className="font-semibold text-slate-500">Nenhum fornecedor encontrado</p>
        </div>
      ) : (
        <div className="card divide-y divide-slate-100">
          {filtrados.map((f) => (
            <div key={f.id} className="px-5 py-4">
              <p className="font-semibold text-ink-900">{f.nome_empresa}</p>
              <p className="text-sm text-slate-400">
                {[f.nome_contato, f.telefone, f.email].filter(Boolean).join(' · ') || '—'}
              </p>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <NovoFornecedorModal
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

function NovoFornecedorModal({
  ownerId,
  onClose,
  onSaved,
}: {
  ownerId: string
  onClose: () => void
  onSaved: () => void
}) {
  const [form, setForm] = useState({ nome_empresa: '', nome_contato: '', telefone: '', email: '', observacoes: '' })
  const [saving, setSaving] = useState(false)
  const { markDirty, markClean, confirmDiscard } = useDirtyBeforeUnload()
  const { justSaved, flashThen } = useSavedFlash()

  function updateForm(patch: Partial<typeof form>) {
    markDirty()
    setForm((f) => ({ ...f, ...patch }))
  }

  function handleClose() {
    if (!confirmDiscard('Descartar este fornecedor?')) return
    onClose()
  }

  async function salvar() {
    if (!form.nome_empresa.trim()) return
    setSaving(true)
    const { error } = await supabase.from('fornecedores').insert({
      owner_id: ownerId,
      nome_empresa: form.nome_empresa,
      nome_contato: form.nome_contato || null,
      telefone: form.telefone || null,
      email: form.email || null,
      observacoes: form.observacoes || null,
    })
    if (error) {
      setSaving(false)
      toastError(`Não foi possível cadastrar o fornecedor: ${error.message}`)
      return
    }
    markClean()
    toastSuccess('Fornecedor cadastrado com sucesso!')
    flashThen(onSaved)
  }

  return (
    <Modal title="Novo Fornecedor" onClose={handleClose}>
      <div className="space-y-4">
        <div>
          <label className="label-field">Nome da Empresa *</label>
          <input
            className="input-field"
            value={form.nome_empresa}
            onChange={(e) => updateForm({ nome_empresa: e.target.value })}
            placeholder="Nome da empresa"
          />
        </div>
        <div>
          <label className="label-field">Nome do Contato</label>
          <input
            className="input-field"
            value={form.nome_contato}
            onChange={(e) => updateForm({ nome_contato: e.target.value })}
            placeholder="Pessoa de contato"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label-field">Telefone</label>
            <input
              className="input-field"
              value={form.telefone}
              onChange={(e) => updateForm({ telefone: e.target.value })}
              placeholder="(00) 00000-0000"
            />
          </div>
          <div>
            <label className="label-field">E-mail</label>
            <input
              className="input-field"
              value={form.email}
              onChange={(e) => updateForm({ email: e.target.value })}
              placeholder="email@empresa.com"
            />
          </div>
        </div>
        <div>
          <label className="label-field">Observações</label>
          <textarea
            className="input-field"
            rows={3}
            value={form.observacoes}
            onChange={(e) => updateForm({ observacoes: e.target.value })}
            placeholder="Notas sobre o fornecedor"
          />
        </div>
        <button onClick={salvar} disabled={saving} className="btn-brand flex w-full items-center justify-center gap-2">
          {justSaved ? (
            <>
              <Check size={16} /> Salvo!
            </>
          ) : saving ? (
            'Salvando...'
          ) : (
            'Cadastrar Fornecedor'
          )}
        </button>
      </div>
    </Modal>
  )
}
