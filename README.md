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

Plano único PODIFY Pro, R$ 29,90/mês recorrente. Duas Edge Functions cuidam disso:

- `supabase/functions/asaas-checkout/` — cria o customer (se ainda não existir) e a
  assinatura no Asaas, chamada pelo frontend (`Assinatura.tsx`) quando o usuário clica em
  "Assinar agora". Exige o usuário estar logado (JWT do Supabase).
- `supabase/functions/asaas-webhook/` — recebe os eventos de pagamento do Asaas e atualiza
  `profiles.plano` / `assinatura_status` / `assinatura_expira_em`.

### 1. Configurar os secrets (nunca commitar a chave em arquivo nenhum)

```bash
supabase secrets set ASAAS_API_KEY=<sua chave de API do Asaas>
supabase secrets set ASAAS_WEBHOOK_TOKEN=<um token qualquer, só você e o Asaas precisam saber>
```

O `ASAAS_WEBHOOK_TOKEN` é um valor que **você escolhe** (ex: uma string aleatória longa) —
ele só serve pra `asaas-webhook` confirmar que quem está chamando de verdade é o Asaas e não
qualquer um na internet. Repita o mesmo valor no passo 3.

### 2. Deploy das functions

```bash
supabase functions deploy asaas-checkout
supabase functions deploy asaas-webhook --no-verify-jwt
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

## Pendências conhecidas (próximos passos)

- **Login com Google**: precisa configurar o provider OAuth no painel do Supabase (Authentication → Providers → Google) com Client ID/Secret do Google Cloud Console.
- **Exportar PDF da anamnese**: hoje usa `window.print()` (impressão do navegador). Pra um PDF "de verdade" com o layout da ficha, dá pra integrar `react-to-print` ou gerar server-side via Edge Function.
- **Cálculo de idade automático**: o campo Idade ainda é manual; dá pra calcular a partir da Data de Nascimento.
- Cobertura de mobile: testado no breakpoint, mas vale revisar em dispositivo real antes de lançar.
