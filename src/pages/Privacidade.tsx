import { Link } from 'react-router-dom'
import { FootIcon } from '@/components/BrandMark'
import { SUPPORT_EMAIL, SUPPORT_WHATSAPP_URL } from '@/lib/contact'

// Texto-base de Política de Privacidade, escrito com a LGPD em mente
// (dados coletados, finalidade, compartilhamento com Asaas/Supabase,
// direitos do titular) — NÃO substitui revisão jurídica antes de operar
// com clientes pagantes de verdade.
const ATUALIZADO_EM = '4 de agosto de 2026'

export default function Privacidade() {
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
        <h1 className="text-3xl font-extrabold text-ink-900">Política de Privacidade</h1>
        <p className="mt-2 text-sm text-slate-500">Última atualização: {ATUALIZADO_EM}</p>

        <div className="mt-8 space-y-8 text-sm leading-relaxed text-slate-600">
          <section>
            <h2 className="mb-2 text-base font-bold text-ink-900">1. Quais dados coletamos</h2>
            <p>
              Ao usar o Podify, coletamos: (a) dados da sua conta — nome, e-mail, telefone,
              CPF/CNPJ (para emissão de cobrança); (b) dados que você cadastra sobre seus
              clientes — nome, contato, fichas de anamnese, fotos clínicas, assinatura digital;
              (c) dados de uso da plataforma, para diagnóstico técnico e melhoria do produto.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-bold text-ink-900">2. Para que usamos esses dados</h2>
            <p>
              Usamos os dados para: operar sua conta e fornecer as funcionalidades do sistema;
              processar sua assinatura e cobranças; enviar comunicações relacionadas ao serviço
              (confirmações, avisos de cobrança, suporte); e, quando aplicável, para responder
              a obrigações legais.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-bold text-ink-900">3. Com quem compartilhamos</h2>
            <p>
              Não vendemos dados pessoais. Compartilhamos o mínimo necessário com prestadores
              que viabilizam o serviço:
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>
                <strong>Supabase</strong> — hospedagem do banco de dados e autenticação (dados
                armazenados com controle de acesso por conta, cada usuário só acessa os
                próprios registros).
              </li>
              <li>
                <strong>Asaas Instituição de Pagamento S.A.</strong> — processamento de
                cobranças (Pix e cartão de crédito) da sua assinatura.
              </li>
              <li>
                <strong>Anthropic</strong> — provedor de IA usado pela LIA Podóloga, quando você
                utiliza esse recurso.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-2 text-base font-bold text-ink-900">4. Seus direitos (LGPD)</h2>
            <p>
              Como titular de dados, você pode solicitar a qualquer momento: confirmação de
              tratamento, acesso, correção, portabilidade, anonimização ou exclusão dos seus
              dados pessoais, dentro dos limites da lei (ex: dados necessários para cumprimento
              de obrigação legal ou regulatória podem ser retidos mesmo após pedido de
              exclusão). Para exercer esses direitos, entre em contato pelos canais abaixo.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-bold text-ink-900">5. Dados dos seus clientes cadastrados no sistema</h2>
            <p>
              Você, como profissional/clínica usuária do Podify, é responsável (controlador,
              na definição da LGPD) pelos dados de seus próprios clientes que cadastra na
              plataforma — incluindo obter o consentimento adequado deles, quando necessário
              (ex: autorização de uso de imagem em fichas de anamnese). O Podify atua como
              operador desses dados, tratando-os apenas para viabilizar o funcionamento do
              sistema que você contratou.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-bold text-ink-900">6. Segurança</h2>
            <p>
              Seus dados trafegam de forma criptografada (SSL/TLS) e ficam armazenados com
              controle de acesso por conta (cada usuário só enxerga os próprios dados).
              Adotamos medidas técnicas e organizacionais razoáveis para proteger as
              informações contra acesso não autorizado, perda ou alteração indevida.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-bold text-ink-900">7. Contato</h2>
            <p>
              Dúvidas sobre esta política ou solicitações relacionadas aos seus dados? Fale
              com a gente pelo{' '}
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
