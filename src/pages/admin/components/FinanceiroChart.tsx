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
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <h3 className="mb-5 text-sm font-bold text-slate-300">Receita recebida — últimos 6 meses</h3>

      <div className="flex items-end gap-2 sm:gap-4" style={{ height: ALTURA_MAX_PX }}>
        {historico.map((h) => {
          const atual = h.mes === mesAtualChave
          const alturaPx = h.valor > 0 ? Math.max((h.valor / maior) * ALTURA_MAX_PX, 6) : 2
          return (
            <div key={h.mes} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
              <span className={`text-[11px] font-semibold ${atual ? 'text-brand-300' : 'text-slate-500'}`}>
                {h.valor > 0 ? formatMoeda(h.valor).replace('R$', '').trim() : ''}
              </span>
              <div
                title={`${labelMes(h.mes)}: ${formatMoeda(h.valor)}`}
                className={`w-full max-w-[36px] rounded-t transition-colors ${
                  atual ? 'bg-brand-400' : 'bg-brand-700 hover:bg-brand-600'
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
              h.mes === mesAtualChave ? 'text-brand-300' : 'text-slate-500'
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
