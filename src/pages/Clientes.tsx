import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search, User, ChevronRight, Check, Trash2, RotateCcw } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { toastError, toastSuccess } from '@/store/toastStore'
import { useDirtyBeforeUnload } from '@/hooks/useDirtyBeforeUnload'
import { useSavedFlash } from '@/hooks/useSavedFlash'
import { Modal } from '@/components/layout/Modal'
import { ConfirmarExclusaoModal } from '@/components/ConfirmarExclusaoModal'
import { SkeletonList, SkeletonListRow } from '@/components/Skeleton'
import {
  excluirClienteComCascata,
  restaurarClienteComCascata,
  formatarExcluidoHa,
  diasRestantesParaExpurgo,
} from '@/lib/clientesLixeira'
import type { Cliente } from '@/types/database'

export default function Clientes() {
  const user = useAuthStore((s) => s.user)
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [busca, setBusca] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [lixeiraOpen, setLixeiraOpen] = useState(false)
  const [excluirAlvo, setExcluirAlvo] = useState<Cliente | null>(null)
  const [loading, setLoading] = useState(true)
  const [totalLixeira, setTotalLixeira] = useState(0)

  async function carregar() {
    setLoading(true)
    const [clientesRes, lixeiraRes] = await Promise.all([
      supabase.from('clientes').select('*').is('deleted_at', null).order('nome'),
      supabase.from('clientes').select('id', { count: 'exact', head: true }).not('deleted_at', 'is', null),
    ])
    if (clientesRes.error) toastError(`Não foi possível carregar os clientes: ${clientesRes.error.message}`)
    if (lixeiraRes.error) toastError(`Não foi possível carregar a lixeira: ${lixeiraRes.error.message}`)
    setClientes(clientesRes.data ?? [])
    setTotalLixeira(lixeiraRes.count ?? 0)
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
        <div className="flex items-center gap-2">
          <button
            onClick={() => setLixeiraOpen(true)}
            className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50"
            title="Lixeira"
          >
            <Trash2 size={18} />
            {totalLixeira > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-rose-500 px-1 text-[11px] font-bold text-white">
                {totalLixeira}
              </span>
            )}
          </button>
          <button onClick={() => setModalOpen(true)} className="btn-brand flex items-center gap-2">
            <Plus size={16} /> Novo Paciente
          </button>
        </div>
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

      {loading && <SkeletonList rows={5} avatar trailing="icon" />}

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
            <div key={c.id} className="flex items-center gap-2 px-5 py-2 hover:bg-slate-50">
              <Link to={`/clientes/${c.id}`} className="flex min-w-0 flex-1 items-center gap-3 py-2">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-100 font-bold text-brand-700">
                  {c.nome.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="truncate font-semibold text-ink-900">{c.nome}</p>
                  <p className="text-sm text-slate-400">{c.telefone || c.email || '—'}</p>
                </div>
              </Link>
              <button
                onClick={() => setExcluirAlvo(c)}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-slate-300 hover:bg-rose-50 hover:text-rose-500"
                title="Excluir"
              >
                <Trash2 size={16} />
              </button>
              <Link
                to={`/clientes/${c.id}`}
                className="flex h-11 w-11 shrink-0 items-center justify-center text-slate-300"
              >
                <ChevronRight size={18} />
              </Link>
            </div>
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

      {excluirAlvo && (
        <ConfirmarExclusaoDoCliente
          cliente={excluirAlvo}
          onClose={() => setExcluirAlvo(null)}
          onExcluido={() => {
            setExcluirAlvo(null)
            carregar()
          }}
        />
      )}

      {lixeiraOpen && (
        <LixeiraModal
          onClose={() => setLixeiraOpen(false)}
          onRestaurado={() => {
            carregar()
          }}
        />
      )}
    </div>
  )
}

function ConfirmarExclusaoDoCliente({
  cliente,
  onClose,
  onExcluido,
}: {
  cliente: Cliente
  onClose: () => void
  onExcluido: () => void
}) {
  const [excluindo, setExcluindo] = useState(false)

  async function confirmar() {
    setExcluindo(true)
    const erro = await excluirClienteComCascata(cliente.id)
    if (erro) {
      setExcluindo(false)
      toastError(`Não foi possível excluir o paciente: ${erro}`)
      return
    }
    toastSuccess('Paciente movido para a lixeira.')
    onExcluido()
  }

  return (
    <ConfirmarExclusaoModal
      titulo={`Excluir ${cliente.nome}?`}
      mensagem={`O paciente e suas fichas de anamnese vão para a lixeira e podem ser restaurados em até 7 dias. Depois disso, os dados são apagados permanentemente e não podem ser recuperados.`}
      excluindo={excluindo}
      onConfirmar={confirmar}
      onClose={onClose}
    />
  )
}

function LixeiraModal({ onClose, onRestaurado }: { onClose: () => void; onRestaurado: () => void }) {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)
  const [restaurandoId, setRestaurandoId] = useState<string | null>(null)

  async function carregar() {
    setLoading(true)
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .not('deleted_at', 'is', null)
      .order('deleted_at', { ascending: false })
    if (error) toastError(`Não foi possível carregar a lixeira: ${error.message}`)
    setClientes(data ?? [])
    setLoading(false)
  }

  useEffect(() => {
    carregar()
  }, [])

  async function restaurar(cliente: Cliente) {
    setRestaurandoId(cliente.id)
    const erro = await restaurarClienteComCascata(cliente.id)
    setRestaurandoId(null)
    if (erro) {
      toastError(`Não foi possível restaurar o paciente: ${erro}`)
      return
    }
    toastSuccess(`${cliente.nome} restaurado com sucesso!`)
    setClientes((prev) => prev.filter((c) => c.id !== cliente.id))
    onRestaurado()
  }

  return (
    <Modal title="Lixeira" onClose={onClose}>
      {loading ? (
        <div className="space-y-3">
          <SkeletonListRow avatar={false} trailing={false} />
          <SkeletonListRow avatar={false} trailing={false} />
        </div>
      ) : clientes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <Trash2 size={32} className="mb-3 text-slate-300" />
          <p className="font-semibold text-slate-500">Lixeira vazia</p>
        </div>
      ) : (
        <div className="-mx-5 divide-y divide-slate-100 sm:-mx-6">
          {clientes.map((c) => {
            const dias = diasRestantesParaExpurgo(c.deleted_at!)
            const urgente = dias <= 2
            return (
              <div key={c.id} className="flex items-center justify-between gap-3 px-6 py-3">
                <div className="min-w-0">
                  <p className="truncate font-semibold text-ink-900">{c.nome}</p>
                  <p className="text-xs text-slate-400">{formatarExcluidoHa(c.deleted_at!)}</p>
                  <p className={`text-xs font-medium ${urgente ? 'text-rose-500' : 'text-amber-600'}`}>
                    {dias === 0
                      ? 'Exclusão definitiva a qualquer momento'
                      : `Exclusão definitiva em ${dias} dia${dias === 1 ? '' : 's'}`}
                  </p>
                </div>
                <button
                  onClick={() => restaurar(c)}
                  disabled={restaurandoId === c.id}
                  className="flex min-h-[44px] shrink-0 items-center gap-1.5 rounded-lg border border-brand-200 px-3 text-xs font-semibold text-brand-700 hover:bg-brand-50 disabled:opacity-50"
                >
                  <RotateCcw size={14} /> {restaurandoId === c.id ? 'Restaurando...' : 'Restaurar'}
                </button>
              </div>
            )
          })}
        </div>
      )}
    </Modal>
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
