interface DbError {
  message?: string
}

// Erros do Postgres/PostgREST vêm em inglês e cheios de detalhe técnico
// (ex: "numeric field overflow"), diferente dos erros do Supabase Auth
// que já vêm em linguagem humana. Por isso aqui o padrão é o oposto do
// authErrorMessage: só deixa passar mensagens que reconhecemos e sabemos
// traduzir; qualquer coisa não mapeada cai no fallback amigável.
const PADROES_CONHECIDOS: { teste: (msg: string) => boolean; mensagem: string }[] = [
  {
    teste: (m) => m.includes('numeric field overflow'),
    mensagem: 'Valor muito alto. Verifique se digitou corretamente.',
  },
  {
    teste: (m) => m.includes('invalid input syntax for type numeric'),
    mensagem: 'Valor inválido. Digite apenas números.',
  },
  {
    teste: (m) => m.includes('invalid input syntax for type date'),
    mensagem: 'Data inválida.',
  },
]

export function dbErrorMessage(error: DbError | null | undefined, fallback: string): string {
  if (!error) return fallback
  const msg = error.message?.trim() ?? ''
  const conhecido = PADROES_CONHECIDOS.find((p) => p.teste(msg))
  return conhecido ? conhecido.mensagem : fallback
}
