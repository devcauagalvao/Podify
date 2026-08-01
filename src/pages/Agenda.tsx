import { useEffect, useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, Plus, Clock, Check } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { toastError, toastSuccess } from '@/store/toastStore'
import { useDirtyBeforeUnload } from '@/hooks/useDirtyBeforeUnload'
import { useSavedFlash } from '@/hooks/useSavedFlash'
import { Modal } from '@/components/layout/Modal'
import { Skeleton } from '@/components/Skeleton'
import type { Cliente, Consulta } from '@/types/database'

const DIAS_SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

function toISODate(d: Date) {
  return d.toISOString().slice(0, 10)
}

export default function Agenda() {
  const user = useAuthStore((s) => s.user)
  const [mesAtual, setMesAtual] = useState(new Date())
  const [diaSelecionado, setDiaSelecionado] = useState(new Date())
  const [consultas, setConsultas] = useState<Consulta[]>([])
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  async function carregar() {
    setLoading(true)
    const inicio = new Date(mesAtual.getFullYear(), mesAtual.getMonth(), 1)
    const fim = new Date(mesAtual.getFullYear(), mesAtual.getMonth() + 1, 0)
    const [consultasRes, clientesRes] = await Promise.all([
      supabase
        .from('consultas')
        .select('*')
        .gte('data', toISODate(inicio))
        .lte('data', toISODate(fim))
        .order('horario'),
      supabase.from('clientes').select('*').order('nome'),
    ])
    if (consultasRes.error) toastError(`Não foi possível carregar as consultas: ${consultasRes.error.message}`)
    if (clientesRes.error) toastError(`Não foi possível carregar os clientes: ${clientesRes.error.message}`)
    setConsultas(consultasRes.data ?? [])
    setClientes(clientesRes.data ?? [])
    setLoading(false)
  }

  useEffect(() => {
    carregar()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mesAtual])

  const diasDoMes = useMemo(() => {
    const ano = mesAtual.getFullYear()
    const mes = mesAtual.getMonth()
    const primeiroDia = new Date(ano, mes, 1)
    const ultimoDia = new Date(ano, mes + 1, 0)
    const inicioGrid = new Date(primeiroDia)
    inicioGrid.setDate(inicioGrid.getDate() - primeiroDia.getDay())
    const fimGrid = new Date(ultimoDia)
    fimGrid.setDate(fimGrid.getDate() + (6 - ultimoDia.getDay()))

    const dias: Date[] = []
    const cursor = new Date(inicioGrid)
    while (cursor <= fimGrid) {
      dias.push(new Date(cursor))
      cursor.setDate(cursor.getDate() + 1)
    }
    return dias
  }, [mesAtual])

  const consultasDoDia = consultas.filter((c) => c.data === toISODate(diaSelecionado))
  const clientesById = Object.fromEntries(clientes.map((c) => [c.id, c.nome]))

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-ink-900">Agenda</h1>
          <p className="text-sm text-slate-500">{consultas.length} consultas agendadas</p>
        </div>
        <button onClick={() => setModalOpen(true)} className="btn-brand flex items-center gap-2">
          <Plus size={16} /> Nova Consulta
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="card p-5">
          <div className="mb-4 flex items-center justify-between">
            <button
              onClick={() => setMesAtual(new Date(mesAtual.getFullYear(), mesAtual.getMonth() - 1, 1))}
              className="rounded-lg p-2 hover:bg-slate-100"
            >
              <ChevronLeft size={18} />
            </button>
            <p className="font-bold text-ink-900 capitalize">
              {new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(mesAtual)}
            </p>
            <button
              onClick={() => setMesAtual(new Date(mesAtual.getFullYear(), mesAtual.getMonth() + 1, 1))}
              className="rounded-lg p-2 hover:bg-slate-100"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-slate-400">
            {DIAS_SEMANA.map((d) => (
              <div key={d} className="py-2">
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {diasDoMes.map((dia) => {
              const noMes = dia.getMonth() === mesAtual.getMonth()
              const selecionado = toISODate(dia) === toISODate(diaSelecionado)
              const temConsulta = consultas.some((c) => c.data === toISODate(dia))
              return (
                <button
                  key={dia.toISOString()}
                  onClick={() => setDiaSelecionado(dia)}
                  className={`relative aspect-square rounded-lg text-sm transition ${
                    selecionado
                      ? 'bg-brand-500 font-bold text-white'
                      : noMes
                      ? 'text-ink-900 hover:bg-brand-50'
                      : 'text-slate-300'
                  }`}
                >
                  {dia.getDate()}
                  {temConsulta && !selecionado && (
                    <span className="absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-brand-500" />
                  )}
                </button>
              )
            })}
          </div>
        </div>

        <div className="card p-5">
          <p className="mb-4 font-bold text-ink-900">
            {diaSelecionado.toLocaleDateString('pt-BR')}
          </p>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="rounded-xl border border-slate-100 p-3">
                  <Skeleton className="mb-2 h-4 w-14" />
                  <Skeleton className="h-3 w-28" />
                </div>
              ))}
            </div>
          ) : consultasDoDia.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 text-center">
              <Clock size={32} className="mb-3 text-slate-300" />
              <p className="text-sm font-medium text-slate-400">Nenhuma consulta</p>
            </div>
          ) : (
            <div className="space-y-3">
              {consultasDoDia.map((c) => (
                <div key={c.id} className="rounded-xl border border-slate-100 p-3">
                  <p className="font-semibold text-ink-900">{c.horario.slice(0, 5)}</p>
                  <p className="text-sm text-slate-500">{clientesById[c.cliente_id] ?? 'Cliente'}</p>
                  {c.observacoes && <p className="mt-1 text-xs text-slate-400">{c.observacoes}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {modalOpen && (
        <NovaConsultaModal
          ownerId={user!.id}
          clientes={clientes}
          dataInicial={toISODate(diaSelecionado)}
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

function NovaConsultaModal({
  ownerId,
  clientes,
  dataInicial,
  onClose,
  onSaved,
}: {
  ownerId: string
  clientes: Cliente[]
  dataInicial: string
  onClose: () => void
  onSaved: () => void
}) {
  const [form, setForm] = useState({ cliente_id: '', data: dataInicial, horario: '', observacoes: '' })
  const [saving, setSaving] = useState(false)
  const { markDirty, markClean, confirmDiscard } = useDirtyBeforeUnload()
  const { justSaved, flashThen } = useSavedFlash()

  function updateForm(patch: Partial<typeof form>) {
    markDirty()
    setForm((f) => ({ ...f, ...patch }))
  }

  function handleClose() {
    if (!confirmDiscard('Descartar esta consulta?')) return
    onClose()
  }

  async function salvar() {
    if (!form.cliente_id || !form.data || !form.horario) return
    setSaving(true)
    const { error } = await supabase.from('consultas').insert({
      owner_id: ownerId,
      cliente_id: form.cliente_id,
      data: form.data,
      horario: form.horario,
      observacoes: form.observacoes || null,
    })
    if (error) {
      setSaving(false)
      toastError(`Não foi possível agendar a consulta: ${error.message}`)
      return
    }
    markClean()
    toastSuccess('Consulta agendada com sucesso!')
    flashThen(onSaved)
  }

  return (
    <Modal title="Nova Consulta" onClose={handleClose}>
      <div className="space-y-4">
        <div>
          <label className="label-field">Cliente *</label>
          <select
            className="input-field"
            value={form.cliente_id}
            onChange={(e) => updateForm({ cliente_id: e.target.value })}
          >
            <option value="">Selecione o cliente</option>
            {clientes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label-field">Data *</label>
            <input
              type="date"
              className="input-field"
              value={form.data}
              onChange={(e) => updateForm({ data: e.target.value })}
            />
          </div>
          <div>
            <label className="label-field">Horário *</label>
            <input
              type="time"
              className="input-field"
              value={form.horario}
              onChange={(e) => updateForm({ horario: e.target.value })}
            />
          </div>
        </div>
        <div>
          <label className="label-field">Observações</label>
          <input
            className="input-field"
            value={form.observacoes}
            onChange={(e) => updateForm({ observacoes: e.target.value })}
            placeholder="Notas adicionais"
          />
        </div>
        <button onClick={salvar} disabled={saving} className="btn-brand flex w-full items-center justify-center gap-2">
          {justSaved ? (
            <>
              <Check size={16} /> Salvo!
            </>
          ) : saving ? (
            'Agendando...'
          ) : (
            'Agendar Consulta'
          )}
        </button>
      </div>
    </Modal>
  )
}
