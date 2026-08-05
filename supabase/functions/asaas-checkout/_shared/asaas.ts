// ⚠️ ARQUIVO DUPLICADO — SINCRONIZE MANUALMENTE COM AS OUTRAS 3 CÓPIAS SE
// MUDAR ISSO AQUI: asaas-cancel/_shared/asaas.ts, asaas-webhook/_shared/
// asaas.ts, asaas-faturas/_shared/asaas.ts (esta é a cópia de asaas-checkout).
// As 4 devem ficar byte-a-byte idênticas.
//
// Por quê duplicado: o deploy via MCP empacota cada function isoladamente
// e não resolve imports que escapam da própria pasta da function, então um
// `supabase/functions/_shared/` compartilhado por import "../_shared" não
// funciona nesse fluxo de deploy.
//
// Módulo compartilhado entre as Edge Functions do Asaas (asaas-checkout,
// asaas-webhook, asaas-cancel, asaas-faturas) — fetch autenticado com
// timeout, parse de erro do Asaas em AsaasError, e a busca do nextDueDate
// real de uma subscription (fonte da verdade pro ciclo de cobrança).

export const ASAAS_API_URL = Deno.env.get("ASAAS_API_URL") ?? "https://api.asaas.com/v3";

const TIMEOUT_MS = 15_000;

/** Erro vindo da API do Asaas (dado inválido, cartão recusado, timeout,
 * instabilidade, etc) — sempre com mensagem específica o bastante pra
 * mostrar direto pro usuário, em vez de um "erro genérico". */
export class AsaasError extends Error {}

export async function asaasFetch(path: string, init: RequestInit = {}) {
  const apiKey = Deno.env.get("ASAAS_API_KEY");
  if (!apiKey) {
    throw new Error("ASAAS_API_KEY não configurada no projeto. Configure o secret e publique a function de novo.");
  }

  let resp: Response;
  try {
    resp = await fetch(`${ASAAS_API_URL}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        access_token: apiKey,
        ...init.headers,
      },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch (err) {
    // AbortSignal.timeout estoura como DOMException "TimeoutError"; erro de
    // rede puro (DNS, conexão recusada) chega como TypeError.
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
    throw new AsaasError(mensagem || `Não foi possível concluir a operação no Asaas (HTTP ${resp.status}).`);
  }
  return data;
}

/** Busca o nextDueDate real da subscription no Asaas — fonte da verdade do
 * ciclo de cobrança, nunca calculado localmente (evita bug de mês
 * curto/ano bissexto). Retorna null em qualquer falha (timeout, rede,
 * subscription inexistente) em vez de propagar — quem chama decide se
 * isso é crítico ou não; nunca deve sobrescrever uma data boa existente
 * com null só porque essa busca falhou.*/
export async function buscarProximoVencimento(subscriptionId: string | undefined): Promise<string | null> {
  if (!subscriptionId) return null;
  try {
    const data = await asaasFetch(`/subscriptions/${subscriptionId}`);
    return data?.nextDueDate ?? null;
  } catch {
    return null;
  }
}
