// Cloudflare Pages Function — proxies AI requests to external providers (Groq, OpenAI)
// that don't support CORS for direct browser calls.
//
// The user's API key is forwarded in the request and NEVER stored server-side.
// Deployed automatically by Cloudflare Pages at /api/proxy

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

// Provider configs — endpoint + how to parse the response
const PROVIDERS = {
  groq: {
    url: 'https://api.groq.com/openai/v1/chat/completions',
    parseReply: (data) => data.choices?.[0]?.message?.content || '',
  },
  openai: {
    url: 'https://api.openai.com/v1/chat/completions',
    parseReply: (data) => data.choices?.[0]?.message?.content || '',
  },
};

const PROXY_HOURLY_LIMIT = 60;  // generous — user's own API key
const RATE_WINDOW = 3600;

export async function onRequest(context) {
  const { env, request } = context;

  // CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: { ...CORS, 'Access-Control-Max-Age': '86400' } });
  }

  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  // Rate limit by IP to prevent proxy abuse
  const ip = request.headers.get('cf-connecting-ip') || 'unknown';
  if (env.RATE_LIMIT_KV) {
    try {
      const key = `rl:proxy:ip:${ip}`;
      const raw = await env.RATE_LIMIT_KV.get(key);
      const count = raw ? parseInt(raw, 10) : 0;
      if (count >= PROXY_HOURLY_LIMIT) {
        return json({ error: 'Proxy rate limit exceeded. Please try again later.' }, 429);
      }
      await env.RATE_LIMIT_KV.put(key, String(count + 1), { expirationTtl: RATE_WINDOW });
    } catch { /* don't block on rate limit failure */ }
  }

  // Parse request
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid JSON body' }, 400);
  }

  const { provider, apiKey, model, messages, system, max_tokens } = body;

  // Validate provider
  if (!provider || !PROVIDERS[provider]) {
    return json({ error: `Unsupported provider: ${provider}. Supported: ${Object.keys(PROVIDERS).join(', ')}` }, 400);
  }

  // Validate API key
  if (!apiKey || typeof apiKey !== 'string' || apiKey.length < 10) {
    return json({ error: 'Valid API key is required' }, 400);
  }

  // Validate messages
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return json({ error: 'messages array is required' }, 400);
  }

  const config = PROVIDERS[provider];

  // Build messages array with system prompt
  const aiMessages = [];
  if (system) {
    aiMessages.push({ role: 'system', content: system });
  }
  aiMessages.push(...messages.map(m => ({ role: m.role, content: m.content })));

  // Forward to provider
  try {
    const res = await fetch(config.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model || 'llama-3.3-70b-versatile',
        max_tokens: max_tokens || 1024,
        messages: aiMessages,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      const errMsg = err.error?.message || err.error || `${provider} API error ${res.status}`;
      return json({ error: errMsg }, res.status);
    }

    const data = await res.json();
    const reply = config.parseReply(data);

    if (!reply) {
      return json({ error: `${provider} returned an empty response` }, 502);
    }

    return json({ reply });
  } catch (err) {
    return json({ error: err.message || `Failed to reach ${provider} API` }, 502);
  }
}
