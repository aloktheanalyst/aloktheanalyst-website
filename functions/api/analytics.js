// Cloudflare Pages Function — lightweight practice arena analytics.
// Deployed automatically by Cloudflare Pages at /api/analytics
//
// Required bindings:
//   DB          → D1 database (aloktheanalyst_users)
//   SESSION_KV  → KV namespace (aloktheanalyst_sessions)
//
// Table (auto-created on first request):
//   practice_events (id, user_id, event_type, case_id, metadata, created_at)

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
];

const MAX_METADATA_LEN = 1024;  // limit metadata JSON size
const RATE_LIMIT = 120;         // max analytics events per IP per window
const RATE_WINDOW = 3600;       // 1 hour in seconds

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

// ── Auto-create table if it doesn't exist ──
let tableReady = false;

async function ensureTable(db) {
  if (tableReady) return;
  try {
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS practice_events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        event_type TEXT NOT NULL,
        case_id TEXT,
        metadata TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `).run();

    // Index for common queries (by user, by event type, by date)
    await db.prepare(`
      CREATE INDEX IF NOT EXISTS idx_events_user ON practice_events(user_id)
    `).run();
    await db.prepare(`
      CREATE INDEX IF NOT EXISTS idx_events_type ON practice_events(event_type, created_at)
    `).run();
    await db.prepare(`
      CREATE INDEX IF NOT EXISTS idx_events_case ON practice_events(case_id, event_type)
    `).run();

    tableReady = true;
  } catch (err) {
    console.error('Table creation failed:', err);
    // Don't throw — table might already exist from a previous deployment
    tableReady = true;
  }
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

  // ── Check DB binding ──
  if (!env.DB) {
    return json({ error: 'Database not configured' }, 503);
  }

  // ── Authenticate — require valid session ──
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

  // Validate event type (strict whitelist)
  if (!event || !ALLOWED_EVENTS.includes(event)) {
    return json({ error: 'Invalid event type' }, 400);
  }

  // Validate case_id if provided (alphanumeric + underscore only, max 50 chars)
  if (case_id && (typeof case_id !== 'string' || case_id.length > 50 || !/^[a-zA-Z0-9_]+$/.test(case_id))) {
    return json({ error: 'Invalid case_id' }, 400);
  }

  // Validate and limit metadata
  let metadataStr = null;
  if (metadata) {
    try {
      metadataStr = JSON.stringify(metadata);
      if (metadataStr.length > MAX_METADATA_LEN) {
        metadataStr = metadataStr.substring(0, MAX_METADATA_LEN);
      }
    } catch {
      metadataStr = null;
    }
  }

  // ── Insert event ──
  try {
    await ensureTable(env.DB);

    await env.DB.prepare(
      `INSERT INTO practice_events (user_id, event_type, case_id, metadata)
       VALUES (?1, ?2, ?3, ?4)`
    )
      .bind(userId, event, case_id || null, metadataStr)
      .run();

    return json({ ok: true });
  } catch (err) {
    console.error('Analytics insert failed:', err);
    return json({ error: 'Failed to record event' }, 500);
  }
}
