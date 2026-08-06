// Edge Function: admin-financeiro
// Painel financeiro do /admin: MRR (assinaturas ativas no Asaas que batem
// com um profile pro do Podify), receita já recebida no mês corrente, e
// contagem de assinantes pagantes (asaas_subscription_id preenchido) vs
// cortesia (acesso pro liberado manualmente, sem cobrança real).
//
// Nunca confia em "veio da tela /admin" — sempre revalida no backend que
// quem chamou é admin de verdade (JWT + is_admin=true no banco) antes de
// tocar em qualquer coisa.
//
// Resultado fica em cache por 5 minutos (tabela admin_financeiro_cache)
// pra não martelar a API do Asaas a cada refresh da tela.
//
// Requer o secret ASAAS_API_KEY configurado no projeto (mesmo do
// asaas-checkout).
//
// Deploy: supabase functions deploy admin-financeiro
// (verify_jwt fica true — só usuário autenticado do Podify pode chamar)

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
// Pinado (não "@2" flutuante): a resolução automática do range "@2" pra
// versão mais recente vem falhando no bundler do deploy (npm package
// @supabase/postgrest-js não encontrado pra a versão resolvida). Trava numa
// versão que builda certo até isso ser corrigido no JSR.
import { createClient } from "jsr:@supabase/supabase-js@2.45.4";

const ASAAS_API_URL = Deno.env.get("ASAAS_API_URL") ?? "https://api.asaas.com/v3";
const TIMEOUT_MS = 15_000;
const CACHE_TTL_MS = 5 * 60 * 1000;
const ASAAS_PAGE_LIMIT = 100;
const ASAAS_MAX_PAGES = 30; // trava de segurança (até 3000 registros por busca)

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

class AsaasError extends Error {}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
}

async function asaasFetch(path: string) {
  const apiKey = Deno.env.get("ASAAS_API_KEY");
  if (!apiKey) {
    throw new Error("ASAAS_API_KEY não configurada no projeto. Configure o secret e publique a function de novo.");
  }

  let resp: Response;
  try {
    resp = await fetch(`${ASAAS_API_URL}${path}`, {
      headers: { "Content-Type": "application/json", access_token: apiKey },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch (err) {
    const foiTimeout = err instanceof DOMException && err.name === "TimeoutError";
    throw new AsaasError(
      foiTimeout
        ? "O Asaas demorou demais para responder. Tente novamente em instantes."
        : "Não foi possível conectar ao Asaas agora. Tente novamente em instantes.",
    );
  }

  const data = await resp.json().catch(() => null);
  if (!resp.ok) {
    const mensagem: string | undefined = data?.errors
      ?.map((e: { description?: string }) => e.description)
      .filter(Boolean)
      .join(" ");
    throw new AsaasError(mensagem || `Não foi possível buscar dados no Asaas (HTTP ${resp.status}).`);
  }
  return data;
}

/** Pagina uma listagem do Asaas (limit/offset + hasMore) até acabar ou até
 * a trava de segurança, devolvendo todos os itens concatenados. */
async function asaasFetchAll(pathSemPaginacao: string): Promise<Record<string, unknown>[]> {
  const itens: Record<string, unknown>[] = [];
  let offset = 0;
  for (let pagina = 0; pagina < ASAAS_MAX_PAGES; pagina++) {
    const separador = pathSemPaginacao.includes("?") ? "&" : "?";
    const data = await asaasFetch(`${pathSemPaginacao}${separador}limit=${ASAAS_PAGE_LIMIT}&offset=${offset}`);
    const pageItens = (data?.data ?? []) as Record<string, unknown>[];
    itens.push(...pageItens);
    if (!data?.hasMore || pageItens.length === 0) break;
    offset += ASAAS_PAGE_LIMIT;
  }
  return itens;
}

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

/** Últimos dia do mês em UTC, no formato YYYY-MM-DD. */
function ultimoDiaDoMesUTC(ano: number, mesIndex0: number) {
  const ultimoDia = new Date(Date.UTC(ano, mesIndex0 + 1, 0)).getUTCDate();
  return `${ano}-${pad2(mesIndex0 + 1)}-${pad2(ultimoDia)}`;
}

function primeiroDiaDoMesUTC(ano: number, mesIndex0: number) {
  return `${ano}-${pad2(mesIndex0 + 1)}-01`;
}

interface HistoricoMes {
  mes: string; // YYYY-MM
  valor: number;
}

async function calcularFinanceiro(subscriptionIdsPodify: Set<string>) {
  // MRR: assinaturas ACTIVE no Asaas que realmente pertencem a um profile
  // pro do Podify (evita contar assinatura de teste/lixo criada direto no
  // painel do Asaas, fora do fluxo do app).
  const subscriptionsAtivas = await asaasFetchAll("/subscriptions?status=ACTIVE");
  const mrr = subscriptionsAtivas
    .filter((s) => subscriptionIdsPodify.has(String(s.id)))
    .reduce((soma, s) => soma + (Number(s.value) || 0), 0);

  // Receita RECEIVED dos últimos 6 meses (mês corrente incluso), buscada de
  // uma vez só e depois separada por mês — evita 6 idas e vindas na API.
  const hoje = new Date();
  const anoAtual = hoje.getUTCFullYear();
  const mesAtual = hoje.getUTCMonth(); // 0-11

  const mesesJanela: { ano: number; mesIndex0: number; chave: string }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(Date.UTC(anoAtual, mesAtual - i, 1));
    mesesJanela.push({
      ano: d.getUTCFullYear(),
      mesIndex0: d.getUTCMonth(),
      chave: `${d.getUTCFullYear()}-${pad2(d.getUTCMonth() + 1)}`,
    });
  }

  const inicioJanela = primeiroDiaDoMesUTC(mesesJanela[0].ano, mesesJanela[0].mesIndex0);
  const fimJanela = ultimoDiaDoMesUTC(anoAtual, mesAtual);

  const pagamentosRecebidos = await asaasFetchAll(
    `/payments?status=RECEIVED&paymentDate[ge]=${inicioJanela}&paymentDate[le]=${fimJanela}`,
  );

  const somaPorMes = new Map<string, number>(mesesJanela.map((m) => [m.chave, 0]));
  for (const pagamento of pagamentosRecebidos) {
    const dataPagamento = String(pagamento.paymentDate ?? "").slice(0, 7); // YYYY-MM
    if (!somaPorMes.has(dataPagamento)) continue;
    somaPorMes.set(dataPagamento, (somaPorMes.get(dataPagamento) ?? 0) + (Number(pagamento.value) || 0));
  }

  const historicoMensal: HistoricoMes[] = mesesJanela.map((m) => ({
    mes: m.chave,
    valor: Math.round((somaPorMes.get(m.chave) ?? 0) * 100) / 100,
  }));

  const mesCorrenteChave = `${anoAtual}-${pad2(mesAtual + 1)}`;
  const recebidoMes = somaPorMes.get(mesCorrenteChave) ?? 0;

  return {
    mrr: Math.round(mrr * 100) / 100,
    recebidoMes: Math.round(recebidoMes * 100) / 100,
    historicoMensal,
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return jsonResponse({ error: "Não autenticado." }, 401);

    const supabaseUser = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );

    const { data: userData, error: userError } = await supabaseUser.auth.getUser();
    if (userError || !userData?.user) {
      return jsonResponse({ error: "Sessão inválida. Faça login novamente." }, 401);
    }

    // Nunca confia que "a tela é /admin" já garante privilégio — confirma
    // is_admin=true direto no banco antes de fazer qualquer outra coisa.
    const { data: profile, error: profileError } = await supabaseUser
      .from("profiles")
      .select("is_admin")
      .eq("id", userData.user.id)
      .single();

    if (profileError || !profile) {
      return jsonResponse({ error: "Não foi possível carregar seu perfil." }, 500);
    }
    if (!profile.is_admin) {
      return jsonResponse({ error: "Acesso restrito a administradores." }, 403);
    }

    const { data: cache } = await supabaseUser
      .from("admin_financeiro_cache")
      .select("*")
      .eq("id", "default")
      .maybeSingle();

    const cacheValido = cache && Date.now() - new Date(cache.updated_at).getTime() < CACHE_TTL_MS;

    if (cacheValido) {
      return jsonResponse({
        ok: true,
        cache: true,
        mrr: Number(cache.mrr),
        recebidoMes: Number(cache.recebido_mes),
        assinantesPagantes: cache.assinantes_pagantes,
        assinantesCortesia: cache.assinantes_cortesia,
        historicoMensal: cache.historico_mensal,
        atualizadoEm: cache.updated_at,
      });
    }

    // Contas plano=pro: as com asaas_subscription_id pagam de verdade; as
    // sem são cortesia (acesso liberado manualmente, não geram receita).
    const { data: profilesPro, error: profilesError } = await supabaseUser
      .from("profiles")
      .select("asaas_subscription_id")
      .eq("plano", "pro");

    if (profilesError) {
      return jsonResponse({ error: "Não foi possível carregar as contas pro." }, 500);
    }

    const subscriptionIdsPodify = new Set(
      (profilesPro ?? []).map((p) => p.asaas_subscription_id).filter((id): id is string => !!id),
    );
    const assinantesPagantes = subscriptionIdsPodify.size;
    const assinantesCortesia = (profilesPro ?? []).length - assinantesPagantes;

    const { mrr, recebidoMes, historicoMensal } = await calcularFinanceiro(subscriptionIdsPodify);

    const agora = new Date().toISOString();
    await supabaseUser.from("admin_financeiro_cache").upsert({
      id: "default",
      mrr,
      recebido_mes: recebidoMes,
      assinantes_pagantes: assinantesPagantes,
      assinantes_cortesia: assinantesCortesia,
      historico_mensal: historicoMensal,
      updated_at: agora,
    });

    return jsonResponse({
      ok: true,
      cache: false,
      mrr,
      recebidoMes,
      assinantesPagantes,
      assinantesCortesia,
      historicoMensal,
      atualizadoEm: agora,
    });
  } catch (err) {
    const status = err instanceof AsaasError ? 400 : 500;
    return jsonResponse({ error: err instanceof Error ? err.message : String(err) }, status);
  }
});
