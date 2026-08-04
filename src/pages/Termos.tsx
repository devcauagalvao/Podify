import { Link } from 'react-router-dom'
import { FootIcon } from '@/components/BrandMark'
import { SUPPORT_EMAIL, SUPPORT_WHATSAPP_URL } from '@/lib/contact'

// Texto-base de Termos de Uso — cobre o essencial (assinatura, trial,
// cancelamento, propriedade dos dados) mas NÃO substitui revisão jurídica
// antes de operar com clientes pagantes de verdade.
const ATUALIZADO_EM = '4 de agosto de 2026'

export default function Termos() {
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
        <h1 className="text-3xl font-extrabold text-ink-900">Termos de Uso</h1>
        <p className="mt-2 text-sm text-slate-500">Última atualização: {ATUALIZADO_EM}</p>

        <div className="mt-8 space-y-8 text-sm leading-relaxed text-slate-600">
          <section>
            <h2 className="mb-2 text-base font-bold text-ink-900">1. Sobre o Podify</h2>
            <p>
              O Podify é uma plataforma de gestão para podólogos e clínicas de podologia,
              oferecendo cadastro de clientes, fichas de anamnese digitais, agenda, controle
              financeiro, controle de estoque e assistente de IA especializada. Ao criar uma
              conta, você concorda com estes Termos de Uso.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-bold text-ink-900">2. Período de teste e assinatura</h2>
            <p>
              Toda conta nova tem direito a 7 dias grátis de acesso completo ao Podify, sem
              custo. Após esse período, para continuar usando o sistema é necessário assinar o
              plano PODIFY Pro (R$ 29,90/mês), com cobrança recorrente mensal via Pix ou cartão
              de crédito, processada pela Asaas Instituição de Pagamento S.A. Você pode
              cadastrar sua forma de pagamento a qualquer momento durante o trial — a primeira
              cobrança só acontece quando o período gratuito termina.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-bold text-ink-900">3. Cancelamento</h2>
            <p>
              Você pode cancelar sua assinatura quando quiser, diretamente pelo painel
              (Assinatura → Cancelar assinatura) ou entrando em contato com o suporte. Não há
              multa nem fidelidade. O acesso aos recursos Pro continua até o fim do período já
              pago; depois disso, sua conta permanece com os dados guardados, mas sem acesso às
              funcionalidades pagas até uma nova assinatura.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-bold text-ink-900">4. Seus dados e dos seus clientes</h2>
            <p>
              Os dados que você cadastra no Podify (clientes, fichas de anamnese, agenda,
              financeiro, estoque) são seus. Não vendemos nem compartilhamos esses dados com
              terceiros para fins comerciais. Veja a{' '}
              <Link to="/privacidade" className="font-medium text-brand-600 hover:underline">
                Política de Privacidade
              </Link>{' '}
              para detalhes de como tratamos dados pessoais, inclusive dos clientes da sua
              clínica cadastrados no sistema.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-bold text-ink-900">5. Uso adequado</h2>
            <p>
              O Podify deve ser usado para gestão legítima de clínica de podologia. Não é
              permitido usar a plataforma para armazenar dados de terceiros sem autorização,
              tentar acessar contas de outros usuários, ou qualquer uso que viole a legislação
              brasileira aplicável, incluindo a Lei Geral de Proteção de Dados (LGPD).
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-bold text-ink-900">6. Disponibilidade e limitação de responsabilidade</h2>
            <p>
              Fazemos o possível para manter o Podify disponível e funcionando corretamente,
              mas não garantimos operação ininterrupta. Recomendamos manter backups próprios de
              informações críticas. O Podify não se responsabiliza por decisões clínicas
              tomadas com base em sugestões da LIA (assistente de IA) — ela é uma ferramenta de
              apoio, não substitui o julgamento profissional do podólogo.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-bold text-ink-900">7. Contato</h2>
            <p>
              Dúvidas sobre estes termos? Fale com a gente pelo{' '}
              <a href={SUPPORT_WHATSAPP_URL} target="_blank" rel="noreferrer" className="font-medium text-brand-600 hover:underline">
                WhatsApp
              </a>{' '}
              ou por{' '}
              <a href={`mailto:${SUPPORT_EMAIL}`} className="font-medium text-brand-600 hover:underline">
                {SUPPORT_EMAIL}
              </a>
              .
            </p>
          </section>
        </div>

        <Link to="/" className="mt-10 inline-block text-sm font-medium text-brand-600 hover:underline">
          ← Voltar para o início
        </Link>
      </main>
    </div>
  )
}
