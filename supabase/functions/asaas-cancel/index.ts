// Edge Function: asaas-cancel
// Cancela a assinatura recorrente do usuário no Asaas e atualiza o profile
// na hora (plano "expirado", assinatura_status "cancelada") — sem esperar
// o webhook confirmar, pra UI já refletir o cancelamento na volta da chamada.
//
// Requer o secret ASAAS_API_KEY configurado no projeto (mesmo do asaas-checkout).
//
// Deploy: supabase functions deploy asaas-cancel
// (verify_jwt fica true — só usuário autenticado do Podify pode chamar)

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const ASAAS_API_URL = Deno.env.get("ASAAS_API_URL") ?? "https://api.asaas.com/v3";

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

class AsaasError extends Error {}

async function asaasFetch(path: string, init: RequestInit = {}) {
  const apiKey = Deno.env.get("ASAAS_API_KEY");
  if (!apiKey) {
    throw new Error("ASAAS_API_KEY não configurada no projeto. Configure o secret e publique a function de novo.");
  }
  const resp = await fetch(`${ASAAS_API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      access_token: apiKey,
      ...init.headers,
    },
  });
  const data = await resp.json().catch(() => null);
  if (!resp.ok) {
    const mensagem: string | undefined = data?.errors
      ?.map((e: { description?: string }) => e.description)
      .filter(Boolean)
      .join(" ");
    throw new AsaasError(mensagem || `Não foi possível concluir a operação no Asaas (HTTP ${resp.status}).`);
  }
  return data;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return jsonResponse({ error: "Não autenticado." }, 401);

    // Client "no nome do usuário" (JWT dele repassado) — RLS garante que
    // essa function só consegue ler/gravar o profile do próprio usuário
    // que chamou, sem precisar de service role aqui.
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
      return jsonResponse({ error: "Nenhuma assinatura ativa encontrada para cancelar." }, 400);
    }

    await asaasFetch(`/subscriptions/${subscriptionId}`, { method: "DELETE" });

    const { error: updateError } = await supabaseUser
      .from("profiles")
      .update({ plano: "expirado", assinatura_status: "cancelada" })
      .eq("id", user.id);

    if (updateError) {
      return jsonResponse(
        { error: "Assinatura cancelada no Asaas, mas houve um erro ao atualizar seu perfil. Atualize a página." },
        500,
      );
    }

    return jsonResponse({ ok: true });
  } catch (err) {
    const status = err instanceof AsaasError ? 400 : 500;
    return jsonResponse({ error: err instanceof Error ? err.message : String(err) }, status);
  }
});
