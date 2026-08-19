import { useEffect, useState, type ReactNode } from 'react'
import { Check } from 'lucide-react'
import { FieldError, inputErrorClass } from '@/components/FieldError'

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="card overflow-hidden">
      <div className="bg-gradient-to-r from-brand-600 to-brand-300 px-5 py-2.5">
        <p className="text-xs font-bold tracking-wide text-white">{title}</p>
      </div>
      <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
    </div>
  )
}

export function Field({
  label,
  full,
  animate,
  children,
}: {
  label: string
  full?: boolean
  /** Fade suave ao aparecer — usado em campos condicionais que só surgem
   * conforme uma resposta anterior (ex: "Sim" numa pergunta-mãe). */
  animate?: boolean
  children: ReactNode
}) {
  return (
    <div className={`${full ? 'sm:col-span-2 lg:col-span-3' : ''} ${animate ? 'animate-field-fade-in' : ''}`.trim()}>
      <label className="label-field">{label}</label>
      {children}
    </div>
  )
}

export function TextInput({
  value,
  onChange,
  placeholder,
  type = 'text',
  error,
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  type?: string
  error?: string
}) {
  return (
    <>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={inputErrorClass(error)}
      />
      <FieldError>{error}</FieldError>
    </>
  )
}

export function SelectInput({
  value,
  onChange,
  options,
}: {
  value: string
  onChange: (v: string) => void
  options: string[]
}) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className="input-field">
      <option value="">Selecione</option>
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  )
}

const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

function pad2(n: number) {
  return String(n).padStart(2, '0')
}

/** Data de nascimento em 3 seletores separados (Dia / Mês por extenso / Ano)
 * em vez do calendário nativo — mais fácil de qualquer pessoa entender e
 * usar, sem depender de saber o formato certo de digitar a data. Continua
 * salvando no mesmo formato "AAAA-MM-DD" de sempre. */
export function BirthDateInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [dia, setDia] = useState('')
  const [mes, setMes] = useState('')
  const [ano, setAno] = useState('')

  useEffect(() => {
    const [y, m, d] = (value ?? '').split('-')
    setAno(y ?? '')
    setMes(m ?? '')
    setDia(d ?? '')
  }, [value])

  function aplicar(next: { dia?: string; mes?: string; ano?: string }) {
    const m = next.mes ?? mes
    const y = next.ano ?? ano
    let d = next.dia ?? dia
    if (d && m && y) {
      const maxDias = new Date(Number(y), Number(m), 0).getDate()
      if (Number(d) > maxDias) d = pad2(maxDias)
    }
    setDia(d)
    setMes(m)
    setAno(y)
    if (d && m && y) onChange(`${y}-${m}-${d}`)
  }

  const anoAtual = new Date().getFullYear()
  const anos = Array.from({ length: 121 }, (_, i) => anoAtual - i)
  const diasNoMes = mes && ano ? new Date(Number(ano), Number(mes), 0).getDate() : 31
  const dias = Array.from({ length: diasNoMes }, (_, i) => i + 1)

  return (
    <div className="grid grid-cols-[0.8fr_1.4fr_1fr] gap-2">
      <select
        value={dia}
        onChange={(e) => aplicar({ dia: e.target.value })}
        className="input-field px-2 text-center"
        aria-label="Dia de nascimento"
      >
        <option value="">Dia</option>
        {dias.map((d) => (
          <option key={d} value={pad2(d)}>
            {pad2(d)}
          </option>
        ))}
      </select>
      <select
        value={mes}
        onChange={(e) => aplicar({ mes: e.target.value })}
        className="input-field px-1.5"
        aria-label="Mês de nascimento"
      >
        <option value="">Mês</option>
        {MESES.map((nome, i) => (
          <option key={nome} value={pad2(i + 1)}>
            {nome}
          </option>
        ))}
      </select>
      <select
        value={ano}
        onChange={(e) => aplicar({ ano: e.target.value })}
        className="input-field px-2 text-center"
        aria-label="Ano de nascimento"
      >
        <option value="">Ano</option>
        {anos.map((a) => (
          <option key={a} value={a}>
            {a}
          </option>
        ))}
      </select>
    </div>
  )
}

export function SimNao({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex overflow-hidden rounded-xl border border-slate-200">
      {['Sim', 'Não'].map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className={`min-h-[44px] flex-1 py-2 text-sm font-medium transition ${
            value === opt ? 'bg-brand-500 text-white' : 'bg-white text-slate-500 hover:bg-slate-50'
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  )
}

export function CheckPill({
  label,
  checked,
  onToggle,
}: {
  label: string
  checked: boolean
  onToggle: () => void
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex min-h-[44px] items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm hover:bg-slate-50"
    >
      <span
        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border-2 ${
          checked ? 'border-brand-500 bg-brand-500' : 'border-slate-300'
        }`}
      >
        {checked && <Check size={11} strokeWidth={3} className="text-white" />}
      </span>
      <span className="text-slate-700">{label}</span>
    </button>
  )
}
