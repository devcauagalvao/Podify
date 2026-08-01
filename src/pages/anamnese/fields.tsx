import type { ReactNode } from 'react'

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
  children,
}: {
  label: string
  full?: boolean
  children: ReactNode
}) {
  return (
    <div className={full ? 'sm:col-span-2 lg:col-span-3' : ''}>
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
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  type?: string
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="input-field"
    />
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

export function SimNao({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex overflow-hidden rounded-xl border border-slate-200">
      {['Sim', 'Não'].map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className={`flex-1 py-2 text-sm font-medium transition ${
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
      className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm hover:bg-slate-50"
    >
      <span
        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 ${
          checked ? 'border-brand-500 bg-brand-500' : 'border-slate-300'
        }`}
      >
        {checked && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
      </span>
      <span className="text-slate-700">{label}</span>
    </button>
  )
}
