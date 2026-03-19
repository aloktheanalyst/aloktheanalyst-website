// Cloudflare Pages Function — proxies chat requests to Workers AI (open-source Llama models).
// Deployed automatically by Cloudflare Pages at /api/chat
//
// Required bindings:
//   AI          → Workers AI binding
//   SESSION_KV  → KV namespace (aloktheanalyst_sessions)
//
// Optional KV binding for rate limiting:
//   RATE_LIMIT_KV  →  KV namespace (aloktheanalyst_sessions) — can reuse same namespace

const RATE_LIMIT = 30;     // max requests per window per IP
const RATE_WINDOW = 3600;  // window in seconds (1 hour)
const DEFAULT_MODEL = '@cf/meta/llama-3.1-8b-instruct-fp8-fast';

// Global daily cap — keeps total usage within Cloudflare's free 10,000 neurons/day.
// Llama 8B (default) ≈ 30 neurons/exchange, DeepSeek R1 ≈ 250 neurons.
// Most users stay on default; mixed average ~80 neurons/exchange.
// 120 requests × 80 avg ≈ 9,600 neurons (safe headroom).
// Resets daily via KV TTL.
const DAILY_GLOBAL_CAP = 120;
const DAILY_WINDOW = 86400;  // 24 hours in seconds

// Whitelist — prevent users from running arbitrary models on your account
const ALLOWED_MODELS = [
  '@cf/meta/llama-3.1-8b-instruct-fp8-fast',
  '@cf/qwen/qwen2.5-coder-32b-instruct',
  '@cf/deepseek-ai/deepseek-r1-distill-qwen-32b',
  '@cf/meta/llama-4-scout-17b-16e-instruct',
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

  // ── Authenticate — require valid session ────────────────────────────────
  if (env.SESSION_KV) {
    const cookies = parseCookies(request.headers.get('Cookie') || '');
    const sessionId = cookies.session;
    if (!sessionId) {
      return json({ error: 'Please sign in with Google to use the free AI model.', auth_required: true }, 401);
    }
    const sessionData = await env.SESSION_KV.get(`sess:${sessionId}`);
    if (!sessionData) {
      return json({ error: 'Session expired. Please sign in again.', auth_required: true }, 401);
    }
  }

  // ── Rate limiting (KV-based, approximate — optional) ──────────────────────
  const ip = request.headers.get('cf-connecting-ip') || 'unknown';
  if (env.RATE_LIMIT_KV) {
    try {
      // Per-IP rate limit
      const key = `rl:${ip}`;
      const raw = await env.RATE_LIMIT_KV.get(key);
      const count = raw ? parseInt(raw, 10) : 0;
      if (count >= RATE_LIMIT) {
        return json({ error: 'Rate limit exceeded. Please try again later or switch to your own API key.' }, 429);
      }
      await env.RATE_LIMIT_KV.put(key, String(count + 1), { expirationTtl: RATE_WINDOW });

      // Global daily cap — prevents unexpected charges on paid plans
      const globalKey = 'rl:global:daily';
      const globalRaw = await env.RATE_LIMIT_KV.get(globalKey);
      const globalCount = globalRaw ? parseInt(globalRaw, 10) : 0;
      if (globalCount >= DAILY_GLOBAL_CAP) {
        return json({ error: 'Daily free usage limit reached. Please try again tomorrow or switch to your own API key.' }, 429);
      }
      await env.RATE_LIMIT_KV.put(globalKey, String(globalCount + 1), { expirationTtl: DAILY_WINDOW });
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

// ── Helpers ─────────────────────────────────────────────────────────────────

function parseCookies(cookieHeader) {
  const cookies = {};
  cookieHeader.split(';').forEach((c) => {
    const [key, ...val] = c.trim().split('=');
    if (key) cookies[key.trim()] = val.join('=').trim();
  });
  return cookies;
}
