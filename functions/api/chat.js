// Cloudflare Pages Function — proxies chat requests to Workers AI (open-source Llama models).
// Deployed automatically by Cloudflare Pages at /api/chat
//
// Required binding (Cloudflare Pages → Settings → Functions → AI binding):
//   Variable name: AI
//
// Optional KV binding for rate limiting:
//   Variable name: RATE_LIMIT_KV  →  namespace: aloktheanalyst_rate_limit

const RATE_LIMIT = 30;     // max requests per window per IP
const RATE_WINDOW = 3600;  // window in seconds (1 hour)
const DEFAULT_MODEL = '@cf/meta/llama-3.1-8b-instruct-fp8-fast';

// Whitelist — prevent users from running arbitrary models on your account
const ALLOWED_MODELS = [
  '@cf/meta/llama-3.1-8b-instruct-fp8-fast',
  '@cf/meta/llama-3.3-70b-instruct-fp8-fast',
];

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS },
  });
}

export async function onRequest(context) {
  const { env, request } = context;

  // ── CORS preflight ────────────────────────────────────────────────────────
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: { ...CORS, 'Access-Control-Max-Age': '86400' } });
  }

  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  // ── Check AI binding ──────────────────────────────────────────────────────
  if (!env.AI) {
    return json({ error: 'AI service not configured. Please add the AI binding in Cloudflare dashboard.' }, 503);
  }

  // ── Rate limiting (KV-based, approximate — optional) ──────────────────────
  const ip = request.headers.get('cf-connecting-ip') || 'unknown';
  if (env.RATE_LIMIT_KV) {
    try {
      const key = `rl:${ip}`;
      const raw = await env.RATE_LIMIT_KV.get(key);
      const count = raw ? parseInt(raw, 10) : 0;
      if (count >= RATE_LIMIT) {
        return json({ error: 'Rate limit exceeded. Please try again later or switch to your own API key.' }, 429);
      }
      await env.RATE_LIMIT_KV.put(key, String(count + 1), { expirationTtl: RATE_WINDOW });
    } catch {
      // Rate limiting failure shouldn't block the request
    }
  }

  // ── Parse request body ────────────────────────────────────────────────────
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid JSON body' }, 400);
  }

  const { messages, system, model } = body;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return json({ error: 'messages array is required' }, 400);
  }

  // Validate model against whitelist
  const selectedModel = ALLOWED_MODELS.includes(model) ? model : DEFAULT_MODEL;

  // ── Build messages array with system prompt ───────────────────────────────
  const aiMessages = [];
  if (system) {
    aiMessages.push({ role: 'system', content: system });
  }
  aiMessages.push(...messages.map(m => ({ role: m.role, content: m.content })));

  // ── Call Workers AI ───────────────────────────────────────────────────────
  try {
    const result = await env.AI.run(selectedModel, {
      messages: aiMessages,
      max_tokens: 1024,
    });

    return json({ reply: result.response || '' });
  } catch (err) {
    return json({ error: err.message || 'AI inference failed' }, 502);
  }
}
