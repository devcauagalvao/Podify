function somenteDigitos(v: string) {
  return v.replace(/\D/g, '')
}

/** Formata CPF (11 dígitos) ou CNPJ (14 dígitos) conforme a pessoa digita. */
export function mascaraCpfCnpj(v: string) {
  const d = somenteDigitos(v).slice(0, 14)
  if (d.length <= 11) {
    return d
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
  }
  return d
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1/$2')
    .replace(/(\d{4})(\d{1,2})$/, '$1-$2')
}

export function mascaraTelefone(v: string) {
  const d = somenteDigitos(v).slice(0, 11)
  if (d.length <= 10) {
    return d.replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{4})(\d{1,4})$/, '$1-$2')
  }
  return d.replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d{1,4})$/, '$1-$2')
}

export function mascaraCep(v: string) {
  return somenteDigitos(v).slice(0, 8).replace(/(\d{5})(\d{1,3})$/, '$1-$2')
}

/** Número do cartão em grupos de 4, até 19 dígitos (Amex/outras bandeiras
 * maiores também cabem). */
export function mascaraCartao(v: string) {
  const d = somenteDigitos(v).slice(0, 19)
  return d.replace(/(\d{4})(?=\d)/g, '$1 ')
}

export function mascaraValidadeCartao(v: string) {
  const d = somenteDigitos(v).slice(0, 4)
  if (d.length <= 2) return d
  return `${d.slice(0, 2)}/${d.slice(2)}`
}

export function mascaraCvv(v: string) {
  return somenteDigitos(v).slice(0, 4)
}

/** Só dígitos, até 3 caracteres — usado em campos como idade. */
export function mascaraIdade(v: string) {
  return somenteDigitos(v).slice(0, 3)
}

/** Só dígitos, até 2 caracteres — numeração de calçado (Brasil vai até ~48). */
export function mascaraNumeroCalcado(v: string) {
  return somenteDigitos(v).slice(0, 2)
}

/** Número de endereço: dígitos, com no máximo 1 letra no final (ex: "123A"),
 * pra cobrir casos reais como "123 fundos" viraria "123" e "12B" continua "12B". */
export function mascaraNumeroEndereco(v: string) {
  const limpo = v.replace(/[^0-9A-Za-z]/g, '')
  const match = limpo.match(/^(\d*)([A-Za-z]?)/)
  if (!match) return ''
  return match[1] + match[2].toUpperCase()
}
