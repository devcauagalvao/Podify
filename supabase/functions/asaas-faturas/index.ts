// Edge Function: asaas-faturas
// Devolve as últimas cobranças da assinatura do usuário logado, buscando
// ao vivo na API do Asaas (não existe espelho local — sem tabela própria
// de faturas no Postgres).
//
// Requer o secret ASAAS_API_KEY configurado no projeto (mesmo do
// asaas-checkout).
//
// Deploy: supabase functions deploy asaas-faturas
// (verify_jwt fica true — só usuário autenticado do Podify pode chamar)

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { asaasFetch, AsaasError } from "./_shared/asaas.ts";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
}

interface FaturaAsaas {
  id: string;
  status: string;
  value: number;
  dueDate: string;
  paymentDate?: string | null;
  clientPaymentDate?: string | null;
  billingType: string;
  invoiceUrl?: string | null;
  bankSlipUrl?: string | null;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return jsonResponse({ error: "Não autenticado." }, 401);

    // Client "no nome do usuário" (JWT dele repassado) — RLS garante que
    // essa function só consegue ler o profile do próprio usuário que
    // chamou, sem precisar de service role aqui.
    const supabaseUser = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );

    const { data: userData, error: userError } = await supabaseUser.auth.getUser();
    if (userError || !userData?.user) {
      return jsonResponse({ error: "Sessão inválida. Faça login novamente." }, 401);
    }
    const user = userData.user;

    const { data: profile, error: profileError } = await supabaseUser
      .from("profiles")
      .select("asaas_subscription_id")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      return jsonResponse({ error: "Não foi possível carregar seu perfil." }, 500);
    }

    const subscriptionId = profile.asaas_subscription_id as string | null;
    if (!subscriptionId) {
      // usuário em trial, nunca assinou — não é erro, é lista vazia
      return jsonResponse({ ok: true, faturas: [] });
    }

    const resposta = await asaasFetch(`/subscriptions/${subscriptionId}/payments?limit=20`);
    const faturas = ((resposta?.data ?? []) as FaturaAsaas[]).map((p) => ({
      id: p.id,
      status: p.status,
      valor: p.value,
      vencimento: p.dueDate,
      pagoEm: p.paymentDate ?? p.clientPaymentDate ?? null,
      formaPagamento: p.billingType,
      linkFatura: p.invoiceUrl ?? p.bankSlipUrl ?? null,
    }));

    return jsonResponse({ ok: true, faturas });
  } catch (err) {
    const status = err instanceof AsaasError ? 400 : 500;
    return jsonResponse({ error: err instanceof Error ? err.message : String(err) }, status);
  }
});
