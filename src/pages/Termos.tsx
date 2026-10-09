import { Link } from 'react-router-dom'
import { FootIcon } from '@/components/BrandMark'
import { SUPPORT_EMAIL, SUPPORT_WHATSAPP_URL } from '@/lib/contact'

const ATUALIZADO_EM = '4 de agosto de 2026'

const SECTIOMS = [
  { id: 'sobre', title: '1. Sobre o Podify' },
  { id: 'assinatura', title: '2. Período de teste e assinatura' },
  { id: 'cancelamento', title: '3. Cancelamento' },
  { id: 'dados', title: '4. Seus dados e dos seus clientes' },
  { id: 'uso', title: '5. Uso adequado' },
  { id: 'responsabilidade', title: '6. Disponibilidade e responsabilidade' },
  { id: 'contato', title: '7. Contato' },
]

export default function Termos() {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-700 antialiased">
      {/* Header Fixo com Efeito Glass */}
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <Link to="/" className="group flex items-center gap-2.5 transition-opacity hover:opacity-90">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-600 transition-transform group-hover:scale-105">
              <FootIcon />
            </div>
            <span className="text-xl font-black tracking-tight text-ink-900">PODIFY</span>
          </Link>

          <Link
            to="/"
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 hover:text-ink-900 transition-colors"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Voltar ao início
          </Link>
        </div>
      </header>

      {/* Hero / Cabeçalho da Página */}
      <section className="border-b border-slate-100 bg-white py-12 sm:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50/50 px-3 py-1 text-xs font-medium text-brand-700">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-500"></span>
              </span>
              Termos Legais
            </div>

            <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-ink-900 sm:text-4xl">
              Termos de Uso
            </h1>
            <p className="mt-3 text-base text-slate-500 leading-relaxed">
              Estes termos regem o uso da plataforma Podify. Transparência e clareza para você focar no que mais importa: o cuidado com seus pacientes.
            </p>

            <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>

              Última atualização: <span className="font-medium text-slate-600">{ATUALIZADO_EM}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Conteúdo Principal com Layout em Colunas */}
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          
          {/* Navegação Lateral (Índice Sticky para Desktop) */}
          <aside className="hidden lg:col-span-4 lg:block">
            <div className="sticky top-24 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Neste documento
              </h3>
              <nav className="mt-4 flex flex-col space-y-1">
                {SECTIOMS.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    className="group flex items-center justify-between rounded-lg px-3 py-2 text-left text-xs font-medium text-slate-600 transition-all hover:bg-brand-50/60 hover:text-brand-700"
                  >
                    <span className="truncate">{item.title}</span>
                    <svg className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                ))}
              </nav>

              <div className="mt-6 border-t border-slate-100 pt-5">
                <p className="text-xs text-slate-500">
                  Dúvidas sobre o documento?
                </p>
                <a
                  href={SUPPORT_WHATSAPP_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-slate-800"
                >
                  Falar com o Suporte
                </a>
              </div>
            </div>
          </aside>

          {/* Conteúdo dos Termos */}
          <div className="space-y-8 lg:col-span-8">
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8 space-y-10">
              
              <section id="sobre" className="scroll-mt-28">
                <div className="flex items-center gap-2 text-brand-600 font-semibold text-xs uppercase tracking-wider mb-1">
                  Visão Geral
                </div>
                <h2 className="text-xl font-bold text-ink-900">1. Sobre o Podify</h2>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">
                  O Podify é uma plataforma de gestão desenvolvida especialmente para podólogos e clínicas de podologia. Oferecemos cadastro simplificado de clientes, fichas de anamnese digitais, agenda inteligente, controle financeiro, gestão de estoque e suporte via assistente de inteligência artificial. Ao criar uma conta e utilizar o sistema, você concorda com os termos aqui apresentados.
                </p>
              </section>

              <hr className="border-slate-100" />

              <section id="assinatura" className="scroll-mt-28">
                <div className="flex items-center gap-2 text-brand-600 font-semibold text-xs uppercase tracking-wider mb-1">
                  Planos e Valores
                </div>
                <h2 className="text-xl font-bold text-ink-900">2. Período de teste e assinatura</h2>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">
                  Toda nova conta cadastrada ganha **7 dias de teste grátis** com acesso total aos recursos do Podify, sem a necessidade de cartão imediato. Após o período experimental, para continuar utilizando o sistema, é necessário assinar o plano **PODIFY Pro (R$ 29,90/mês)**.
                </p>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  A cobrança é recorrente mensal e pode ser realizada via Pix ou cartão de crédito, processada com total segurança através da Asaas Instituição de Pagamento S.A. Você pode cadastrar os dados de pagamento em qualquer momento durante o trial; o primeiro débito só ocorrerá após o término dos 7 dias gratuitos.
                </p>
              </section>

              <hr className="border-slate-100" />

              <section id="cancelamento" className="scroll-mt-28">
                <div className="flex items-center gap-2 text-brand-600 font-semibold text-xs uppercase tracking-wider mb-1">
                  Flexibilidade
                </div>
                <h2 className="text-xl font-bold text-ink-900">3. Cancelamento</h2>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">
                  Sua assinatura pode ser cancelada a qualquer momento, sem complicações, multas ou fidelidade. O cancelamento é realizado diretamente no painel de controle (<code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-700">Assinatura → Cancelar assinatura</code>) ou mediante contato com o nosso suporte.
                </p>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  Após solicitar o cancelamento, seu acesso aos recursos Pro permanecerá ativo até o final do período já pago. Em seguida, a conta passa para o plano restrito: seus dados continuam armazenados em segurança, mas o acesso às ferramentas pagas fica pausado até que uma nova assinatura seja realizada.
                </p>
              </section>

              <hr className="border-slate-100" />

              <section id="dados" className="scroll-mt-28">
                <div className="flex items-center gap-2 text-brand-600 font-semibold text-xs uppercase tracking-wider mb-1">
                  Privacidade
                </div>
                <h2 className="text-xl font-bold text-ink-900">4. Seus dados e dos seus clientes</h2>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">
                  A propriedade de todos os dados inseridos na plataforma (cadastros, prontuários, fichas de anamnese, registros financeiros e estoques) pertence exclusivamente a você. O Podify não vende, aluga ou compartilha esses dados com terceiros para fins comerciais.
                </p>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  Para saber como tratamos as informações pessoais e o cumprimento do tratamento de dados dos pacientes da sua clínica, acesse a nossa{' '}
                  <Link to="/privacidade" className="font-semibold text-brand-600 hover:underline">
                    Política de Privacidade
                  </Link>.
                </p>
              </section>

              <hr className="border-slate-100" />

              <section id="uso" className="scroll-mt-28">
                <div className="flex items-center gap-2 text-brand-600 font-semibold text-xs uppercase tracking-wider mb-1">
                  Regras da Plataforma
                </div>
                <h2 className="text-xl font-bold text-ink-900">5. Uso adequado</h2>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">
                  O Podify deve ser utilizado estritamente para a gestão legítima de atividades ligadas à podologia. É vedado utilizar a plataforma para armazenar dados ilícitos, tentar acessar dados de outros usuários ou violar qualquer diretriz da legislação brasileira vigente, como a Lei Geral de Proteção de Dados (LGPD).
                </p>
              </section>

              <hr className="border-slate-100" />

              <section id="responsabilidade" className="scroll-mt-28">
                <div className="flex items-center gap-2 text-brand-600 font-semibold text-xs uppercase tracking-wider mb-1">
                  Garantias
                </div>
                <h2 className="text-xl font-bold text-ink-900">6. Disponibilidade e limitação de responsabilidade</h2>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">
                  Trabalhamos continuamente para garantir a alta disponibilidade do sistema, contudo, não garantimos operação 100% ininterrupta livre de falhas externas. Recomendamos que o profissional mantenha rotinas de conferência de dados relevantes.
                </p>
                
                {/* Destaque para o aviso sobre a IA (LIA) */}
                <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50/60 p-4 text-amber-900">
                  <div className="flex gap-3">
                    <svg className="h-5 w-5 shrink-0 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-xs leading-relaxed text-amber-800">
                      <strong className="font-semibold text-amber-900">Aviso sobre a Assistente de IA (LIA):</strong> O Podify não se responsabiliza por condutas ou decisões clínicas tomadas com base nas sugestões prestadas pela LIA. Ela funciona como um recurso auxiliar de consulta e não substitui a avaliação clínica nem o parecer técnico do podólogo responsável.
                    </p>
                  </div>
                </div>
              </section>

              <hr className="border-slate-100" />

              <section id="contato" className="scroll-mt-28">
                <div className="flex items-center gap-2 text-brand-600 font-semibold text-xs uppercase tracking-wider mb-1">
                  Atendimento
                </div>
                <h2 className="text-xl font-bold text-ink-900">7. Contato</h2>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">
                  Tem dúvidas sobre estes Termos de Uso ou precisa de auxílio com a sua conta? Nossa equipe está à disposição:
                </p>

                <div className="mt-4 flex flex-wrap gap-3">
                  <a
                    href={SUPPORT_WHATSAPP_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-2.5 text-xs font-semibold text-emerald-700 border border-emerald-200/80 transition-colors hover:bg-emerald-100"
                  >
                    <span>WhatsApp</span>
                  </a>

                  <a
                    href={`mailto:${SUPPORT_EMAIL}`}
                    className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2.5 text-xs font-semibold text-slate-700 border border-slate-200/80 transition-colors hover:bg-slate-200"
                  >
                    <span>{SUPPORT_EMAIL}</span>
                  </a>
                </div>
              </section>

            </div>

            {/* Link para voltar no final */}
            <div className="flex items-center justify-between pt-2">
              <Link
                to="/"
                className="inline-flex items-center gap-2 text-sm font-semibold text-brand-600 hover:text-brand-700 hover:underline"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Voltar para a página inicial
              </Link>
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}