# Podify

Sistema de gestão para podólogos (SaaS multi-tenant) — React + Vite + TypeScript + Tailwind + Supabase.

## Setup

```bash
npm install
cp .env.example .env   # já vem preenchido com URL e chave publicável do projeto Podify
npm run dev
```

Abre em `http://localhost:5173`.

## Estrutura

- `src/pages/` — uma pasta/arquivo por tela (Dashboard, Clientes, Anamnese, Agenda, LIA Podologa, Financeiro, Estoque, Fornecedores, Assinatura)
- `src/store/authStore.ts` — Zustand, sessão e perfil do usuário
- `src/lib/supabase.ts` — client do Supabase
- `src/types/database.ts` — tipos gerados do schema real (gere de novo com `supabase gen types typescript` se alterar o banco)
- `supabase/functions/lia-chat/` — Edge Function que conecta a LIA Podologa à Claude API

## Banco de dados

Projeto Supabase: `Podify` (ref `ilbgywngoxqdtvrftoyr`, região `sa-east-1`), organização `vistoria-app`.

Tabelas: `profiles`, `clientes`, `anamneses`, `anamnese_fotos`, `consultas`, `financeiro_registros`,
`estoque_produtos`, `fornecedores`, `lia_conversas`, `lia_mensagens`. RLS ativo em todas —
cada usuário só vê seus próprios dados (`owner_id = auth.uid()`), isolamento total entre contas
(podólogo ou clínica pagante = 1 conta = 1 espaço isolado).

## Pra colocar a LIA Podologa pra funcionar

```bash
supabase login
supabase link --project-ref ilbgywngoxqdtvrftoyr
supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
supabase functions deploy lia-chat
```

## Assinatura (Asaas) — Pix e cartão de crédito

Plano único PODIFY Pro, R$ 29,90/mês recorrente. Quatro Edge Functions cuidam disso. Cada
uma tem sua própria cópia de `_shared/asaas.ts` (helper de request/timeout/erro) — o
deploy via MCP empacota cada function isoladamente e não resolve import que escapa da
pasta da function (`../_shared/...` não funciona nesse pipeline de deploy, só
`./_shared/...` dentro da própria pasta), então em vez de um `_shared/` único no nível de
`supabase/functions/`, o mesmo arquivo é replicado (byte a byte) dentro de
`asaas-checkout/`, `asaas-webhook/`, `asaas-cancel/` e `asaas-faturas/`. Se editar a
lógica de `asaasFetch`/`buscarProximoVencimento`, replique nas 4 cópias.

- `supabase/functions/asaas-checkout/` — cria o customer (se ainda não existir) e a
  assinatura no Asaas, chamada pelo frontend (`Assinatura.tsx`) quando o usuário clica em
  "Assinar agora". Exige o usuário estar logado (JWT do Supabase).
- `supabase/functions/asaas-cancel/` — cancela a assinatura no Asaas e já atualiza o
  profile na hora, chamada pelo frontend quando o usuário clica em "Cancelar assinatura".
- `supabase/functions/asaas-webhook/` — recebe os eventos de pagamento do Asaas e atualiza
  `profiles.plano` / `assinatura_status` / `assinatura_expira_em`.
- `supabase/functions/asaas-faturas/` — devolve as últimas cobranças da assinatura do
  usuário logado (histórico de faturas na tela de Assinatura), buscando ao vivo na API do
  Asaas — não há tabela local de faturas.

### 1. Configurar os secrets (nunca commitar a chave em arquivo nenhum)

```bash
supabase secrets set ASAAS_API_KEY=<sua chave de API do Asaas>
supabase secrets set ASAAS_WEBHOOK_TOKEN=<um token qualquer, só você e o Asaas precisam saber>
```

O `ASAAS_WEBHOOK_TOKEN` é um valor que **você escolhe** (ex: uma string aleatória longa) —
ele só serve pra `asaas-webhook` confirmar que quem está chamando de verdade é o Asaas e não
qualquer um na internet. Repita o mesmo valor no passo 3.

⚠️ **Débito de segurança conhecido**: esse secret nunca foi configurado no projeto, então
`asaas-webhook` roda hoje sobre um token padrão fixo no código-fonte
(`ASAAS_WEBHOOK_TOKEN_PADRAO`, em `asaas-webhook/index.ts`) — o mesmo valor que já está
cadastrado no painel do Asaas. Qualquer pessoa com acesso ao repositório consegue ver esse
token e forjar chamadas ao webhook. Setar o secret de verdade (`supabase secrets set
ASAAS_WEBHOOK_TOKEN=<token novo>`) e trocar o token correspondente no painel do Asaas
resolve isso — ficou pendente porque exige uma ação manual (trocar o valor no painel do
Asaas) que não foi feita ainda.

### 2. Deploy das functions

```bash
supabase functions deploy asaas-checkout
supabase functions deploy asaas-cancel
supabase functions deploy asaas-webhook --no-verify-jwt
supabase functions deploy asaas-faturas
```

(`asaas-webhook` precisa de `--no-verify-jwt` porque quem chama é o Asaas, não um usuário
logado do Podify — a autenticação dela é o token do passo 1/3, não um JWT do Supabase.)

### 3. Configurar o webhook no painel do Asaas

No painel do Asaas: **Configurações → Integrações → Webhooks** → "Novo Webhook"

- **URL**: `https://ilbgywngoxqdtvrftoyr.supabase.co/functions/v1/asaas-webhook`
- **E-mail para notificações de erro**: o seu, opcional
- **Token de autenticação**: cole o **mesmo valor** que você usou em `ASAAS_WEBHOOK_TOKEN`
  no passo 1 — o Asaas manda esse valor no header `asaas-access-token` em toda chamada, e a
  function rejeita (401) qualquer chamada que não bata com o secret configurado
- **Eventos**: marque pelo menos
  - `PAYMENT_CONFIRMED`
  - `PAYMENT_RECEIVED`
  - `PAYMENT_OVERDUE`
  - `SUBSCRIPTION_DELETED`
  - `PAYMENT_DELETED`
- Salve e deixe o webhook **ativo**

### Como funciona por dentro

- `profiles.asaas_customer_id` / `asaas_subscription_id` guardam os IDs do Asaas — criados
  uma vez só, reaproveitados em assinaturas futuras.
- `profiles.cpf_cnpj` é salvo no primeiro checkout (o Asaas exige CPF/CNPJ pra criar o
  customer).
- Pix: a function busca o QR code (`encodedImage` + `payload` copia-e-cola) da primeira
  cobrança gerada e devolve pro frontend mostrar. A tela faz polling em
  `profiles.assinatura_status` a cada 5s até o webhook confirmar o pagamento e trocar a UI
  sozinha.
- Cartão: os dados do cartão + do titular (CEP, número do endereço — exigidos pelo Asaas
  pra antifraude) vão direto no corpo da criação da assinatura (`creditCard` +
  `creditCardHolderInfo`).
- `assinatura_status`: `'ativa'` (pagamento confirmado), `'pendente'` (fatura vencida),
  `'cancelada'` (assinatura/cobrança excluída no Asaas) — e `plano` vira `'pro'` só quando
  ativa, `'expirado'` quando cancelada.
- Toda chamada à API do Asaas tem timeout de 15s (`AbortSignal.timeout` em
  `_shared/asaas.ts`) — se o Asaas estiver instável, a function falha rápido com uma
  mensagem amigável em vez de travar a tela do usuário.
- O `nextDueDate` (data da próxima cobrança) **nunca é calculado no nosso código** — é
  sempre o valor que o próprio Asaas devolve (`GET /subscriptions/{id}`), tanto na criação
  da assinatura quanto quando o webhook confirma um pagamento. Isso evita bug de mês
  curto/ano bissexto (ex: assinar dia 31 e o mês seguinte não ter dia 31).
- **Trial de 7 dias**: `profiles.trial_expira_em` tem `DEFAULT now() + interval '7 days'`
  — preenchido pelo próprio banco em toda conta nova (cobre signup por e-mail/senha e
  Google OAuth, já que ambos passam pelo mesmo trigger `handle_new_user`). Se o usuário
  clica "Assinar agora" **durante o trial ainda ativo**, `asaas-checkout` cria a
  subscription com `nextDueDate = trial_expira_em` (não amanhã) — ele já cadastra a forma
  de pagamento, mas só é cobrado quando o trial acabar de verdade. O job diário
  (`expirar_assinaturas_vencidas`) também baixa pra `'expirado'` quem teve o trial vencido
  sem nunca ter cadastrado uma assinatura (`asaas_subscription_id is null`) — quem
  cadastrou fica por conta do webhook do Asaas decidir o desfecho da cobrança.

Plano de teste manual dos cenários de ciclo de cobrança (assinar dia 1/15/31/29-jan,
simular webhooks, cancelar, cartão recusado) e a estratégia pra testar contra o sandbox do
Asaas sem mexer nos secrets de produção: ver `TESTES-ASAAS.md`.

## Pendências conhecidas (próximos passos)

- **Login com Google**: precisa configurar o provider OAuth no painel do Supabase (Authentication → Providers → Google) com Client ID/Secret do Google Cloud Console.
- **Exportar PDF da anamnese**: hoje usa `window.print()` (impressão do navegador). Pra um PDF "de verdade" com o layout da ficha, dá pra integrar `react-to-print` ou gerar server-side via Edge Function.
- **Cálculo de idade automático**: o campo Idade ainda é manual; dá pra calcular a partir da Data de Nascimento.
- Cobertura de mobile: testado no breakpoint, mas vale revisar em dispositivo real antes de lançar.
