// Edge Function: purge-lixeira
// Expurgo definitivo dos clientes que estão na lixeira há mais de 7 dias
// (deleted_at preenchido), e de tudo que pertence a eles: fotos e
// assinaturas no Storage (buckets anamnese-fotos e assinaturas) + as
// linhas de anamnese_fotos/anamneses/clientes no banco.
//
// Precisa rodar nessa ordem: primeiro descobre e apaga os arquivos do
// Storage (usando as URLs salvas no banco), só depois apaga as linhas do
// banco — se apagasse o banco primeiro, perderia as URLs dos arquivos e
// eles ficariam órfãos ocupando espaço no Storage pra sempre.
//
// Agendada via pg_cron + pg_net (ver migration lixeira_purge_function_and_cron)
// pra rodar 1x por dia às 3h. Autenticação por um header próprio
// (x-purge-secret) em vez da service role key do Supabase, pra não
// precisar guardar essa chave em texto plano dentro do SQL do cron job.
//
// Deploy: supabase functions deploy purge-lixeira --no-verify-jwt
// Teste manual (fora do cron, ex: pra testar sem esperar 7 dias de
// verdade): POST com body { "diasRetencao": 0 } e o header x-purge-secret.

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

// Mesmo valor configurado no header do cron job (migration
// lixeira_purge_function_and_cron). Não é a service role key do Supabase —
// é só um segredo interno pra garantir que só o cron chame essa function.
const PURGE_SECRET = "38eef7f5161b033130acca09aa17f4a67406810b80e0895cd08e5334873b9fd0";

const DIAS_RETENCAO_PADRAO = 7;

function extrairCaminhoDoStorage(url: string | null | undefined, bucket: string): string | null {
  if (!url) return null;
  const semQuery = url.split("?")[0];
  const marcador = `/object/public/${bucket}/`;
  const idx = semQuery.indexOf(marcador);
  if (idx === -1) return null;
  try {
    return decodeURIComponent(semQuery.slice(idx + marcador.length));
  } catch {
    return semQuery.slice(idx + marcador.length);
  }
}

Deno.serve(async (req: Request) => {
  if (req.headers.get("x-purge-secret") !== PURGE_SECRET) {
    return new Response(JSON.stringify({ error: "unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  let diasRetencao = DIAS_RETENCAO_PADRAO;
  try {
    const body = await req.json();
    if (typeof body?.diasRetencao === "number" && body.diasRetencao >= 0) {
      diasRetencao = body.diasRetencao;
    }
  } catch {
    // sem corpo (chamada normal do cron) -> usa o padrão de 7 dias
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  const limite = new Date(Date.now() - diasRetencao * 24 * 60 * 60 * 1000).toISOString();

  try {
    const { data: clientesExpirados, error: clientesError } = await supabase
      .from("clientes")
      .select("id")
      .not("deleted_at", "is", null)
      .lt("deleted_at", limite);

    if (clientesError) throw clientesError;

    const idsClientes = (clientesExpirados ?? []).map((c: { id: string }) => c.id);

    let fotosRemovidas = 0;
    let assinaturasRemovidas = 0;

    if (idsClientes.length > 0) {
      const { data: anamneses, error: anamnesesError } = await supabase
        .from("anamneses")
        .select("id, assinatura_paciente_url, assinatura_profissional_url")
        .in("cliente_id", idsClientes);

      if (anamnesesError) throw anamnesesError;

      const idsAnamneses = (anamneses ?? []).map((a: { id: string }) => a.id);

      if (idsAnamneses.length > 0) {
        const { data: fotos, error: fotosError } = await supabase
          .from("anamnese_fotos")
          .select("url")
          .in("anamnese_id", idsAnamneses);

        if (fotosError) throw fotosError;

        const caminhosFotos = (fotos ?? [])
          .map((f: { url: string }) => extrairCaminhoDoStorage(f.url, "anamnese-fotos"))
          .filter((c: string | null): c is string => Boolean(c));

        if (caminhosFotos.length > 0) {
          const { error: removeFotosError } = await supabase.storage
            .from("anamnese-fotos")
            .remove(caminhosFotos);
          if (removeFotosError) throw removeFotosError;
          fotosRemovidas = caminhosFotos.length;
        }
      }

      const caminhosAssinaturas = (anamneses ?? [])
        .flatMap((a: { assinatura_paciente_url: string | null; assinatura_profissional_url: string | null }) => [
          a.assinatura_paciente_url,
          a.assinatura_profissional_url,
        ])
        .map((u: string | null) => extrairCaminhoDoStorage(u, "assinaturas"))
        .filter((c: string | null): c is string => Boolean(c));

      if (caminhosAssinaturas.length > 0) {
        const { error: removeAssinaturasError } = await supabase.storage
          .from("assinaturas")
          .remove(caminhosAssinaturas);
        if (removeAssinaturasError) throw removeAssinaturasError;
        assinaturasRemovidas = caminhosAssinaturas.length;
      }
    }

    const { error: purgeError } = await supabase.rpc("purge_deleted_clientes", {
      p_dias_retencao: diasRetencao,
    });
    if (purgeError) throw purgeError;

    return new Response(
      JSON.stringify({
        clientesPurgados: idsClientes.length,
        fotosRemovidas,
        assinaturasRemovidas,
      }),
      { headers: { "Content-Type": "application/json" } },
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
