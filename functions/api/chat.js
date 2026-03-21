// Cloudflare Pages Function — proxies chat requests to Workers AI (open-source Llama models).
// Deployed automatically by Cloudflare Pages at /api/chat
//
// Required bindings:
//   AI          → Workers AI binding
//   SESSION_KV  → KV namespace (aloktheanalyst_sessions)
//
// Optional KV binding for rate limiting:
//   RATE_LIMIT_KV  →  KV namespace (aloktheanalyst_sessions) — can reuse same namespace

const USER_HOURLY_LIMIT = 30;   // max requests per hour per user
const USER_DAILY_LIMIT = 60;    // max requests per day per user
const IP_HOURLY_LIMIT = 30;     // fallback: max requests per hour per IP
const RATE_WINDOW = 3600;       // 1 hour in seconds
const DAILY_WINDOW = 86400;     // 24 hours in seconds
const DEFAULT_MODEL = '@cf/meta/llama-3.1-8b-instruct-fp8-fast';

// Global daily cap — keeps total usage within Cloudflare's free 10,000 neurons/day.
// Llama 8B (default) ≈ 30 neurons/exchange, DeepSeek R1 ≈ 250 neurons.
// Most users stay on default; mixed average ~80 neurons/exchange.
// 120 requests × 80 avg ≈ 9,600 neurons (safe headroom).
const DAILY_GLOBAL_CAP = 120;

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

function parseCookies(cookieHeader) {
  const cookies = {};
  cookieHeader.split(';').forEach((c) => {
    const [key, ...val] = c.trim().split('=');
    if (key) cookies[key.trim()] = val.join('=').trim();
  });
  return cookies;
}

function getUserId(sessionData) {
  try {
    const session = JSON.parse(sessionData);
    return session.google_id || session.email || null;
  } catch { return null; }
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
  let userId = null;
  if (env.SESSION_KV) {
    const cookies = parseCookies(request.headers.get('Cookie') || '');
    const sessionId = cookies.session;
    if (!sessionId) {
      return json({ error: 'Please sign in with Google to use the AI coach.', auth_required: true }, 401);
    }
    const sessionData = await env.SESSION_KV.get(`sess:${sessionId}`);
    if (!sessionData) {
      return json({ error: 'Session expired. Please sign in again.', auth_required: true }, 401);
    }
    userId = getUserId(sessionData);
  }

  // ── Rate limiting ─────────────────────────────────────────────────────────
  const ip = request.headers.get('cf-connecting-ip') || 'unknown';
  if (env.RATE_LIMIT_KV) {
    try {
      // Per-user rate limits (preferred — tied to Google identity)
      if (userId) {
        // Hourly per-user
        const userHourKey = `rl:chat:user:${userId}:hr`;
        const userHourRaw = await env.RATE_LIMIT_KV.get(userHourKey);
        const userHourCount = userHourRaw ? parseInt(userHourRaw, 10) : 0;
        if (userHourCount >= USER_HOURLY_LIMIT) {
          return json({ error: `You've used ${USER_HOURLY_LIMIT} requests this hour. Try again later or switch to Groq / Local AI.` }, 429);
        }
        await env.RATE_LIMIT_KV.put(userHourKey, String(userHourCount + 1), { expirationTtl: RATE_WINDOW });

        // Daily per-user
        const userDayKey = `rl:chat:user:${userId}:day`;
        const userDayRaw = await env.RATE_LIMIT_KV.get(userDayKey);
        const userDayCount = userDayRaw ? parseInt(userDayRaw, 10) : 0;
        if (userDayCount >= USER_DAILY_LIMIT) {
          return json({ error: `You've reached your daily limit of ${USER_DAILY_LIMIT} Instant AI requests. Try Groq or Local AI for unlimited usage.` }, 429);
        }
        await env.RATE_LIMIT_KV.put(userDayKey, String(userDayCount + 1), { expirationTtl: DAILY_WINDOW });
      } else {
        // Fallback: per-IP limit for unauthenticated edge cases
        const ipKey = `rl:chat:ip:${ip}`;
        const ipRaw = await env.RATE_LIMIT_KV.get(ipKey);
        const ipCount = ipRaw ? parseInt(ipRaw, 10) : 0;
        if (ipCount >= IP_HOURLY_LIMIT) {
          return json({ error: 'Rate limit exceeded. Please try again later.' }, 429);
        }
        await env.RATE_LIMIT_KV.put(ipKey, String(ipCount + 1), { expirationTtl: RATE_WINDOW });
      }

      // Global daily cap — protects Cloudflare neuron budget
      const globalKey = 'rl:chat:global:daily';
      const globalRaw = await env.RATE_LIMIT_KV.get(globalKey);
      const globalCount = globalRaw ? parseInt(globalRaw, 10) : 0;
      if (globalCount >= DAILY_GLOBAL_CAP) {
        return json({ error: 'Daily AI usage limit reached across all users. Try Groq or Local AI — both are unlimited.' }, 429);
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
