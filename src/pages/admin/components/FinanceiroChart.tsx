import type { HistoricoMes } from '../hooks/useAdminFinanceiro'
import { formatMoeda } from '../utils'

const ALTURA_MAX_PX = 150

function labelMes(chave: string) {
  const [ano, mes] = chave.split('-').map(Number)
  const data = new Date(Date.UTC(ano, mes - 1, 1))
  const bruto = data.toLocaleDateString('pt-BR', { month: 'short', timeZone: 'UTC' }).replace('.', '')
  return bruto.charAt(0).toUpperCase() + bruto.slice(1)
}

export function FinanceiroChart({ historico }: { historico: HistoricoMes[] }) {
  if (historico.length === 0) return null

  const maior = Math.max(...historico.map((h) => h.valor), 1)
  const mesAtualChave = historico[historico.length - 1]?.mes

  return (
    <div className="card p-5">
      <h3 className="mb-5 text-sm font-bold text-ink-900">Receita recebida — últimos 6 meses</h3>

      <div className="flex items-end gap-2 sm:gap-4" style={{ height: ALTURA_MAX_PX }}>
        {historico.map((h) => {
          const atual = h.mes === mesAtualChave
          const alturaPx = h.valor > 0 ? Math.max((h.valor / maior) * ALTURA_MAX_PX, 6) : 2
          return (
            <div key={h.mes} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
              <span className={`text-[11px] font-semibold ${atual ? 'text-brand-600' : 'text-slate-400'}`}>
                {h.valor > 0 ? formatMoeda(h.valor).replace('R$', '').trim() : ''}
              </span>
              <div
                title={`${labelMes(h.mes)}: ${formatMoeda(h.valor)}`}
                className={`w-full max-w-[36px] rounded-t transition-colors ${
                  atual ? 'bg-brand-500' : 'bg-brand-200 hover:bg-brand-300'
                }`}
                style={{ height: alturaPx }}
              />
            </div>
          )
        })}
      </div>

      <div className="mt-2 flex gap-2 sm:gap-4">
        {historico.map((h) => (
          <span
            key={h.mes}
            className={`flex-1 text-center text-[11px] font-medium ${
              h.mes === mesAtualChave ? 'text-brand-600' : 'text-slate-400'
            }`}
          >
            {labelMes(h.mes)}
          </span>
        ))}
      </div>

      <table className="sr-only">
        <caption>Receita recebida por mês</caption>
        <thead>
          <tr>
            <th>Mês</th>
            <th>Valor</th>
          </tr>
        </thead>
        <tbody>
          {historico.map((h) => (
            <tr key={h.mes}>
              <td>{labelMes(h.mes)}</td>
              <td>{formatMoeda(h.valor)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
