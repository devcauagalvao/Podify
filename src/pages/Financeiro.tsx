import { useEffect, useMemo, useState } from 'react'
import { Plus, TrendingUp, TrendingDown, Wallet, Check, FileDown, Trash2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { toastError, toastSuccess } from '@/store/toastStore'
import { useDirtyBeforeUnload } from '@/hooks/useDirtyBeforeUnload'
import { useSavedFlash } from '@/hooks/useSavedFlash'
import { Modal } from '@/components/layout/Modal'
import { ConfirmarExclusaoModal } from '@/components/ConfirmarExclusaoModal'
import { Skeleton, SkeletonStatCards } from '@/components/Skeleton'
import type { FinanceiroPdfData } from './FinanceiroPdfDocument'
import type { Cliente, FinanceiroRegistro } from '@/types/database'

const PERIODOS = [30, 60, 90] as const

type ExtratoModo = 'semanal' | 'mensal' | 'anual'

const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

const CATEGORIA_LABELS: Record<string, string> = {
  consulta: 'Consulta',
  material: 'Material',
  produto: 'Produto',
  outro: 'Outro',
}

const CATEGORIAS_ORDEM = ['consulta', 'material', 'produto', 'outro']

const ANO_ATUAL = new Date().getFullYear()
const ANOS = Array.from({ length: 7 }, (_, i) => ANO_ATUAL - i)

function fmtISODate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function formatDateBR(iso: string): string {
  const [y, m, d] = iso.split('-')
  if (!y || !m || !d) return iso
  return `${d}/${m}/${y}`
}

type ClienteEndereco = Pick<Cliente, 'rua' | 'numero' | 'bairro' | 'cidade' | 'estado'>
type RegistroComCliente = FinanceiroRegistro & { cliente: (Pick<Cliente, 'nome'> & ClienteEndereco) | null }

function formatEnderecoCliente(c: ClienteEndereco | null | undefined): string {
  if (!c) return ''
  const ruaNumero = c.rua ? (c.numero ? `${c.rua}, ${c.numero}` : c.rua) : ''
  const bairroParte = c.bairro ? `Bairro ${c.bairro}` : ''
  const cidadeUf = [c.cidade, c.estado].filter(Boolean).join('/')
  const linha1 = [ruaNumero, bairroParte].filter(Boolean).join(' - ')
  return [linha1, cidadeUf].filter(Boolean).join(', ')
}

function slugify(s: string) {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase()
}

function calcularPeriodoExtrato(modo: ExtratoModo, semanaRef: string, mes: number, ano: number) {
  let inicio: Date
  let fim: Date
  let slug: string

  if (modo === 'semanal') {
    const ref = new Date(`${semanaRef}T00:00:00`)
    const dow = ref.getDay()
    inicio = new Date(ref)
    inicio.setDate(ref.getDate() - dow)
    fim = new Date(inicio)
    fim.setDate(inicio.getDate() + 6)
    slug = `semana-${fmtISODate(inicio).split('-').reverse().join('-')}`
  } else if (modo === 'mensal') {
    inicio = new Date(ano, mes - 1, 1)
    fim = new Date(ano, mes, 0)
    slug = `${MESES[mes - 1].toLowerCase()}-${ano}`
  } else {
    inicio = new Date(ano, 0, 1)
    fim = new Date(ano, 11, 31)
    slug = `${ano}`
  }

  const inicioStr = fmtISODate(inicio)
  const fimStr = fmtISODate(fim)
  return {
    inicio: inicioStr,
    fim: fimStr,
    label: `Extrato de ${formatDateBR(inicioStr)} a ${formatDateBR(fimStr)}`,
    slug,
  }
}

export default function Financeiro() {
  const user = useAuthStore((s) => s.user)
  const profile = useAuthStore((s) => s.profile)
  const [periodo, setPeriodo] = useState<(typeof PERIODOS)[number]>(30)
  const [registros, setRegistros] = useState<RegistroComCliente[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [clientes, setClientes] = useState<Pick<Cliente, 'id' | 'nome'>[]>([])
  const [excluirAlvo, setExcluirAlvo] = useState<RegistroComCliente | null>(null)
  const [excluindo, setExcluindo] = useState(false)

  const [extratoModo, setExtratoModo] = useState<ExtratoModo>('mensal')
  const [extratoSemanaRef, setExtratoSemanaRef] = useState(() => fmtISODate(new Date()))
  const [extratoMes, setExtratoMes] = useState(() => new Date().getMonth() + 1)
  const [extratoAno, setExtratoAno] = useState(ANO_ATUAL)
  const [extratoRegistros, setExtratoRegistros] = useState<RegistroComCliente[]>([])
  const [extratoLoading, setExtratoLoading] = useState(true)
  const [extratoExporting, setExtratoExporting] = useState(false)

  const periodoExtrato = useMemo(
    () => calcularPeriodoExtrato(extratoModo, extratoSemanaRef, extratoMes, extratoAno),
    [extratoModo, extratoSemanaRef, extratoMes, extratoAno],
  )

  const REGISTRO_COM_CLIENTE_SELECT = '*, cliente:clientes(nome, rua, numero, bairro, cidade, estado)'

  async function carregar() {
    setLoading(true)
    const desde = new Date()
    desde.setDate(desde.getDate() - periodo)
    const { data, error } = await supabase
      .from('financeiro_registros')
      .select(REGISTRO_COM_CLIENTE_SELECT)
      .gte('data', desde.toISOString().slice(0, 10))
      .order('data', { ascending: false })
    if (error) toastError(`Não foi possível carregar os registros financeiros: ${error.message}`)
    setRegistros((data as RegistroComCliente[] | null) ?? [])
    setLoading(false)
  }

  useEffect(() => {
    carregar()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [periodo])

  useEffect(() => {
    supabase
      .from('clientes')
      .select('id, nome')
      .is('deleted_at', null)
      .order('nome')
      .then(({ data, error }) => {
        if (error) toastError(`Não foi possível carregar os clientes: ${error.message}`)
        setClientes(data ?? [])
      })
  }, [])

  useEffect(() => {
    let cancelled = false
    setExtratoLoading(true)
    supabase
      .from('financeiro_registros')
      .select(REGISTRO_COM_CLIENTE_SELECT)
      .gte('data', periodoExtrato.inicio)
      .lte('data', periodoExtrato.fim)
      .order('data', { ascending: true })
      .then(({ data, error }) => {
        if (cancelled) return
        if (error) toastError(`Não foi possível carregar o extrato: ${error.message}`)
        setExtratoRegistros((data as RegistroComCliente[] | null) ?? [])
        setExtratoLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [periodoExtrato.inicio, periodoExtrato.fim])

  async function confirmarExclusao() {
    if (!excluirAlvo || !user) return
    setExcluindo(true)
    const { error } = await supabase
      .from('financeiro_registros')
      .delete()
      .eq('id', excluirAlvo.id)
      .eq('owner_id', user.id)
    setExcluindo(false)
    if (error) {
      toastError(`Não foi possível excluir o registro: ${error.message}`)
      return
    }
    setRegistros((prev) => prev.filter((r) => r.id !== excluirAlvo.id))
    setExtratoRegistros((prev) => prev.filter((r) => r.id !== excluirAlvo.id))
    toastSuccess('Registro excluído com sucesso.')
    setExcluirAlvo(null)
  }

  const entradas = registros.filter((r) => r.tipo === 'entrada').reduce((s, r) => s + Number(r.valor), 0)
  const saidas = registros.filter((r) => r.tipo === 'saida').reduce((s, r) => s + Number(r.valor), 0)
  const saldo = entradas - saidas

  const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

  const extratoEntradas = extratoRegistros.filter((r) => r.tipo === 'entrada').reduce((s, r) => s + Number(r.valor), 0)
  const extratoSaidas = extratoRegistros.filter((r) => r.tipo === 'saida').reduce((s, r) => s + Number(r.valor), 0)
  const extratoSaldo = extratoEntradas - extratoSaidas

  const extratoCategorias = useMemo(() => {
    const map = new Map<string, { entradas: number; saidas: number }>()
    for (const r of extratoRegistros) {
      const atual = map.get(r.categoria) ?? { entradas: 0, saidas: 0 }
      if (r.tipo === 'entrada') atual.entradas += Number(r.valor)
      else atual.saidas += Number(r.valor)
      map.set(r.categoria, atual)
    }
    return Array.from(map.entries())
      .map(([categoria, v]) => ({ categoria, ...v }))
      .sort((a, b) => {
        const ia = CATEGORIAS_ORDEM.indexOf(a.categoria)
        const ib = CATEGORIAS_ORDEM.indexOf(b.categoria)
        if (ia === -1 && ib === -1) return a.categoria.localeCompare(b.categoria)
        if (ia === -1) return 1
        if (ib === -1) return -1
        return ia - ib
      })
  }, [extratoRegistros])

  async function exportarExtratoPdf() {
    if (extratoRegistros.length === 0) return
    setExtratoExporting(true)
    try {
      const docData: FinanceiroPdfData = {
        nomeClinica: profile?.nome_clinica || profile?.nome_completo || null,
        cpfCnpj: profile?.cpf_cnpj ?? null,
        periodoLabel: periodoExtrato.label,
        totalEntradas: extratoEntradas,
        totalSaidas: extratoSaidas,
        saldo: extratoSaldo,
        categorias: extratoCategorias.map((c) => ({
          categoria: CATEGORIA_LABELS[c.categoria] ?? c.categoria,
          entradas: c.entradas,
          saidas: c.saidas,
        })),
        registros: extratoRegistros.map((r) => ({
          data: r.data,
          tipo: r.tipo,
          categoria: CATEGORIA_LABELS[r.categoria] ?? r.categoria,
          descricao: r.descricao ?? '',
          cliente: r.cliente?.nome ?? '',
          endereco: formatEnderecoCliente(r.cliente),
          valor: Number(r.valor),
        })),
      }
      const [{ pdf }, { FinanceiroPdfDocument }] = await Promise.all([
        import('@react-pdf/renderer'),
        import('./FinanceiroPdfDocument'),
      ])
      const blob = await pdf(<FinanceiroPdfDocument d={docData} />).toBlob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      const nomeArquivo = slugify(profile?.nome_clinica || profile?.nome_completo || 'extrato')
      a.download = `extrato-${nomeArquivo}-${periodoExtrato.slug}.pdf`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch (e) {
      toastError(`Erro ao gerar o PDF do extrato: ${e instanceof Error ? e.message : 'erro desconhecido'}`)
    } finally {
      setExtratoExporting(false)
    }
  }

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
                className={`flex min-h-[44px] items-center rounded-lg px-3 text-sm font-medium transition ${
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
              <div
                key={r.id}
                className="group flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium text-ink-900">
                    {r.descricao || r.categoria}
                    {r.cliente && <span className="font-normal text-slate-400"> — {r.cliente.nome}</span>}
                  </p>
                  <p className="text-xs text-slate-400">
                    {new Date(r.data).toLocaleDateString('pt-BR')} · {r.categoria} · {r.status_pagamento}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <span className={`font-bold ${r.tipo === 'entrada' ? 'text-emerald-600' : 'text-rose-500'}`}>
                    {r.tipo === 'entrada' ? '+' : '-'} {fmt(Number(r.valor))}
                  </span>
                  <button
                    onClick={() => setExcluirAlvo(r)}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-300 opacity-60 transition hover:bg-rose-50 hover:text-rose-500 sm:opacity-0 sm:group-hover:opacity-100"
                    title="Excluir lançamento"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card p-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-bold text-ink-900">Extrato</h2>
            <p className="text-xs text-slate-400">Gere um extrato por período pra exportar em PDF e enviar pro contador</p>
          </div>
          <div className="flex rounded-xl bg-white p-1 shadow-sm ring-1 ring-slate-100">
            {(['semanal', 'mensal', 'anual'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setExtratoModo(m)}
                className={`flex min-h-[44px] items-center rounded-lg px-3 text-sm font-medium capitalize transition ${
                  extratoModo === m ? 'bg-brand-400 text-white' : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-2 flex flex-wrap items-end gap-3">
          {extratoModo === 'semanal' && (
            <div>
              <label className="label-field">Qualquer data da semana</label>
              <input
                type="date"
                className="input-field"
                value={extratoSemanaRef}
                onChange={(e) => setExtratoSemanaRef(e.target.value)}
              />
            </div>
          )}
          {extratoModo === 'mensal' && (
            <>
              <div>
                <label className="label-field">Mês</label>
                <select
                  className="input-field"
                  value={extratoMes}
                  onChange={(e) => setExtratoMes(Number(e.target.value))}
                >
                  {MESES.map((m, i) => (
                    <option key={m} value={i + 1}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label-field">Ano</label>
                <select
                  className="input-field"
                  value={extratoAno}
                  onChange={(e) => setExtratoAno(Number(e.target.value))}
                >
                  {ANOS.map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}
          {extratoModo === 'anual' && (
            <div>
              <label className="label-field">Ano</label>
              <select
                className="input-field"
                value={extratoAno}
                onChange={(e) => setExtratoAno(Number(e.target.value))}
              >
                {ANOS.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>
          )}
          <button
            onClick={exportarExtratoPdf}
            disabled={extratoExporting || extratoLoading || extratoRegistros.length === 0}
            title={extratoRegistros.length === 0 ? 'Nenhum registro no período selecionado' : undefined}
            className="btn-brand flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FileDown size={16} /> {extratoExporting ? 'Gerando PDF...' : 'Exportar PDF do Extrato'}
          </button>
        </div>

        <p className="mb-4 text-sm text-slate-400">{periodoExtrato.label}</p>

        {extratoLoading && (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between py-1">
                <Skeleton className="h-3.5 w-40" />
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        )}

        {!extratoLoading && extratoRegistros.length === 0 && (
          <p className="py-6 text-center text-sm text-slate-400">Nenhum registro nesse período — não há o que exportar.</p>
        )}

        {!extratoLoading && extratoRegistros.length > 0 && (
          <>
            <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-xl bg-emerald-50 p-4">
                <p className="text-xs font-medium text-emerald-700">Entradas</p>
                <p className="text-lg font-extrabold text-emerald-600">{fmt(extratoEntradas)}</p>
              </div>
              <div className="rounded-xl bg-rose-50 p-4">
                <p className="text-xs font-medium text-rose-600">Saídas</p>
                <p className="text-lg font-extrabold text-rose-500">{fmt(extratoSaidas)}</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-medium text-slate-500">Saldo</p>
                <p className="text-lg font-extrabold text-ink-900">{fmt(extratoSaldo)}</p>
              </div>
            </div>

            <div className="mb-5 overflow-x-auto">
              <h3 className="mb-2 text-sm font-bold text-ink-900">Por categoria</h3>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-left text-xs text-slate-400">
                    <th className="pb-2 font-medium">Categoria</th>
                    <th className="pb-2 font-medium">Entradas</th>
                    <th className="pb-2 font-medium">Saídas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {extratoCategorias.map((c) => (
                    <tr key={c.categoria}>
                      <td className="py-2">{CATEGORIA_LABELS[c.categoria] ?? c.categoria}</td>
                      <td className="py-2 text-emerald-600">{c.entradas > 0 ? fmt(c.entradas) : '—'}</td>
                      <td className="py-2 text-rose-500">{c.saidas > 0 ? fmt(c.saidas) : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="overflow-x-auto">
              <h3 className="mb-2 text-sm font-bold text-ink-900">Registros ({extratoRegistros.length})</h3>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-left text-xs text-slate-400">
                    <th className="pb-2 font-medium">Data</th>
                    <th className="pb-2 font-medium">Tipo</th>
                    <th className="pb-2 font-medium">Categoria</th>
                    <th className="pb-2 font-medium">Cliente</th>
                    <th className="pb-2 font-medium">Descrição</th>
                    <th className="pb-2 text-right font-medium">Valor</th>
                    <th className="pb-2"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {extratoRegistros.map((r) => (
                    <tr key={r.id} className="group">
                      <td className="whitespace-nowrap py-2">{formatDateBR(r.data)}</td>
                      <td className="py-2">{r.tipo === 'entrada' ? 'Entrada' : 'Saída'}</td>
                      <td className="py-2">{CATEGORIA_LABELS[r.categoria] ?? r.categoria}</td>
                      <td className="py-2">{r.cliente?.nome || '—'}</td>
                      <td className="py-2">{r.descricao || '—'}</td>
                      <td
                        className={`py-2 text-right font-medium ${r.tipo === 'entrada' ? 'text-emerald-600' : 'text-rose-500'}`}
                      >
                        {r.tipo === 'entrada' ? '+ ' : '- '}
                        {fmt(Number(r.valor))}
                      </td>
                      <td className="py-2 pl-2 text-right">
                        <button
                          onClick={() => setExcluirAlvo(r)}
                          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-300 opacity-60 transition hover:bg-rose-50 hover:text-rose-500 sm:opacity-0 sm:group-hover:opacity-100"
                          title="Excluir lançamento"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {modalOpen && (
        <NovoRegistroModal
          ownerId={user!.id}
          clientes={clientes}
          onClose={() => setModalOpen(false)}
          onSaved={() => {
            setModalOpen(false)
            carregar()
          }}
        />
      )}

      {excluirAlvo && (
        <ConfirmarExclusaoModal
          titulo="Excluir este lançamento?"
          mensagem={`${excluirAlvo.descricao || CATEGORIA_LABELS[excluirAlvo.categoria] || excluirAlvo.categoria} — ${fmt(Number(excluirAlvo.valor))} de ${formatDateBR(excluirAlvo.data)}. Esta ação não pode ser desfeita.`}
          excluindo={excluindo}
          onConfirmar={confirmarExclusao}
          onClose={() => setExcluirAlvo(null)}
        />
      )}
    </div>
  )
}

function NovoRegistroModal({
  ownerId,
  clientes,
  onClose,
  onSaved,
}: {
  ownerId: string
  clientes: Pick<Cliente, 'id' | 'nome'>[]
  onClose: () => void
  onSaved: () => void
}) {
  const [form, setForm] = useState({
    tipo: 'entrada',
    categoria: 'consulta',
    clienteId: '',
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
      cliente_id: form.clienteId || null,
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
          <label className="label-field">Cliente (opcional)</label>
          <select
            className="input-field"
            value={form.clienteId}
            onChange={(e) => updateForm({ clienteId: e.target.value })}
          >
            <option value="">Nenhum / despesa geral</option>
            {clientes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label-field">Descrição (procedimento/produto)</label>
          <input
            className="input-field"
            value={form.descricao}
            onChange={(e) => updateForm({ descricao: e.target.value })}
            placeholder="Ex: Podoprofilaxia, Óleo ozonizado, etc"
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
