// Edge Function: lia-chat
// Recebe a pergunta do usuário (+ imagem opcional) e responde usando a Claude API,
// com um prompt de sistema especializado em podologia.
//
// Deploy: supabase functions deploy lia-chat
// Secret necessário: supabase secrets set ANTHROPIC_API_KEY=sk-ant-...

import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const SYSTEM_PROMPT = `Você é a LIA, assistente de IA especialista em podologia clínica dentro do
aplicativo Podify, usada por podólogos profissionais (não pelo paciente final).
Responda de forma técnica, objetiva e baseada em evidência clínica, em português do Brasil.
Se receber uma foto de pé, descreva achados visuais relevantes (lesões, calos, unhas,
coloração, sinais de alerta como pé diabético) e sugira possíveis condutas, sempre deixando
claro que a decisão final é do profissional responsável.
Nunca dê diagnóstico definitivo — ofereça hipóteses e recomende avaliação presencial quando
houver sinal de risco (ex: úlcera, isquemia, infecção).`;

Deno.serve(async (req: Request) => {
  try {
    const { mensagem, imagem_url, historico } = await req.json();

    const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "ANTHROPIC_API_KEY não configurada" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const content: Record<string, unknown>[] = [{ type: "text", text: mensagem }];

    if (imagem_url) {
      const imgResp = await fetch(imagem_url);
      const buffer = await imgResp.arrayBuffer();
      const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));
      const mediaType = imgResp.headers.get("content-type") ?? "image/jpeg";
      content.unshift({
        type: "image",
        source: { type: "base64", media_type: mediaType, data: base64 },
      });
    }

    const messages = [
      ...((historico ?? []) as { role: string; conteudo: string }[]).map((m) => ({
        role: m.role,
        content: m.conteudo,
      })),
      { role: "user", content },
    ];

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages,
      }),
    });

    const data = await response.json();
    const resposta = data?.content?.find((c: { type: string }) => c.type === "text")?.text
      ?? "Não consegui gerar uma resposta.";

    return new Response(JSON.stringify({ resposta }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
