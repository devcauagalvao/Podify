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

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const ASAAS_API_URL = Deno.env.get("ASAAS_API_URL") ?? "https://api.asaas.com/v3";

// Se você configurar o secret ASAAS_WEBHOOK_TOKEN (supabase secrets set
// ASAAS_WEBHOOK_TOKEN=<seu token>), ele tem prioridade sobre esse valor
// abaixo — o padrão aqui só existe pra function funcionar de imediato
// (inclusive pra testes) antes de você configurar o secret de verdade.
// Se for usar o padrão em produção, troque o token no painel do Asaas
// pra bater com esse mesmo valor.
const ASAAS_WEBHOOK_TOKEN_PADRAO = "51e2f614e6f00d45b83bd128ca6c149333e3a0e237ceb1ea1dfe866833540ade";

async function buscarProximoVencimento(subscriptionId: string | undefined): Promise<string | null> {
  const apiKey = Deno.env.get("ASAAS_API_KEY");
  if (!apiKey || !subscriptionId) return null;
  const resp = await fetch(`${ASAAS_API_URL}/subscriptions/${subscriptionId}`, {
    headers: { access_token: apiKey },
  });
  if (!resp.ok) return null;
  const data = await resp.json();
  return data?.nextDueDate ?? null;
}

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
        const proximoVencimento = await buscarProximoVencimento(subscriptionId);
        profileAtualizado = await atualizarProfile({
          plano: "pro",
          assinatura_status: "ativa",
          assinatura_expira_em: proximoVencimento,
        });
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
