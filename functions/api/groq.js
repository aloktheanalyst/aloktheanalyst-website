// Cloudflare Pages Function — proxies chat requests to Groq (free for all users).
// Deployed automatically by Cloudflare Pages at /api/groq
//
// Required env secret:
//   GROQ_API_KEY  → Groq API key (set via: npx wrangler pages secret put GROQ_API_KEY)
//
// Required bindings:
//   SESSION_KV    → KV namespace (aloktheanalyst_sessions) — for auth + rate limiting
//
// Optional KV binding for rate limiting:
//   RATE_LIMIT_KV → KV namespace (aloktheanalyst_sessions) — can reuse same namespace

const USER_HOURLY_LIMIT = 20;   // max requests per hour per user
const USER_DAILY_LIMIT = 40;    // max requests per day per user
const IP_HOURLY_LIMIT = 15;     // fallback: per-IP for edge cases
const RATE_WINDOW = 3600;       // 1 hour
const DAILY_WINDOW = 86400;     // 24 hours
const DAILY_GLOBAL_CAP = 200;   // Groq free tier is generous

const DEFAULT_MODEL = 'llama-3.3-70b-versatile';

const ALLOWED_MODELS = [
  'llama-3.3-70b-versatile',
  'llama-3.1-8b-instant',
  'gemma2-9b-it',
  'mixtral-8x7b-32768',
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

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: { ...CORS, 'Access-Control-Max-Age': '86400' } });
  }

  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  // Check Groq API key is configured
  if (!env.GROQ_API_KEY) {
    return json({ error: 'Groq API key not configured on server. Please contact the site admin.' }, 503);
  }

  // ── Authenticate — require valid session ────────────────────────────────
  let userId = null;
  if (env.SESSION_KV) {
    const cookies = parseCookies(request.headers.get('Cookie') || '');
    const sessionId = cookies.session;
    if (!sessionId) {
      return json({ error: 'Please sign in with Google to use Groq AI.', auth_required: true }, 401);
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
      if (userId) {
        // Hourly per-user
        const userHourKey = `rl:groq:user:${userId}:hr`;
        const userHourRaw = await env.RATE_LIMIT_KV.get(userHourKey);
        const userHourCount = userHourRaw ? parseInt(userHourRaw, 10) : 0;
        if (userHourCount >= USER_HOURLY_LIMIT) {
          return json({ error: `You've used ${USER_HOURLY_LIMIT} Groq requests this hour. Try Instant or Local AI.` }, 429);
        }
        await env.RATE_LIMIT_KV.put(userHourKey, String(userHourCount + 1), { expirationTtl: RATE_WINDOW });

        // Daily per-user
        const userDayKey = `rl:groq:user:${userId}:day`;
        const userDayRaw = await env.RATE_LIMIT_KV.get(userDayKey);
        const userDayCount = userDayRaw ? parseInt(userDayRaw, 10) : 0;
        if (userDayCount >= USER_DAILY_LIMIT) {
          return json({ error: `You've reached your daily limit of ${USER_DAILY_LIMIT} Groq requests. Try Instant or Local AI.` }, 429);
        }
        await env.RATE_LIMIT_KV.put(userDayKey, String(userDayCount + 1), { expirationTtl: DAILY_WINDOW });
      } else {
        // Fallback: per-IP
        const ipKey = `rl:groq:ip:${ip}`;
        const ipRaw = await env.RATE_LIMIT_KV.get(ipKey);
        const ipCount = ipRaw ? parseInt(ipRaw, 10) : 0;
        if (ipCount >= IP_HOURLY_LIMIT) {
          return json({ error: 'Rate limit exceeded. Please try again later.' }, 429);
        }
        await env.RATE_LIMIT_KV.put(ipKey, String(ipCount + 1), { expirationTtl: RATE_WINDOW });
      }

      // Global daily cap
      const globalKey = 'rl:groq:global:daily';
      const globalRaw = await env.RATE_LIMIT_KV.get(globalKey);
      const globalCount = globalRaw ? parseInt(globalRaw, 10) : 0;
      if (globalCount >= DAILY_GLOBAL_CAP) {
        return json({ error: 'Daily Groq usage limit reached across all users. Try Instant or Local AI.' }, 429);
      }
      await env.RATE_LIMIT_KV.put(globalKey, String(globalCount + 1), { expirationTtl: DAILY_WINDOW });
    } catch {
      // Rate limiting failure shouldn't block the request
    }
  }

  // ── Parse request ─────────────────────────────────────────────────────────
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

  const selectedModel = ALLOWED_MODELS.includes(model) ? model : DEFAULT_MODEL;

  // Build messages with system prompt
  const aiMessages = [];
  if (system) {
    aiMessages.push({ role: 'system', content: system });
  }
  aiMessages.push(...messages.map(m => ({ role: m.role, content: m.content })));

  // ── Call Groq API ─────────────────────────────────────────────────────────
  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: selectedModel,
        max_tokens: 1024,
        messages: aiMessages,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      const errMsg = err.error?.message || `Groq API error ${res.status}`;
      return json({ error: errMsg }, res.status >= 500 ? 502 : res.status);
    }

    const data = await res.json();
    const reply = data.choices?.[0]?.message?.content || '';

    if (!reply) {
      return json({ error: 'Groq returned an empty response' }, 502);
    }

    return json({ reply });
  } catch (err) {
    return json({ error: err.message || 'Failed to reach Groq API' }, 502);
  }
}
