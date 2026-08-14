import { Link } from 'react-router-dom'
import { FootIcon } from '@/components/BrandMark'
import { SUPPORT_EMAIL } from '@/lib/contact'

// Página exigida pela Google Play (Data Safety / política de exclusão de
// conta) — precisa ficar pública, sem login, em /excluir-conta.
export default function ExcluirConta() {
  return (
    <div className="min-h-screen bg-surface">
      <header className="border-b border-slate-100 bg-white">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-6 py-5">
          <Link to="/" className="flex items-center gap-2">
            <FootIcon />
            <span className="text-lg font-extrabold text-ink-900">PODIFY</span>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="text-3xl font-extrabold text-ink-900">Exclusão de Conta e Dados — Podify</h1>

        <div className="mt-8 space-y-8 text-sm leading-relaxed text-slate-600">
          <section>
            <p>
              A Podify (desenvolvida pela GLV Tecnologia) permite que você solicite a exclusão
              da sua conta e dos dados associados a qualquer momento.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-bold text-ink-900">Como solicitar</h2>
            <p>
              Envie um e-mail para{' '}
              <a href={`mailto:${SUPPORT_EMAIL}`} className="font-medium text-brand-600 hover:underline">
                {SUPPORT_EMAIL}
              </a>{' '}
              a partir do endereço cadastrado na sua conta, com o assunto "Solicitação de
              Exclusão de Conta", informando seu nome completo cadastrado. Processaremos a
              exclusão em até 15 dias úteis.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-bold text-ink-900">O que é excluído</h2>
            <p>
              Seus dados de cadastro (nome, e-mail, telefone), todos os clientes/pacientes
              cadastrados por você, fichas de anamnese, fotos, histórico financeiro, de agenda
              e de estoque serão permanente e irreversivelmente excluídos.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-bold text-ink-900">O que pode ser mantido</h2>
            <p>
              Registros financeiros podem ser retidos por até 5 anos quando exigido por
              obrigações fiscais, mesmo após a exclusão da conta, conforme legislação brasileira
              aplicável.
            </p>
          </section>
        </div>

        <div className="mt-10 flex gap-4 text-sm font-medium text-brand-600">
          <Link to="/privacidade" className="hover:underline">
            Política de Privacidade
          </Link>
          <Link to="/termos" className="hover:underline">
            Termos de Uso
          </Link>
        </div>

        <Link to="/" className="mt-6 inline-block text-sm font-medium text-brand-600 hover:underline">
          ← Voltar para o início
        </Link>
      </main>
    </div>
  )
}
