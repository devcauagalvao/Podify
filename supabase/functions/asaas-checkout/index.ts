// Edge Function: asaas-checkout
// Cria (ou reaproveita) o customer no Asaas e a assinatura recorrente do
// plano PODIFY Pro (R$ 29,90/mês), via Pix ou cartão de crédito.
//
// Requer o secret ASAAS_API_KEY configurado no projeto:
//   supabase secrets set ASAAS_API_KEY=<chave>
//
// Deploy: supabase functions deploy asaas-checkout
// (verify_jwt fica true — só usuário autenticado do Podify pode chamar,
// o gateway do Supabase já rejeita antes de chegar aqui se não vier JWT)

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const ASAAS_API_URL = Deno.env.get("ASAAS_API_URL") ?? "https://api.asaas.com/v3";
const VALOR_ASSINATURA = 29.9;

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

/** Erro vindo da API do Asaas (dado inválido, cartão recusado, etc) —
 * sempre com mensagem específica o bastante pra mostrar direto pro usuário,
 * em vez de um "erro genérico". */
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

interface DadosCartao {
  numero: string;
  nomeImpresso: string;
  validadeMes: string;
  validadeAno: string;
  cvv: string;
  titularCep: string;
  titularNumeroEndereco: string;
  titularComplemento?: string;
}

interface CheckoutBody {
  forma_pagamento: "PIX" | "CREDIT_CARD";
  cpf_cnpj: string;
  nome: string;
  email: string;
  telefone?: string;
  dados_cartao?: DadosCartao;
}

function apenasNumeros(v: string | undefined | null) {
  return (v ?? "").replace(/\D/g, "");
}

function amanhaISO() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
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

    const body = (await req.json()) as CheckoutBody;
    const { forma_pagamento, cpf_cnpj, nome, email, telefone, dados_cartao } = body;

    if (!forma_pagamento || !["PIX", "CREDIT_CARD"].includes(forma_pagamento)) {
      return jsonResponse({ error: "Forma de pagamento inválida." }, 400);
    }
    if (!cpf_cnpj?.trim() || !nome?.trim() || !email?.trim()) {
      return jsonResponse({ error: "Preencha nome, e-mail e CPF/CNPJ." }, 400);
    }
    if (forma_pagamento === "CREDIT_CARD") {
      if (!dados_cartao) return jsonResponse({ error: "Dados do cartão não enviados." }, 400);
      const faltando = (
        [
          ["numero", dados_cartao.numero],
          ["nomeImpresso", dados_cartao.nomeImpresso],
          ["validadeMes", dados_cartao.validadeMes],
          ["validadeAno", dados_cartao.validadeAno],
          ["cvv", dados_cartao.cvv],
          ["titularCep", dados_cartao.titularCep],
          ["titularNumeroEndereco", dados_cartao.titularNumeroEndereco],
        ] as const
      ).some(([, v]) => !v?.toString().trim());
      if (faltando) return jsonResponse({ error: "Preencha todos os dados do cartão." }, 400);
    }

    const { data: profile, error: profileError } = await supabaseUser
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      return jsonResponse({ error: "Não foi possível carregar seu perfil." }, 500);
    }

    if (profile.cpf_cnpj !== cpf_cnpj) {
      await supabaseUser.from("profiles").update({ cpf_cnpj }).eq("id", user.id);
    }

    let customerId = profile.asaas_customer_id as string | null;

    if (!customerId) {
      const customer = await asaasFetch("/customers", {
        method: "POST",
        body: JSON.stringify({
          name: nome,
          email,
          cpfCnpj: apenasNumeros(cpf_cnpj),
          mobilePhone: apenasNumeros(telefone) || undefined,
        }),
      });
      customerId = customer.id as string;
      await supabaseUser.from("profiles").update({ asaas_customer_id: customerId }).eq("id", user.id);
    }

    const subscriptionPayload: Record<string, unknown> = {
      customer: customerId,
      billingType: forma_pagamento,
      value: VALOR_ASSINATURA,
      cycle: "MONTHLY",
      description: "Assinatura PODIFY Pro",
      nextDueDate: amanhaISO(),
    };

    if (forma_pagamento === "CREDIT_CARD" && dados_cartao) {
      // exigido pelo Asaas como parte da checagem antifraude ao enviar o
      // cartão direto (creditCard + creditCardHolderInfo)
      const ip =
        req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        req.headers.get("cf-connecting-ip") ||
        "0.0.0.0";

      subscriptionPayload.remoteIp = ip;
      subscriptionPayload.creditCard = {
        holderName: dados_cartao.nomeImpresso,
        number: apenasNumeros(dados_cartao.numero),
        expiryMonth: dados_cartao.validadeMes,
        expiryYear: dados_cartao.validadeAno,
        ccv: dados_cartao.cvv,
      };
      subscriptionPayload.creditCardHolderInfo = {
        name: nome,
        email,
        cpfCnpj: apenasNumeros(cpf_cnpj),
        postalCode: apenasNumeros(dados_cartao.titularCep),
        addressNumber: dados_cartao.titularNumeroEndereco,
        addressComplement: dados_cartao.titularComplemento || undefined,
        phone: apenasNumeros(telefone) || undefined,
      };
    }

    const subscription = await asaasFetch("/subscriptions", {
      method: "POST",
      body: JSON.stringify(subscriptionPayload),
    });

    await supabaseUser.from("profiles").update({ asaas_subscription_id: subscription.id }).eq("id", user.id);

    // primeira cobrança gerada pra essa assinatura (é dela que sai o QR
    // code do Pix, ou o status do lançamento no cartão)
    const cobrancas = await asaasFetch(`/payments?subscription=${subscription.id}&limit=1`);
    const primeiraCobranca = cobrancas?.data?.[0];

    if (forma_pagamento === "PIX") {
      if (!primeiraCobranca) {
        return jsonResponse(
          { error: "A assinatura foi criada, mas não encontramos a cobrança Pix. Tente novamente em instantes." },
          502,
        );
      }
      const qrCode = await asaasFetch(`/payments/${primeiraCobranca.id}/pixQrCode`);
      return jsonResponse({
        ok: true,
        formaPagamento: "PIX",
        subscriptionId: subscription.id,
        paymentId: primeiraCobranca.id,
        qrCode: {
          encodedImage: qrCode.encodedImage,
          payload: qrCode.payload,
          expirationDate: qrCode.expirationDate,
        },
      });
    }

    // CREDIT_CARD
    const status = primeiraCobranca?.status ?? subscription.status ?? "PENDING";
    if (status === "REFUSED" || status === "FAILED") {
      return jsonResponse(
        { error: "O pagamento foi recusado pela operadora do cartão. Confira os dados e tente novamente." },
        400,
      );
    }

    return jsonResponse({
      ok: true,
      formaPagamento: "CREDIT_CARD",
      subscriptionId: subscription.id,
      status,
    });
  } catch (err) {
    const status = err instanceof AsaasError ? 400 : 500;
    return jsonResponse({ error: err instanceof Error ? err.message : String(err) }, status);
  }
});
