// Cloudflare Pages Function — practice arena analytics via Workers Analytics Engine.
// Deployed automatically by Cloudflare Pages at /api/analytics
//
// Required bindings:
//   ANALYTICS   → Analytics Engine dataset (practice_events)
//   SESSION_KV  → KV namespace (aloktheanalyst_sessions)
//
// Data point schema (index1 + blob1-6 + double1-3):
//   index1  — user_id          (primary cardinality dimension)
//   blob1   — event_type
//   blob2   — case_id
//   blob3   — tag              (SQL / Case Study / Python / …)
//   blob4   — difficulty       (easy / medium / hard)
//   blob5   — dialect          (sql / python)
//   blob6   — referrer         (session_start only)
//   double1 — score            (score_received)
//   double2 — hint_number      (hint_used)
//   double3 — code_length      (answer_checked)

// ── Allowed event types (whitelist — reject anything else) ──
const ALLOWED_EVENTS = [
  'case_load',         // user opened a case study
  'code_run',          // user ran their code
  'hint_used',         // user clicked a hint
  'answer_checked',    // user clicked Check My Answer
  'score_received',    // AI returned a score
  'tab_switch',        // user switched between Code Editor / AI Coach
  'session_start',     // user landed on practice page
  'chat_message',      // user sent a message in AI Coach
  'solution_view',     // user revealed the solution
  'test_cases_run',    // user ran test cases
];

const RATE_LIMIT = 120;   // max events per IP per window
const RATE_WINDOW = 3600; // 1 hour in seconds

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

export async function onRequest(context) {
  const { env, request } = context;

  // ── CORS preflight ──
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: { ...CORS, 'Access-Control-Max-Age': '86400' } });
  }

  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  // ── Check Analytics Engine binding ──
  if (!env.ANALYTICS) {
    return json({ error: 'Analytics not configured' }, 503);
  }

  // ── Authenticate — resolve user from session cookie ──
  let userId = 'anonymous';
  if (env.SESSION_KV) {
    const cookies = parseCookies(request.headers.get('Cookie') || '');
    const sessionId = cookies.session;
    if (sessionId) {
      try {
        const raw = await env.SESSION_KV.get(`sess:${sessionId}`);
        if (raw) {
          const session = JSON.parse(raw);
          userId = session.google_id || session.email || 'authenticated';
        }
      } catch { /* proceed with anonymous */ }
    }
  }

  // ── Rate limiting (IP-based, via SESSION_KV) ──
  const ip = request.headers.get('cf-connecting-ip') || 'unknown';
  if (env.SESSION_KV) {
    try {
      const key = `rl:analytics:${ip}`;
      const raw = await env.SESSION_KV.get(key);
      const count = raw ? parseInt(raw, 10) : 0;
      if (count >= RATE_LIMIT) {
        return json({ error: 'Rate limit exceeded' }, 429);
      }
      await env.SESSION_KV.put(key, String(count + 1), { expirationTtl: RATE_WINDOW });
    } catch { /* rate limiting failure shouldn't block the request */ }
  }

  // ── Parse and validate body ──
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid JSON body' }, 400);
  }

  const { event, case_id, metadata } = body;

  // Validate event type
  if (!event || !ALLOWED_EVENTS.includes(event)) {
    return json({ error: 'Invalid event type' }, 400);
  }

  // Validate case_id if provided
  if (case_id && (typeof case_id !== 'string' || case_id.length > 50 || !/^[a-zA-Z0-9_]+$/.test(case_id))) {
    return json({ error: 'Invalid case_id' }, 400);
  }

  // ── Build and write data point ──
  const m = (metadata && typeof metadata === 'object') ? metadata : {};

  env.ANALYTICS.writeDataPoint({
    indexes: [userId],
    blobs: [
      event,                          // blob1 — event_type
      case_id || '',                  // blob2 — case_id
      String(m.tag || ''),            // blob3 — tag
      String(m.difficulty || ''),     // blob4 — difficulty
      String(m.dialect || ''),        // blob5 — dialect
      String(m.referrer || ''),       // blob6 — referrer (session_start)
    ],
    doubles: [
      Number(m.score) || 0,           // double1 — score (score_received)
      Number(m.hint_number) || 0,     // double2 — hint_number (hint_used)
      Number(m.code_length) || 0,     // double3 — code_length (answer_checked)
    ],
  });

  return json({ ok: true });
}
