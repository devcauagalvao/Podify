export function FieldError({ children }: { children?: string | null }) {
  if (!children) return null
  return <p className="mt-1 text-xs text-rose-500">{children}</p>
}

/** Classe pra aplicar no input/select/textarea: borda vermelha quando o
 * campo tem erro, mantendo o resto do estilo padrão de `.input-field`. */
export function inputErrorClass(erro?: string | null, extra = '') {
  return `input-field ${erro ? 'border-rose-500' : ''} ${extra}`.trim().replace(/\s+/g, ' ')
}
