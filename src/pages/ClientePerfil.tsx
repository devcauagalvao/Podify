import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Pencil,
  Phone,
  Mail,
  MapPin,
  Cake,
  StickyNote,
  Plus,
  ClipboardList,
  CalendarDays,
  Check,
  User,
  Trash2,
  IdCard,
  Contact,
  PhoneCall,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { toastError, toastSuccess } from '@/store/toastStore'
import { useDirtyBeforeUnload } from '@/hooks/useDirtyBeforeUnload'
import { useSavedFlash } from '@/hooks/useSavedFlash'
import { Modal } from '@/components/layout/Modal'
import { ConfirmarExclusaoModal } from '@/components/ConfirmarExclusaoModal'
import { Skeleton, SkeletonListRow } from '@/components/Skeleton'
import { BirthDateInput } from '@/pages/anamnese/fields'
import { excluirClienteComCascata } from '@/lib/clientesLixeira'
import { mascaraCpfCnpj, mascaraTelefone } from '@/lib/mascaras'
import { ESTADOS_BRASIL } from '@/lib/estadosBrasil'
import type { Cliente, Anamnese, Consulta } from '@/types/database'

function formatDataBR(iso: string | null | undefined) {
  if (!iso) return null
  const [y, m, d] = iso.split('-')
  if (!y || !m || !d) return iso
  return `${d}/${m}/${y}`
}

/** Endereço em campos separados quando o cliente tem esses dados; cai pro
 * campo endereco antigo (fichas migradas do Base44) quando não tem. */
function formatEndereco(c: Cliente): string | null {
  const linha1 = [c.rua, c.numero].filter(Boolean).join(', ')
  const cidadeEstado = [c.cidade, c.estado].filter(Boolean).join(' - ')
  const linha2 = [c.bairro, cidadeEstado].filter(Boolean).join(', ')
  const completo = [linha1, linha2].filter(Boolean).join(' - ')
  return completo || c.endereco
}

const STATUS_CONSULTA_LABEL: Record<string, string> = {
  agendada: 'Agendada',
  confirmada: 'Confirmada',
  cancelada: 'Cancelada',
  realizada: 'Realizada',
  concluida: 'Concluída',
}

export default function ClientePerfil() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [cliente, setCliente] = useState<Cliente | null>(null)
  const [fichas, setFichas] = useState<Anamnese[]>([])
  const [consultas, setConsultas] = useState<Consulta[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [excluirOpen, setExcluirOpen] = useState(false)

  async function carregar() {
    if (!id) return
    setLoading(true)
    const [clienteRes, fichasRes, consultasRes] = await Promise.all([
      supabase.from('clientes').select('*').eq('id', id).is('deleted_at', null).single(),
      supabase
        .from('anamneses')
        .select('*')
        .eq('cliente_id', id)
        .is('deleted_at', null)
        .order('data', { ascending: false }),
      supabase.from('consultas').select('*').eq('cliente_id', id).order('data', { ascending: false }),
    ])
    if (clienteRes.error || !clienteRes.data) {
      toastError(`Não foi possível carregar o cliente: ${clienteRes.error?.message ?? 'cliente não encontrado'}`)
      setCliente(null)
      setLoading(false)
      return
    }
    if (fichasRes.error) toastError(`Não foi possível carregar o histórico de fichas: ${fichasRes.error.message}`)
    if (consultasRes.error) toastError(`Não foi possível carregar o histórico de consultas: ${consultasRes.error.message}`)
    setCliente(clienteRes.data)
    setFichas(fichasRes.data ?? [])
    setConsultas(consultasRes.data ?? [])
    setLoading(false)
  }

  useEffect(() => {
    carregar()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Skeleton className="h-11 w-11 rounded-lg" />
          <Skeleton className="h-6 w-40" />
        </div>
        <div className="card space-y-3 p-6">
          <Skeleton className="h-4 w-32" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
        <Skeleton className="h-14 w-full rounded-xl" />
        <div className="card divide-y divide-slate-100">
          <SkeletonListRow avatar={false} trailing={false} />
          <SkeletonListRow avatar={false} trailing={false} />
        </div>
      </div>
    )
  }

  if (!cliente) {
    return (
      <div className="space-y-6">
        <Link to="/clientes" className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-ink-900">
          <ArrowLeft size={16} /> Voltar para Clientes
        </Link>
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <User size={40} className="mb-3 text-slate-300" />
          <p className="font-semibold text-slate-500">Cliente não encontrado</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link to="/clientes" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg hover:bg-slate-100">
            <ArrowLeft size={20} />
          </Link>
          <div className="min-w-0">
            <h1 className="truncate text-xl font-extrabold text-ink-900">{cliente.nome}</h1>
            <p className="text-sm text-slate-500">Cliente cadastrado</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setModalOpen(true)}
            className="flex min-h-[44px] items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium hover:bg-slate-50"
          >
            <Pencil size={16} /> Editar
          </button>
          <button
            onClick={() => setExcluirOpen(true)}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-400 hover:bg-rose-50 hover:text-rose-500"
            title="Excluir cliente"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Dados cadastrais */}
      <div className="card p-6">
        <p className="mb-4 font-bold text-ink-900">Dados Cadastrais</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <DadoItem icon={Phone} label="Telefone" value={cliente.telefone} />
          <DadoItem icon={Mail} label="Email" value={cliente.email} />
          <DadoItem icon={Cake} label="Data de Nascimento" value={formatDataBR(cliente.data_nascimento)} />
          <DadoItem icon={IdCard} label="CPF" value={cliente.cpf} />
          <DadoItem icon={MapPin} label="Endereço" value={formatEndereco(cliente)} />
          <DadoItem icon={Contact} label="Contato de Emergência" value={cliente.contato_emergencia_nome} />
          <DadoItem icon={PhoneCall} label="Telefone de Emergência" value={cliente.telefone_emergencia} />
        </div>
        {cliente.observacoes && (
          <div className="mt-4 border-t border-slate-100 pt-4">
            <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-slate-400">
              <StickyNote size={13} /> OBSERVAÇÕES
            </p>
            <p className="text-sm text-slate-600">{cliente.observacoes}</p>
          </div>
        )}
      </div>

      {/* Nova ficha em destaque */}
      <Link
        to={`/anamnese/nova?cliente=${cliente.id}`}
        className="btn-brand flex w-full items-center justify-center gap-2 py-3.5 text-base"
      >
        <Plus size={18} /> Nova Ficha de Anamnese
      </Link>

      {/* Histórico de fichas */}
      <div className="card overflow-hidden">
        <div className="flex items-center gap-2 border-b border-slate-100 px-6 py-4">
          <ClipboardList size={18} className="text-brand-500" />
          <p className="font-bold text-ink-900">Histórico de Fichas de Anamnese</p>
        </div>
        {fichas.length === 0 ? (
          <p className="px-6 py-8 text-center text-sm text-slate-400">Nenhuma ficha registrada ainda.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {fichas.map((f) => (
              <Link
                key={f.id}
                to={`/anamnese/${f.id}`}
                className="flex items-center justify-between gap-3 px-6 py-4 hover:bg-slate-50"
              >
                <p className="font-semibold text-ink-900">{new Date(f.data).toLocaleDateString('pt-BR')}</p>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
                    f.status === 'finalizada' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                  }`}
                >
                  {f.status === 'finalizada' ? 'Finalizada' : 'Em andamento'}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Histórico de consultas */}
      <div className="card overflow-hidden">
        <div className="flex items-center gap-2 border-b border-slate-100 px-6 py-4">
          <CalendarDays size={18} className="text-brand-500" />
          <p className="font-bold text-ink-900">Consultas Agendadas</p>
        </div>
        {consultas.length === 0 ? (
          <p className="px-6 py-8 text-center text-sm text-slate-400">Nenhuma consulta agendada ainda.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {consultas.map((c) => (
              <div key={c.id} className="flex items-center justify-between gap-3 px-6 py-3.5">
                <div>
                  <p className="font-medium text-ink-900">{new Date(c.data).toLocaleDateString('pt-BR')}</p>
                  <p className="text-sm text-slate-400">{c.horario?.slice(0, 5)}</p>
                </div>
                <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                  {STATUS_CONSULTA_LABEL[c.status] ?? c.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {modalOpen && (
        <EditarClienteModal
          cliente={cliente}
          onClose={() => setModalOpen(false)}
          onSaved={(atualizado) => {
            setModalOpen(false)
            setCliente(atualizado)
          }}
        />
      )}

      {excluirOpen && (
        <ExcluirClienteModal
          cliente={cliente}
          onClose={() => setExcluirOpen(false)}
          onExcluido={() => navigate('/clientes')}
        />
      )}
    </div>
  )
}

function ExcluirClienteModal({
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
      toastError(`Não foi possível excluir o cliente: ${erro}`)
      return
    }
    toastSuccess('Cliente movido para a lixeira.')
    onExcluido()
  }

  return (
    <ConfirmarExclusaoModal
      titulo={`Excluir ${cliente.nome}?`}
      mensagem="O cliente e suas fichas de anamnese vão para a lixeira e podem ser restaurados em até 7 dias. Depois disso, os dados são apagados permanentemente e não podem ser recuperados."
      excluindo={excluindo}
      onConfirmar={confirmar}
      onClose={onClose}
    />
  )
}

function DadoItem({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Phone
  label: string
  value: string | null | undefined
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
        <Icon size={16} />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold text-slate-400">{label}</p>
        <p className="truncate text-sm font-medium text-ink-900">{value || '—'}</p>
      </div>
    </div>
  )
}

function EditarClienteModal({
  cliente,
  onClose,
  onSaved,
}: {
  cliente: Cliente
  onClose: () => void
  onSaved: (atualizado: Cliente) => void
}) {
  const [form, setForm] = useState({
    nome: cliente.nome,
    telefone: cliente.telefone ?? '',
    email: cliente.email ?? '',
    data_nascimento: cliente.data_nascimento ?? '',
    observacoes: cliente.observacoes ?? '',
    cpf: cliente.cpf ?? '',
    contato_emergencia_nome: cliente.contato_emergencia_nome ?? '',
    telefone_emergencia: cliente.telefone_emergencia ?? '',
    rua: cliente.rua ?? '',
    numero: cliente.numero ?? '',
    bairro: cliente.bairro ?? '',
    cidade: cliente.cidade ?? '',
    estado: cliente.estado ?? '',
  })
  const [saving, setSaving] = useState(false)
  const { markDirty, markClean, confirmDiscard } = useDirtyBeforeUnload()
  const { justSaved, flashThen } = useSavedFlash()

  function updateForm(patch: Partial<typeof form>) {
    markDirty()
    setForm((f) => ({ ...f, ...patch }))
  }

  function handleClose() {
    if (!confirmDiscard('Descartar as alterações deste cliente?')) return
    onClose()
  }

  async function salvar() {
    if (!form.nome.trim()) return
    setSaving(true)
    const { data, error } = await supabase
      .from('clientes')
      .update({
        nome: form.nome,
        telefone: form.telefone || null,
        email: form.email || null,
        data_nascimento: form.data_nascimento || null,
        observacoes: form.observacoes || null,
        cpf: form.cpf || null,
        contato_emergencia_nome: form.contato_emergencia_nome || null,
        telefone_emergencia: form.telefone_emergencia || null,
        rua: form.rua || null,
        numero: form.numero || null,
        bairro: form.bairro || null,
        cidade: form.cidade || null,
        estado: form.estado || null,
      })
      .eq('id', cliente.id)
      .select()
      .single()
    if (error || !data) {
      setSaving(false)
      toastError(`Não foi possível atualizar o cliente: ${error?.message ?? 'erro desconhecido'}`)
      return
    }
    markClean()
    toastSuccess('Cliente atualizado com sucesso!')
    flashThen(() => onSaved(data))
  }

  return (
    <Modal title="Editar Cliente" onClose={handleClose}>
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
            <label className="label-field">Email</label>
            <input
              type="email"
              className="input-field"
              value={form.email}
              onChange={(e) => updateForm({ email: e.target.value })}
              placeholder="email@exemplo.com"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label-field">Data de Nascimento</label>
            <BirthDateInput value={form.data_nascimento} onChange={(v) => updateForm({ data_nascimento: v })} />
          </div>
          <div>
            <label className="label-field">CPF</label>
            <input
              className="input-field"
              value={form.cpf}
              onChange={(e) => updateForm({ cpf: mascaraCpfCnpj(e.target.value) })}
              placeholder="000.000.000-00"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label-field">Nome do Contato de Emergência</label>
            <input
              className="input-field"
              value={form.contato_emergencia_nome}
              onChange={(e) => updateForm({ contato_emergencia_nome: e.target.value })}
            />
          </div>
          <div>
            <label className="label-field">Telefone de Emergência</label>
            <input
              className="input-field"
              value={form.telefone_emergencia}
              onChange={(e) => updateForm({ telefone_emergencia: mascaraTelefone(e.target.value) })}
              placeholder="(00) 00000-0000"
            />
          </div>
        </div>
        <div className="space-y-3 border-t border-slate-100 pt-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Endereço</p>
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="label-field">Rua</label>
              <input
                className="input-field"
                value={form.rua}
                onChange={(e) => updateForm({ rua: e.target.value })}
              />
            </div>
            <div>
              <label className="label-field">Número</label>
              <input
                className="input-field"
                value={form.numero}
                onChange={(e) => updateForm({ numero: e.target.value })}
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="label-field">Bairro</label>
              <input
                className="input-field"
                value={form.bairro}
                onChange={(e) => updateForm({ bairro: e.target.value })}
              />
            </div>
            <div>
              <label className="label-field">Cidade</label>
              <input
                className="input-field"
                value={form.cidade}
                onChange={(e) => updateForm({ cidade: e.target.value })}
              />
            </div>
            <div>
              <label className="label-field">Estado</label>
              <select
                className="input-field"
                value={form.estado}
                onChange={(e) => updateForm({ estado: e.target.value })}
              >
                <option value="">UF</option>
                {ESTADOS_BRASIL.map((uf) => (
                  <option key={uf} value={uf}>
                    {uf}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {!form.rua && cliente.endereco && (
            <p className="text-xs text-slate-400">
              Endereço atual (formato antigo): {cliente.endereco}
            </p>
          )}
        </div>
        <div>
          <label className="label-field">Observações</label>
          <textarea
            className="input-field"
            rows={3}
            value={form.observacoes}
            onChange={(e) => updateForm({ observacoes: e.target.value })}
            placeholder="Notas sobre o cliente"
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
            'Salvar Alterações'
          )}
        </button>
      </div>
    </Modal>
  )
}
