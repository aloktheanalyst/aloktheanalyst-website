// Cloudflare Pages Function — user profile + solved cases (D1-backed).
// Deployed automatically by Cloudflare Pages at /api/profile
//
// Required bindings:
//   DB          → D1 database (aloktheanalyst_users)
//   SESSION_KV  → KV namespace (aloktheanalyst_sessions)
//
// Table (auto-created on first request):
//   user_profile (google_id, profile_data, solved_cases, updated_at)

const MAX_PROFILE_LEN = 4096;   // max profile JSON size
const MAX_SOLVED_LEN = 2048;    // max solved cases JSON size

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
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
      CREATE TABLE IF NOT EXISTS user_profile (
        google_id TEXT PRIMARY KEY,
        profile_data TEXT NOT NULL DEFAULT '{}',
        solved_cases TEXT NOT NULL DEFAULT '[]',
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `).run();
    tableReady = true;
  } catch (err) {
    console.error('Table creation failed:', err);
    tableReady = true;
  }
}

// ── Authenticate — require valid session, return google_id ──
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

export async function onRequest(context) {
  const { env, request } = context;

  // ── CORS preflight ──
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: { ...CORS, 'Access-Control-Max-Age': '86400' } });
  }

  if (!env.DB) {
    return json({ error: 'Database not configured' }, 503);
  }

  const googleId = await authenticate(request, env);
  if (!googleId) {
    return json({ error: 'Not authenticated' }, 401);
  }

  await ensureTable(env.DB);

  // ── GET: Fetch profile + solved cases ──
  if (request.method === 'GET') {
    try {
      const row = await env.DB.prepare(
        'SELECT profile_data, solved_cases, updated_at FROM user_profile WHERE google_id = ?1'
      ).bind(googleId).first();

      if (!row) {
        return json({ profile: null, solvedCases: [], updatedAt: null });
      }

      return json({
        profile: JSON.parse(row.profile_data || '{}'),
        solvedCases: JSON.parse(row.solved_cases || '[]'),
        updatedAt: row.updated_at,
      });
    } catch (err) {
      console.error('Profile fetch failed:', err);
      return json({ error: 'Failed to fetch profile' }, 500);
    }
  }

  // ── PUT: Save profile + solved cases ──
  if (request.method === 'PUT') {
    let body;
    try {
      body = await request.json();
    } catch {
      return json({ error: 'Invalid JSON body' }, 400);
    }

    const { profile, solvedCases } = body;

    // Validate profile data size
    const profileStr = JSON.stringify(profile || {});
    if (profileStr.length > MAX_PROFILE_LEN) {
      return json({ error: 'Profile data too large' }, 400);
    }

    // Validate solved cases
    const solvedStr = JSON.stringify(solvedCases || []);
    if (solvedStr.length > MAX_SOLVED_LEN) {
      return json({ error: 'Solved cases data too large' }, 400);
    }

    try {
      await env.DB.prepare(`
        INSERT INTO user_profile (google_id, profile_data, solved_cases, updated_at)
        VALUES (?1, ?2, ?3, CURRENT_TIMESTAMP)
        ON CONFLICT(google_id) DO UPDATE SET
          profile_data = excluded.profile_data,
          solved_cases = excluded.solved_cases,
          updated_at = CURRENT_TIMESTAMP
      `).bind(googleId, profileStr, solvedStr).run();

      return json({ ok: true });
    } catch (err) {
      console.error('Profile save failed:', err);
      return json({ error: 'Failed to save profile' }, 500);
    }
  }

  return json({ error: 'Method not allowed' }, 405);
}
