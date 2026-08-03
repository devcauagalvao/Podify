import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search, ClipboardList, UserPlus } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { toastError } from '@/store/toastStore'
import { Skeleton, SkeletonList } from '@/components/Skeleton'
import type { Anamnese, Cliente } from '@/types/database'

type AnamneseComCliente = Anamnese & { clientes: Pick<Cliente, 'nome'> | null }
type ClienteBasico = Pick<Cliente, 'id' | 'nome'>

const DEBOUNCE_MS = 300

export default function AnamneseList() {
  const [fichas, setFichas] = useState<AnamneseComCliente[]>([])
  const [busca, setBusca] = useState('')
  const [buscaDebounced, setBuscaDebounced] = useState('')
  const [totalClientes, setTotalClientes] = useState(0)
  const [loading, setLoading] = useState(true)
  const [clientesSemFicha, setClientesSemFicha] = useState<ClienteBasico[]>([])
  const [buscandoClientes, setBuscandoClientes] = useState(false)

  useEffect(() => {
    async function carregar() {
      setLoading(true)
      const { data, error } = await supabase
        .from('anamneses')
        .select('*, clientes(nome)')
        .is('deleted_at', null)
        .order('data', { ascending: false })
      if (error) toastError(`Não foi possível carregar as fichas de anamnese: ${error.message}`)
      setFichas((data as AnamneseComCliente[]) ?? [])
      const clientesUnicos = new Set((data ?? []).map((f) => f.cliente_id))
      setTotalClientes(clientesUnicos.size)
      setLoading(false)
    }
    carregar()
  }, [])

  // Debounce: só dispara a busca no banco 300ms depois de parar de digitar.
  useEffect(() => {
    const t = setTimeout(() => setBuscaDebounced(busca.trim()), DEBOUNCE_MS)
    return () => clearTimeout(t)
  }, [busca])

  // Busca direto na tabela de clientes (ilike no nome) em paralelo — não só
  // nas fichas já existentes — pra achar clientes que baterem com o nome
  // mas ainda não têm nenhuma ficha de anamnese.
  useEffect(() => {
    if (!buscaDebounced) {
      setClientesSemFicha([])
      return
    }
    let cancelado = false
    async function buscarClientes() {
      setBuscandoClientes(true)
      const { data, error } = await supabase
        .from('clientes')
        .select('id, nome')
        .is('deleted_at', null)
        .ilike('nome', `%${buscaDebounced}%`)
        .order('nome')
      if (cancelado) return
      if (error) {
        toastError(`Não foi possível buscar clientes: ${error.message}`)
        setClientesSemFicha([])
      } else {
        const idsComFicha = new Set(fichas.map((f) => f.cliente_id))
        setClientesSemFicha((data ?? []).filter((c) => !idsComFicha.has(c.id)))
      }
      setBuscandoClientes(false)
    }
    buscarClientes()
    return () => {
      cancelado = true
    }
  }, [buscaDebounced, fichas])

  const temBusca = busca.trim().length > 0
  const filtradas = temBusca
    ? fichas.filter((f) => f.clientes?.nome?.toLowerCase().includes(busca.trim().toLowerCase()))
    : fichas

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-ink-900">Anamnese</h1>
          <p className="text-sm text-slate-500">
            {totalClientes} cliente(s) · {fichas.length} ficha(s)
          </p>
        </div>
        <Link to="/anamnese/nova" className="btn-brand flex items-center gap-2">
          <Plus size={16} /> Nova Ficha
        </Link>
      </div>

      <div className="relative max-w-md">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar por cliente..."
          className="input-field pl-11"
        />
      </div>

      {loading ? (
        <SkeletonList rows={5} avatar={false} trailing={false} />
      ) : (
        <div className="space-y-6">
          <div>
            {temBusca && (
              <p className="mb-3 text-xs font-bold tracking-wider text-slate-400">FICHAS ENCONTRADAS</p>
            )}

            {filtradas.length === 0 ? (
              temBusca ? (
                <p className="py-2 text-sm text-slate-400">Nenhuma ficha encontrada para "{busca.trim()}".</p>
              ) : (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                  <ClipboardList size={40} className="mb-3 text-slate-300" />
                  <p className="mb-4 font-semibold text-slate-500">Nenhuma ficha encontrada</p>
                  <Link
                    to="/anamnese/nova"
                    className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium hover:bg-slate-50"
                  >
                    Criar primeira ficha
                  </Link>
                </div>
              )
            ) : (
              <div className="card divide-y divide-slate-100">
                {filtradas.map((f) => (
                  <div key={f.id} className="flex items-center gap-2 px-5 py-2 hover:bg-slate-50">
                    <Link to={`/anamnese/${f.id}`} className="min-w-0 flex-1 py-2">
                      <p className="truncate font-semibold text-ink-900">{f.clientes?.nome ?? 'Cliente'}</p>
                      <p className="text-sm text-slate-400">
                        {new Date(f.data).toLocaleDateString('pt-BR')} ·{' '}
                        {f.status === 'finalizada' ? 'Finalizada' : 'Em andamento'}
                      </p>
                    </Link>
                    <NovaFichaButton clienteId={f.cliente_id} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {temBusca && (
            <div>
              <p className="mb-3 flex items-center gap-1.5 text-xs font-bold tracking-wider text-slate-400">
                <UserPlus size={14} /> CLIENTES SEM FICHA AINDA
              </p>
              {buscandoClientes ? (
                <div className="card divide-y divide-slate-100">
                  <div className="flex items-center gap-3 px-5 py-4">
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
              ) : clientesSemFicha.length === 0 ? (
                <p className="text-sm text-slate-400">Nenhum cliente sem ficha encontrado para "{busca.trim()}".</p>
              ) : (
                <div className="card divide-y divide-slate-100">
                  {clientesSemFicha.map((c) => (
                    <div key={c.id} className="flex items-center gap-2 px-5 py-4">
                      <p className="min-w-0 flex-1 truncate font-semibold text-ink-900">{c.nome}</p>
                      <NovaFichaButton clienteId={c.id} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function NovaFichaButton({ clienteId }: { clienteId: string }) {
  return (
    <Link
      to={`/anamnese/nova?cliente=${clienteId}`}
      className="flex shrink-0 items-center gap-1.5 rounded-lg border border-brand-200 px-3 py-2 text-xs font-semibold text-brand-700 hover:bg-brand-50"
    >
      <Plus size={14} /> Nova Ficha
    </Link>
  )
}
