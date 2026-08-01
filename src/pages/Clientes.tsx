import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search, User, ChevronRight, Check } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { toastError, toastSuccess } from '@/store/toastStore'
import { useDirtyBeforeUnload } from '@/hooks/useDirtyBeforeUnload'
import { useSavedFlash } from '@/hooks/useSavedFlash'
import { Modal } from '@/components/layout/Modal'
import { SkeletonList } from '@/components/Skeleton'
import type { Cliente } from '@/types/database'

export default function Clientes() {
  const user = useAuthStore((s) => s.user)
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [busca, setBusca] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  async function carregar() {
    setLoading(true)
    const { data, error } = await supabase.from('clientes').select('*').order('nome')
    if (error) toastError(`Não foi possível carregar os clientes: ${error.message}`)
    setClientes(data ?? [])
    setLoading(false)
  }

  useEffect(() => {
    carregar()
  }, [])

  const filtrados = clientes.filter((c) =>
    c.nome.toLowerCase().includes(busca.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-ink-900">Clientes</h1>
          <p className="text-sm text-slate-500">{clientes.length} clientes cadastrados</p>
        </div>
        <button onClick={() => setModalOpen(true)} className="btn-brand flex items-center gap-2">
          <Plus size={16} /> Novo Paciente
        </button>
      </div>

      <div className="relative max-w-md">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar cliente..."
          className="input-field pl-11"
        />
      </div>

      {loading && <SkeletonList rows={5} />}

      {!loading && filtrados.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <User size={40} className="mb-3 text-slate-300" />
          <p className="font-semibold text-slate-500">
            {busca ? 'Nenhum cliente encontrado' : 'Nenhum cliente cadastrado ainda'}
          </p>
        </div>
      )}

      {filtrados.length > 0 && (
        <div className="card divide-y divide-slate-100">
          {filtrados.map((c) => (
            <Link
              key={c.id}
              to={`/anamnese/nova?cliente=${c.id}`}
              className="flex items-center justify-between px-5 py-4 hover:bg-slate-50"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 font-bold text-brand-700">
                  {c.nome.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-ink-900">{c.nome}</p>
                  <p className="text-sm text-slate-400">{c.telefone || c.email || '—'}</p>
                </div>
              </div>
              <ChevronRight size={18} className="text-slate-300" />
            </Link>
          ))}
        </div>
      )}

      {modalOpen && (
        <NovoClienteModal
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

function NovoClienteModal({
  ownerId,
  onClose,
  onSaved,
}: {
  ownerId: string
  onClose: () => void
  onSaved: () => void
}) {
  const [form, setForm] = useState({ nome: '', telefone: '', email: '', data_nascimento: '' })
  const [saving, setSaving] = useState(false)
  const { markDirty, markClean, confirmDiscard } = useDirtyBeforeUnload()
  const { justSaved, flashThen } = useSavedFlash()

  function updateForm(patch: Partial<typeof form>) {
    markDirty()
    setForm((f) => ({ ...f, ...patch }))
  }

  function handleClose() {
    if (!confirmDiscard('Descartar o cadastro deste paciente?')) return
    onClose()
  }

  async function salvar() {
    if (!form.nome.trim()) return
    setSaving(true)
    const { error } = await supabase.from('clientes').insert({
      owner_id: ownerId,
      nome: form.nome,
      telefone: form.telefone || null,
      email: form.email || null,
      data_nascimento: form.data_nascimento || null,
    })
    if (error) {
      setSaving(false)
      toastError(`Não foi possível cadastrar o paciente: ${error.message}`)
      return
    }
    markClean()
    toastSuccess('Paciente cadastrado com sucesso!')
    flashThen(onSaved)
  }

  return (
    <Modal title="Novo Paciente" onClose={handleClose}>
      <div className="space-y-4">
        <div>
          <label className="label-field">Nome *</label>
          <input
            className="input-field"
            value={form.nome}
            onChange={(e) => updateForm({ nome: e.target.value })}
            placeholder="Nome completo"
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
            <label className="label-field">Nascimento</label>
            <input
              type="date"
              className="input-field"
              value={form.data_nascimento}
              onChange={(e) => updateForm({ data_nascimento: e.target.value })}
            />
          </div>
        </div>
        <div>
          <label className="label-field">Email</label>
          <input
            type="email"
            className="input-field"
            value={form.email}
            onChange={(e) => updateForm({ email: e.target.value })}
            placeholder="email@exemplo.com"
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
            'Cadastrar Paciente'
          )}
        </button>
      </div>
    </Modal>
  )
}
