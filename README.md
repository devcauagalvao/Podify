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

## Pendências conhecidas (próximos passos)

- **Login com Google**: precisa configurar o provider OAuth no painel do Supabase (Authentication → Providers → Google) com Client ID/Secret do Google Cloud Console.
- **Assinatura/Asaas**: a tela de Assinatura hoje é só visual. Falta a Edge Function que cria cobrança recorrente no Asaas e o webhook que atualiza `profiles.plano`/`assinatura_status` quando o pagamento é confirmado (mesmo padrão usado no Vistoora).
- **Exportar PDF da anamnese**: hoje usa `window.print()` (impressão do navegador). Pra um PDF "de verdade" com o layout da ficha, dá pra integrar `react-to-print` ou gerar server-side via Edge Function.
- **Cálculo de idade automático**: o campo Idade ainda é manual; dá pra calcular a partir da Data de Nascimento.
- Cobertura de mobile: testado no breakpoint, mas vale revisar em dispositivo real antes de lançar.
