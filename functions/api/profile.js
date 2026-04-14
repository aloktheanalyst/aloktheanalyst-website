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
        'SELECT profile_data, solved_cases, updated_at, profile_complete FROM user_profile WHERE google_id = ?1'
      ).bind(googleId).first();

      if (!row) {
        return json({ profile: null, solvedCases: [], updatedAt: null });
      }

      return json({
        profile: JSON.parse(row.profile_data || '{}'),
        solvedCases: JSON.parse(row.solved_cases || '[]'),
        updatedAt: row.updated_at,
        profileComplete: row.profile_complete === 1,
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

    // Determine if profile is complete (name + targetRole required)
    const p = profile || {};
    const isComplete = !!(p.name && p.name.trim() && p.targetRole && p.targetRole.trim());

    // Fetch email from user table to backfill
    let emailFromUser = null;
    try {
      const userRow = await env.DB.prepare('SELECT email FROM user WHERE google_id = ?1').bind(googleId).first();
      if (userRow) emailFromUser = userRow.email;
    } catch { /* non-fatal */ }

    try {
      await env.DB.prepare(`
        INSERT INTO user_profile (
          google_id, profile_data, solved_cases, updated_at,
          email, name, current_role, target_role, exp_status, career_start_date,
          target_companies, prep_stage, sql_level, python_level, tools,
          discovery_source, city, timezone, linkedin_url, profile_complete
        ) VALUES (
          ?1, ?2, ?3, CURRENT_TIMESTAMP,
          ?4, ?5, ?6, ?7, ?8, ?9,
          ?10, ?11, ?12, ?13, ?14,
          ?15, ?16, ?17, ?18, ?19
        )
        ON CONFLICT(google_id) DO UPDATE SET
          profile_data     = excluded.profile_data,
          solved_cases     = excluded.solved_cases,
          updated_at       = CURRENT_TIMESTAMP,
          email            = COALESCE(excluded.email, user_profile.email),
          name             = excluded.name,
          current_role     = excluded.current_role,
          target_role      = excluded.target_role,
          exp_status       = excluded.exp_status,
          career_start_date= excluded.career_start_date,
          target_companies = excluded.target_companies,
          prep_stage       = excluded.prep_stage,
          sql_level        = excluded.sql_level,
          python_level     = excluded.python_level,
          tools            = excluded.tools,
          discovery_source = excluded.discovery_source,
          city             = excluded.city,
          timezone         = excluded.timezone,
          linkedin_url     = excluded.linkedin_url,
          profile_complete = excluded.profile_complete
      `).bind(
        googleId, profileStr, solvedStr,
        emailFromUser,
        p.name || null,
        p.currentRole || null,
        p.targetRole || null,
        p.expStatus || null,
        p.careerStartDate || null,
        p.targetCompanies || null,
        p.prepStage || null,
        p.sqlLevel || null,
        p.pythonLevel || null,
        p.tools ? JSON.stringify(p.tools) : null,
        p.discoverySource || null,
        p.city || null,
        p.timezone || null,
        p.linkedinUrl || null,
        isComplete ? 1 : 0,
      ).run();

      return json({ ok: true, profileComplete: isComplete });
    } catch (err) {
      console.error('Profile save failed:', err);
      return json({ error: 'Failed to save profile' }, 500);
    }
  }

  return json({ error: 'Method not allowed' }, 405);
}
