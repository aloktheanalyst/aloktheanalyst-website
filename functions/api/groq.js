// Cloudflare Pages Function — proxies chat requests to Groq (free for all users).
// Deployed automatically by Cloudflare Pages at /api/groq
//
// Required env secret:
//   GROQ_API_KEY  → Groq API key (set via: npx wrangler pages secret put GROQ_API_KEY)
//
// Optional KV binding for rate limiting:
//   RATE_LIMIT_KV  → KV namespace (aloktheanalyst_sessions)

const RATE_LIMIT = 20;     // max requests per window per IP
const RATE_WINDOW = 3600;  // 1 hour
const DAILY_GLOBAL_CAP = 200; // Groq free tier is generous — 30 req/min, ~14K tokens/day
const DAILY_WINDOW = 86400;

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

  // Rate limiting
  const ip = request.headers.get('cf-connecting-ip') || 'unknown';
  if (env.RATE_LIMIT_KV) {
    try {
      const key = `rl:groq:${ip}`;
      const raw = await env.RATE_LIMIT_KV.get(key);
      const count = raw ? parseInt(raw, 10) : 0;
      if (count >= RATE_LIMIT) {
        return json({ error: 'Groq rate limit exceeded. Please try again later or switch providers.' }, 429);
      }
      await env.RATE_LIMIT_KV.put(key, String(count + 1), { expirationTtl: RATE_WINDOW });

      const globalKey = 'rl:groq:global:daily';
      const globalRaw = await env.RATE_LIMIT_KV.get(globalKey);
      const globalCount = globalRaw ? parseInt(globalRaw, 10) : 0;
      if (globalCount >= DAILY_GLOBAL_CAP) {
        return json({ error: 'Daily Groq usage limit reached. Try again tomorrow or switch providers.' }, 429);
      }
      await env.RATE_LIMIT_KV.put(globalKey, String(globalCount + 1), { expirationTtl: DAILY_WINDOW });
    } catch {
      // Rate limiting failure shouldn't block the request
    }
  }

  // Parse request
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

  // Call Groq API
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
