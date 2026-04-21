// Cloudflare Pages Function — per-user attempt history for streak + heatmap.
// Deployed automatically by Cloudflare Pages at /api/attempts
//
// Required bindings:
//   DB          → D1 database (aloktheanalyst_users)
//   SESSION_KV  → KV namespace (aloktheanalyst_sessions)
//
// Table (created by the frontend migration — see CLAUDE.md):
//   user_attempts (google_id, case_id, event_type, attempt_date, first_at, last_at, count)
//
// Endpoints:
//   POST  /api/attempts   body { case_id, event_type }          — record an attempt
//   GET   /api/attempts?days=365                                 — return per-day activity for the user

const MAX_DAYS = 400;             // cap on GET window
const VALID_EVENTS = ['load', 'solve'];
const CASE_ID_RE = /^[a-zA-Z0-9_]{1,64}$/;

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
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

async function authenticate(request, env) {
  if (!env.SESSION_KV) return null;
  const cookies = parseCookies(request.headers.get('Cookie') || '');
  const sessionId = cookies.session;
  if (!sessionId) return null;
  try {
    const raw = await env.SESSION_KV.get(`sess:${sessionId}`);
    if (!raw) return null;
    const session = JSON.parse(raw);
    return session.google_id || null;
  } catch {
    return null;
  }
}

// Table is created out-of-band (see migration in CLAUDE.md). Guard anyway:
let tableReady = false;
async function ensureTable(db) {
  if (tableReady) return;
  try {
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS user_attempts (
        google_id TEXT NOT NULL,
        case_id TEXT NOT NULL,
        event_type TEXT NOT NULL,
        attempt_date TEXT NOT NULL,
        first_at TEXT NOT NULL,
        last_at TEXT NOT NULL,
        count INTEGER NOT NULL DEFAULT 1,
        PRIMARY KEY (google_id, case_id, event_type, attempt_date)
      )
    `).run();
    await db.prepare(`
      CREATE INDEX IF NOT EXISTS idx_user_attempts_user_date
        ON user_attempts(google_id, attempt_date)
    `).run();
    tableReady = true;
  } catch (err) {
    console.error('Table creation failed:', err);
    tableReady = true;
  }
}

export async function onRequest(context) {
  const { env, request } = context;

  // CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: { ...CORS, 'Access-Control-Max-Age': '86400' } });
  }

  if (!env.DB) return json({ error: 'Database not configured' }, 503);

  const googleId = await authenticate(request, env);
  if (!googleId) return json({ error: 'Not authenticated' }, 401);

  await ensureTable(env.DB);

  // ── POST: record an attempt ──
  if (request.method === 'POST') {
    let body;
    try {
      body = await request.json();
    } catch {
      return json({ error: 'Invalid JSON' }, 400);
    }
    const { case_id, event_type } = body || {};
    if (!case_id || !CASE_ID_RE.test(case_id)) {
      return json({ error: 'Invalid case_id' }, 400);
    }
    if (!VALID_EVENTS.includes(event_type)) {
      return json({ error: 'Invalid event_type' }, 400);
    }

    const now = new Date();
    const nowIso = now.toISOString();
    const date = nowIso.slice(0, 10);

    try {
      // UPSERT: on conflict, bump count + update last_at
      await env.DB.prepare(`
        INSERT INTO user_attempts (google_id, case_id, event_type, attempt_date, first_at, last_at, count)
        VALUES (?1, ?2, ?3, ?4, ?5, ?5, 1)
        ON CONFLICT(google_id, case_id, event_type, attempt_date) DO UPDATE SET
          last_at = excluded.last_at,
          count   = user_attempts.count + 1
      `).bind(googleId, case_id, event_type, date, nowIso).run();

      return json({ ok: true });
    } catch (err) {
      console.error('Attempt insert failed:', err);
      return json({ error: 'Failed to record attempt' }, 500);
    }
  }

  // ── GET: per-day activity for heatmap/streak ──
  if (request.method === 'GET') {
    const url = new URL(request.url);
    let days = parseInt(url.searchParams.get('days') || '365', 10);
    if (!Number.isFinite(days) || days < 1) days = 365;
    if (days > MAX_DAYS) days = MAX_DAYS;

    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    const cutoffDate = cutoff.toISOString().slice(0, 10);

    try {
      const { results } = await env.DB.prepare(`
        SELECT attempt_date,
               SUM(CASE WHEN event_type = 'load'  THEN count ELSE 0 END) AS loads,
               SUM(CASE WHEN event_type = 'solve' THEN count ELSE 0 END) AS solves
        FROM user_attempts
        WHERE google_id = ?1 AND attempt_date >= ?2
        GROUP BY attempt_date
        ORDER BY attempt_date
      `).bind(googleId, cutoffDate).all();

      // Also pull most recent case per event type for the Resume card
      const lastLoad = await env.DB.prepare(`
        SELECT case_id, last_at FROM user_attempts
        WHERE google_id = ?1 AND event_type = 'load'
        ORDER BY last_at DESC LIMIT 1
      `).bind(googleId).first();

      const days = {};
      (results || []).forEach(r => {
        days[r.attempt_date] = { loads: Number(r.loads) || 0, solves: Number(r.solves) || 0 };
      });

      return json({
        days,
        lastLoad: lastLoad ? { case_id: lastLoad.case_id, at: lastLoad.last_at } : null,
      });
    } catch (err) {
      console.error('Attempt query failed:', err);
      return json({ error: 'Failed to fetch attempts' }, 500);
    }
  }

  return json({ error: 'Method not allowed' }, 405);
}
