import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search, ClipboardList } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { toastError } from '@/store/toastStore'
import { SkeletonList } from '@/components/Skeleton'
import type { Anamnese, Cliente } from '@/types/database'

type AnamneseComCliente = Anamnese & { clientes: Pick<Cliente, 'nome'> | null }

export default function AnamneseList() {
  const [fichas, setFichas] = useState<AnamneseComCliente[]>([])
  const [busca, setBusca] = useState('')
  const [totalPacientes, setTotalPacientes] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function carregar() {
      setLoading(true)
      const { data, error } = await supabase
        .from('anamneses')
        .select('*, clientes(nome)')
        .order('data', { ascending: false })
      if (error) toastError(`Não foi possível carregar as fichas de anamnese: ${error.message}`)
      setFichas((data as AnamneseComCliente[]) ?? [])
      const pacientesUnicos = new Set((data ?? []).map((f) => f.cliente_id))
      setTotalPacientes(pacientesUnicos.size)
      setLoading(false)
    }
    carregar()
  }, [])

  const filtradas = fichas.filter((f) =>
    f.clientes?.nome?.toLowerCase().includes(busca.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-ink-900">Anamnese</h1>
          <p className="text-sm text-slate-500">
            {totalPacientes} paciente(s) · {fichas.length} ficha(s)
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
        <SkeletonList rows={5} />
      ) : filtradas.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <ClipboardList size={40} className="mb-3 text-slate-300" />
          <p className="mb-4 font-semibold text-slate-500">Nenhuma ficha encontrada</p>
          <Link to="/anamnese/nova" className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium hover:bg-slate-50">
            Criar primeira ficha
          </Link>
        </div>
      ) : (
        <div className="card divide-y divide-slate-100">
          {filtradas.map((f) => (
            <Link
              key={f.id}
              to={`/anamnese/${f.id}`}
              className="flex items-center justify-between px-5 py-4 hover:bg-slate-50"
            >
              <div>
                <p className="font-semibold text-ink-900">{f.clientes?.nome ?? 'Paciente'}</p>
                <p className="text-sm text-slate-400">
                  {new Date(f.data).toLocaleDateString('pt-BR')} ·{' '}
                  {f.status === 'finalizada' ? 'Finalizada' : 'Em andamento'}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
