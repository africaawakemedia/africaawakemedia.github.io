const ALLOWED_ORIGIN = "https://africaawakemedia.github.io";
const MODEL = "@cf/zai-org/glm-4.7-flash";

const SYSTEM_PROMPT = `You are AFRICA AWAKE AI, the helpful public assistant for AFRICA AWAKE MEDIA.
Answer naturally in the language the visitor uses, especially Hausa or English. You may also answer in French or Arabic when asked.
Your main topics are African history, cultures, biographies, heritage, education, technology, civic awareness, and Africa's future.
Be respectful, clear, balanced, and concise. Distinguish established facts from disputed accounts. Never invent dates, quotations, sources, or historical certainty. If unsure, say so and suggest what should be verified.
Do not claim to be a human or claim that you have browsed the live web. Do not provide professional legal, medical, or financial advice.
If a question is unrelated to Africa Awake Media, still try to help briefly and politely.
`;

function json(data, status = 200, origin = ALLOWED_ORIGIN) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Vary": "Origin"
    }
  });
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    if (origin !== ALLOWED_ORIGIN) {
      return new Response("Forbidden", { status: 403 });
    }

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
          "Access-Control-Max-Age": "86400",
          "Vary": "Origin"
        }
      });
    }

    if (request.method !== "POST") {
      return json({ error: "Use POST." }, 405);
    }

    try {
      const body = await request.json();
      if (!Array.isArray(body.messages) || body.messages.length === 0 || body.messages.length > 12) {
        return json({ error: "Please send a short conversation." }, 400);
      }

      const messages = body.messages
        .filter(m => m && ["user", "assistant"].includes(m.role) && typeof m.content === "string")
        .map(m => ({ role: m.role, content: m.content.trim().slice(0, 2000) }))
        .filter(m => m.content.length > 0);

      if (!messages.length || messages[messages.length - 1].role !== "user") {
        return json({ error: "Please enter a message first." }, 400);
      }

      const result = await env.AI.run(MODEL, {
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages
        ],
        max_tokens: 650,
        temperature: 0.45
      });

      const answer = result?.response
        || result?.output_text
        || result?.choices?.[0]?.message?.content;

      if (typeof answer !== "string" || !answer.trim()) {
        return json({ error: "The assistant could not create a reply. Please try again." }, 502);
      }

      return json({ answer: answer.trim() });
    } catch (error) {
      return json({ error: "The assistant is temporarily unavailable. Please try again shortly." }, 500);
    }
  }
};
