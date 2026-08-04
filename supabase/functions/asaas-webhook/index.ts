// Edge Function: asaas-webhook
// Recebe eventos de pagamento/assinatura do Asaas e atualiza
// profiles.plano / assinatura_status / assinatura_expira_em.
//
// Configuração no painel do Asaas (Configurações → Integrações → Webhooks):
//   URL: https://<project-ref>.supabase.co/functions/v1/asaas-webhook
//   Token de autenticação: o mesmo valor salvo no secret ASAAS_WEBHOOK_TOKEN
//   Eventos: PAYMENT_CONFIRMED, PAYMENT_RECEIVED, PAYMENT_OVERDUE,
//            SUBSCRIPTION_DELETED, PAYMENT_DELETED
// (ver README.md pro passo a passo completo)
//
// Requer os secrets:
//   supabase secrets set ASAAS_API_KEY=<chave>
//   supabase secrets set ASAAS_WEBHOOK_TOKEN=<token que você escolher>
//
// Deploy: supabase functions deploy asaas-webhook --no-verify-jwt
// (sem verify_jwt porque quem chama é o Asaas, não um usuário logado do
// Podify — a autenticação é feita conferindo o header asaas-access-token)
//
// SEGURANÇA (débito conhecido, não resolvido): o secret ASAAS_WEBHOOK_TOKEN
// nunca foi configurado no projeto, então esta function roda sobre o valor
// padrão abaixo desde sempre — é o valor que já está configurado no painel
// do Asaas hoje. Setar o secret de verdade (supabase secrets set
// ASAAS_WEBHOOK_TOKEN=<token novo>) e atualizar o mesmo valor no painel do
// Asaas removeria esse token fixo do código-fonte, mas foi adiado a pedido
// do usuário para não exigir nenhum passo manual agora.

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { buscarProximoVencimento } from "./_shared/asaas.ts";

const ASAAS_WEBHOOK_TOKEN_PADRAO = "51e2f614e6f00d45b83bd128ca6c149333e3a0e237ceb1ea1dfe866833540ade";

Deno.serve(async (req: Request) => {
  const tokenEsperado = Deno.env.get("ASAAS_WEBHOOK_TOKEN") ?? ASAAS_WEBHOOK_TOKEN_PADRAO;
  if (req.headers.get("asaas-access-token") !== tokenEsperado) {
    return new Response(JSON.stringify({ error: "unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  try {
    const body = await req.json();
    const evento = body?.event as string | undefined;

    // eventos de payment trazem subscription/customer dentro de "payment";
    // eventos de subscription trazem tudo direto em "subscription"
    const subscriptionId: string | undefined = body?.payment?.subscription ?? body?.subscription?.id;
    const customerId: string | undefined = body?.payment?.customer ?? body?.subscription?.customer;

    async function atualizarProfile(patch: Record<string, unknown>): Promise<boolean> {
      if (subscriptionId) {
        const { data, error } = await supabase
          .from("profiles")
          .update(patch)
          .eq("asaas_subscription_id", subscriptionId)
          .select("id");
        if (!error && data && data.length > 0) return true;
      }
      if (customerId) {
        const { data, error } = await supabase
          .from("profiles")
          .update(patch)
          .eq("asaas_customer_id", customerId)
          .select("id");
        return !error && !!data && data.length > 0;
      }
      return false;
    }

    let profileAtualizado = false;

    switch (evento) {
      case "PAYMENT_CONFIRMED":
      case "PAYMENT_RECEIVED": {
        // Busca o nextDueDate real no Asaas — nunca calculado localmente.
        // Se a busca falhar (timeout, instabilidade), NÃO sobrescreve
        // assinatura_expira_em com null: isso apagaria uma data boa já
        // salva e faria a UI interpretar "pro sem data" como vitalício
        // por engano. Só grava o campo quando realmente veio um valor.
        const proximoVencimento = await buscarProximoVencimento(subscriptionId);
        const patch: Record<string, unknown> = { plano: "pro", assinatura_status: "ativa" };
        if (proximoVencimento) patch.assinatura_expira_em = proximoVencimento;
        profileAtualizado = await atualizarProfile(patch);
        break;
      }
      case "PAYMENT_OVERDUE": {
        profileAtualizado = await atualizarProfile({ assinatura_status: "pendente" });
        break;
      }
      case "SUBSCRIPTION_DELETED":
      case "PAYMENT_DELETED": {
        profileAtualizado = await atualizarProfile({ plano: "expirado", assinatura_status: "cancelada" });
        break;
      }
      default:
        // evento que não tratamos — responde 200 mesmo assim pra não
        // gerar retentativa infinita do lado do Asaas
        break;
    }

    return new Response(JSON.stringify({ ok: true, evento, profileAtualizado }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : String(err) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
