// Cloudflare Pages Function — practice arena analytics via Workers Analytics Engine.
// Deployed automatically by Cloudflare Pages at /api/analytics
//
// Required bindings:
//   ANALYTICS   → Analytics Engine dataset (practice_events)
//   SESSION_KV  → KV namespace (aloktheanalyst_sessions)
//
// Data point schema (index1 + blob1-14 + double1-3):
//   index1  — email            (primary cardinality dimension)
//   blob1   — event_type
//   blob2   — case_id
//   blob3   — tag              (SQL / Case Study / Python / …)
//   blob4   — difficulty       (easy / medium / hard)
//   blob5   — dialect          (sql / python)
//   blob6   — referrer         (session_start only)
//   blob7   — google_id
//   blob8   — country          (e.g. IN, US, SG)
//   blob9   — city             (e.g. Mumbai, New York)
//   blob10  — continent        (e.g. AS, EU, NA)
//   blob11  — timezone         (e.g. Asia/Kolkata)
//   blob12  — browser          (e.g. Chrome, Safari, Firefox)
//   blob13  — os               (e.g. Windows, macOS, iOS, Android)
//   blob14  — device_type      (desktop / mobile / tablet)
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

// ── Parse browser, OS, and device type from User-Agent ──
function parseUserAgent(ua) {
  if (!ua) return { browser: '', os: '', deviceType: '' };

  // Device type
  let deviceType = 'desktop';
  if (/tablet|ipad|playbook|silk/i.test(ua)) {
    deviceType = 'tablet';
  } else if (/mobile|iphone|ipod|android.*mobile|windows phone|blackberry/i.test(ua)) {
    deviceType = 'mobile';
  }

  // OS
  let os = '';
  if (/windows phone/i.test(ua))       os = 'Windows Phone';
  else if (/win/i.test(ua))            os = 'Windows';
  else if (/iphone|ipad|ipod/i.test(ua)) os = 'iOS';
  else if (/mac/i.test(ua))            os = 'macOS';
  else if (/android/i.test(ua))        os = 'Android';
  else if (/linux/i.test(ua))          os = 'Linux';

  // Browser
  let browser = '';
  if (/edg\//i.test(ua))              browser = 'Edge';
  else if (/opr\//i.test(ua))         browser = 'Opera';
  else if (/chrome/i.test(ua))        browser = 'Chrome';
  else if (/safari/i.test(ua))        browser = 'Safari';
  else if (/firefox/i.test(ua))       browser = 'Firefox';
  else if (/msie|trident/i.test(ua))  browser = 'IE';

  return { browser, os, deviceType };
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
  let googleId = '';
  if (env.SESSION_KV) {
    const cookies = parseCookies(request.headers.get('Cookie') || '');
    const sessionId = cookies.session;
    if (sessionId) {
      try {
        const raw = await env.SESSION_KV.get(`sess:${sessionId}`);
        if (raw) {
          const session = JSON.parse(raw);
          userId = session.email || session.google_id || 'authenticated';
          googleId = session.google_id || '';
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

  // ── Geo & device metadata from Cloudflare request ──
  const cf = request.cf || {};
  const { browser, os, deviceType } = parseUserAgent(request.headers.get('user-agent') || '');

  // ── Build and write data point ──
  const m = (metadata && typeof metadata === 'object') ? metadata : {};

  env.ANALYTICS.writeDataPoint({
    indexes: [userId],
    blobs: [
      event,                          // blob1  — event_type
      case_id || '',                  // blob2  — case_id
      String(m.tag || ''),            // blob3  — tag
      String(m.difficulty || ''),     // blob4  — difficulty
      String(m.dialect || ''),        // blob5  — dialect
      String(m.referrer || ''),       // blob6  — referrer (session_start)
      googleId,                       // blob7  — google_id
      String(cf.country || ''),       // blob8  — country
      String(cf.city || ''),          // blob9  — city
      String(cf.continent || ''),     // blob10 — continent
      String(cf.timezone || ''),      // blob11 — timezone
      browser,                        // blob12 — browser
      os,                             // blob13 — os
      deviceType,                     // blob14 — device_type
    ],
    doubles: [
      Number(m.score) || 0,           // double1 — score (score_received)
      Number(m.hint_number) || 0,     // double2 — hint_number (hint_used)
      Number(m.code_length) || 0,     // double3 — code_length (answer_checked)
    ],
  });

  return json({ ok: true });
}
