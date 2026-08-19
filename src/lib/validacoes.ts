function somenteDigitos(v: string) {
  return v.replace(/\D/g, '')
}

/** Valida CPF pelo algoritmo padrão de dígitos verificadores (módulo 11). */
export function validarCpf(cpf: string): boolean {
  const d = somenteDigitos(cpf)
  if (d.length !== 11 || /^(\d)\1{10}$/.test(d)) return false

  const calcularDigito = (base: string, pesoInicial: number) => {
    let soma = 0
    for (let i = 0; i < base.length; i++) soma += Number(base[i]) * (pesoInicial - i)
    const resto = (soma * 10) % 11
    return resto === 10 ? 0 : resto
  }

  const d1 = calcularDigito(d.slice(0, 9), 10)
  const d2 = calcularDigito(d.slice(0, 9) + d1, 11)
  return d === d.slice(0, 9) + String(d1) + String(d2)
}

/** Valida CNPJ pelo algoritmo padrão de dígitos verificadores (módulo 11). */
export function validarCnpj(cnpj: string): boolean {
  const d = somenteDigitos(cnpj)
  if (d.length !== 14 || /^(\d)\1{13}$/.test(d)) return false

  const calcularDigito = (base: string, pesos: number[]) => {
    let soma = 0
    for (let i = 0; i < base.length; i++) soma += Number(base[i]) * pesos[i]
    const resto = soma % 11
    return resto < 2 ? 0 : 11 - resto
  }

  const pesos1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
  const pesos2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
  const d1 = calcularDigito(d.slice(0, 12), pesos1)
  const d2 = calcularDigito(d.slice(0, 12) + d1, pesos2)
  return d === d.slice(0, 12) + String(d1) + String(d2)
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** Valida formato básico de e-mail (algo@algo.algo, sem espaços). */
export function validarEmail(email: string): boolean {
  return EMAIL_REGEX.test(email.trim())
}

/**
 * Valida um campo que aceita CPF (11 dígitos) ou CNPJ (14 dígitos), como os
 * campos mascarados com `mascaraCpfCnpj`. Retorna null se o valor estiver
 * vazio (campo opcional) ou for válido, e uma mensagem de erro clara caso
 * contrário.
 */
export function erroCpfCnpj(v: string): string | null {
  const d = somenteDigitos(v)
  if (!d) return null
  if (d.length <= 11) {
    return validarCpf(d) ? null : 'CPF inválido. Verifique os números digitados.'
  }
  return validarCnpj(d) ? null : 'CNPJ inválido. Verifique os números digitados.'
}
