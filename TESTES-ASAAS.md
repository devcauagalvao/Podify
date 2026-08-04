# Plano de teste manual — fluxo de assinatura (Asaas)

Este documento cobre os 8 cenários de validação do ciclo de cobrança recorrente e do
tratamento de webhooks. **Nenhum destes testes foi executado ao vivo** durante a sessão
que endureceu o código (`_shared/asaas.ts`, `asaas-checkout`, `asaas-webhook`,
`asaas-cancel`, `asaas-faturas`) — não havia credencial de sandbox do Asaas disponível
naquele momento. O código foi revisado linha a linha e comparado com o comportamento
anterior (diff), mas só um teste ao vivo confirma o comportamento real do Asaas,
especialmente o ajuste de `nextDueDate` em meses curtos (cenários c e d).

**NUNCA rode nada disto contra as contas reais migradas** (kleberathayde,
recepcaoclinicapodologia, clau_santoss, savioli.nm, giseleguilhen.podologia) nem contra a
chave de produção do Asaas. Crie sempre uma conta de teste descartável nova.

## Isolamento — como testar sem tocar produção

**Importante**: os secrets `ASAAS_API_KEY` / `ASAAS_API_URL` no Supabase são
**globais ao projeto**, não por function — se você setar um valor de sandbox neles, TODAS
as functions (inclusive as que atendem usuários reais agora) passam a apontar pro
sandbox. Nunca faça isso direto no projeto de produção (`ilbgywngoxqdtvrftoyr`).

### Opção recomendada: branch de desenvolvimento do Supabase

Uma branch do Supabase (via `create_branch`) é um ambiente isolado — Postgres, Auth e
Edge Functions próprios, com secrets separados dos de produção:

1. Criar a branch (MCP `create_branch` ou painel do Supabase).
2. Nessa branch: `supabase secrets set ASAAS_API_KEY=<chave de sandbox>` e
   `ASAAS_API_URL=https://api-sandbox.asaas.com/v3` (a URL de sandbox do Asaas).
3. Deploy das 4 functions (`asaas-checkout`, `asaas-webhook --no-verify-jwt`,
   `asaas-cancel`, `asaas-faturas`) + o `_shared/asaas.ts` nessa branch.
4. No painel do Asaas **sandbox** (não o de produção — é outra conta/login em
   `sandbox.asaas.com`), configurar o webhook apontando pra URL da function na branch.
5. Rodar os cenários abaixo contra essa branch.
6. Ao terminar: `delete_branch` — apaga tudo, zero resíduo.

### Fallback (se branching não for viável)

Trocar temporariamente `ASAAS_API_KEY`/`ASAAS_API_URL` do projeto principal pra sandbox,
testar rápido, reverter os secrets **imediatamente** depois. Risco real: qualquer
pagamento de cliente real que caia nesse intervalo não sincroniza corretamente. Só use
isso numa janela curta e fora de horário de uso, e confirme os secrets revertidos antes
de sair.

## Conta de teste

Siga o mesmo padrão usado no teste do bloqueio de acesso: signup real via
`/auth/v1/signup` com um e-mail tipo `seuemail+asaas-teste-N@gmail.com`, confirmar
`email_confirmed_at` via SQL, testar, depois `DELETE FROM auth.users WHERE id = ...`
(cascata limpa o profile). Um profile novo por cenário evita que o estado de um teste
vaze pro outro.

---

## a) Assinar no dia 1 do mês

1. Ajustar a data do teste (ou simplesmente rodar no dia 1) e assinar via `CheckoutModal`
   (Pix, mais simples de confirmar manualmente no sandbox).
2. Checar a resposta do `asaas-checkout` — `subscriptionId` retornado.
3. `execute_sql`: `select assinatura_expira_em from profiles where id = '<uuid-teste>';`
4. **Esperado**: `assinatura_expira_em` = dia 1 do mês seguinte (a subscription já nasce
   com `nextDueDate` = amanhã, e o `GET /subscriptions/{id}` de confirmação deve trazer o
   próprio dia 1 como data de cobrança recorrente definida pelo Asaas).

## b) Assinar no dia 15

Mesmos passos do (a). **Esperado**: `assinatura_expira_em` cai no dia 15 do mês seguinte
— caso "normal", sem ajuste de calendário.

## c) Assinar no dia 31 de um mês de 31 dias

1. Assinar num dia 31 (ex: 31/01, 31/03, 31/05...).
2. **Esperado**: a cobrança do mês seguinte cai no **último dia daquele mês** se ele tiver
   menos de 31 dias (ex: 31/01 → 28/02 ou 29/02, nunca "3 de março"). Esse ajuste é feito
   pelo próprio Asaas — o nosso código só grava o `nextDueDate` que ele devolve
   (`buscarProximoVencimento` em `_shared/asaas.ts`), nunca calcula a data sozinho. Esse é
   o cenário mais importante de confirmar ao vivo, porque é comportamento do lado de fora
   do nosso controle.

## d) Assinar no dia 29 de janeiro (ano não bissexto)

Variante do (c), focada especificamente em fevereiro sem dia 29. **Esperado**: cobrança
seguinte cai em 28/02 (ano não bissexto) sem erro, sem pular pra março.

## e) Simular `PAYMENT_CONFIRMED` via webhook de teste

1. No painel do Asaas sandbox, reenviar manualmente um webhook `PAYMENT_CONFIRMED` (ou
   `PAYMENT_RECEIVED`) de uma cobrança da subscription de teste — ou `curl` direto pro
   endpoint da function com o payload de exemplo do Asaas e o header
   `asaas-access-token: <ASAAS_WEBHOOK_TOKEN>`.
2. `execute_sql`: conferir `plano = 'pro'`, `assinatura_status = 'ativa'`, e
   `assinatura_expira_em` batendo com o `nextDueDate` real da subscription (comparar com
   `GET /subscriptions/{id}` direto na API do Asaas).
3. Também testar o caminho de falha: se a chamada ao Asaas dentro do webhook falhar
   (ex: derrubar a rede momentaneamente), `assinatura_expira_em` **não deve virar null** —
   deve manter o valor anterior (esse é o bug corrigido nesta revisão; antes disso, uma
   falha na busca sobrescrevia a data com `null` e o profile virava "vitalício" por
   engano).

## f) Simular `PAYMENT_OVERDUE`

1. Reenviar/simular o evento `PAYMENT_OVERDUE`.
2. **Esperado**: `assinatura_status` vira `'pendente'` imediatamente (sem esperar o cron
   diário `expirar_assinaturas_vencidas`). `plano` e `assinatura_expira_em` não mudam
   nesse evento.
3. Conferir a integração com o bloqueio de acesso: como `PAYMENT_OVERDUE` só dispara
   depois que a data de vencimento já passou, a essa altura `assinatura_expira_em` já
   deve estar no passado — então `ProtectedRoute.tsx` já bloqueia o acesso pela checagem
   de data, independente do `assinatura_status`. Confirmar redirecionando pra
   `/assinatura` com a conta de teste (mesmo teste já feito na tarefa anterior de
   bloqueio de acesso).

## g) Cancelar assinatura

1. Com a conta de teste tendo uma assinatura ativa, clicar "Cancelar assinatura" na tela
   (ou chamar `asaas-cancel` direto).
2. **Esperado**: resposta `{ ok: true }` (200 — antes desse trabalho, a function nem
   estava deployada, então isso hoje devolve 404 pra qualquer usuário real; parte central
   do que foi corrigido).
3. `execute_sql`: `plano = 'expirado'`, `assinatura_status = 'cancelada'`.
4. Conferir no painel do Asaas sandbox que a subscription foi de fato removida/cancelada
   lá (`DELETE /subscriptions/{id}` deve refletir no painel).
5. Confirmar que o acesso é bloqueado: logar com a conta de teste, tentar `/clientes` ou
   `/dashboard`, esperado redirecionar pra `/assinatura` (mesma trava já validada
   anteriormente, agora disparada por `plano = 'expirado'` em vez de data vencida).

## h) Cartão de teste recusado

1. Usar um dos números de cartão de teste de recusa do sandbox Asaas (documentados no
   próprio painel/doc do Asaas — mudam ocasionalmente, conferir lá) no `CheckoutModal`,
   aba "Cartão de Crédito".
2. **Esperado**: `asaas-checkout` devolve 400 com
   `{ error: "O pagamento foi recusado...", cardDeclined: true }`.
3. Na UI: mensagem amigável aparece no modal (não trava, não é um "erro genérico"), e o
   botão **"Pagar com Pix em vez disso"** aparece — clicar nele deve trocar
   `formaPagamento` pra Pix sem fechar o modal nem perder nome/CPF já preenchidos, e
   deixar o usuário confirmar via Pix na sequência.

---

## Resultado

Preencha depois de rodar contra o sandbox:

| Cenário | Resultado | Observações |
|---|---|---|
| a) dia 1 | pendente | |
| b) dia 15 | pendente | |
| c) dia 31 → mês curto | pendente | |
| d) 29/jan → fev não bissexto | pendente | |
| e) PAYMENT_CONFIRMED | pendente | |
| f) PAYMENT_OVERDUE | pendente | |
| g) cancelar assinatura | pendente | |
| h) cartão recusado | pendente | |
