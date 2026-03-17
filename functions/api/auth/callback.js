// GET /api/auth/callback — Google OAuth redirect handler.
//
// Required env vars:
//   GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
//
// Required bindings:
//   DB          → D1 database (aloktheanalyst_users)
//   SESSION_KV  → KV namespace (aloktheanalyst_sessions)
//
// Flow: Google redirects here with ?code=...&state=...
//   1. Validate state (CSRF protection)
//   2. Exchange code for tokens
//   3. Fetch user info from Google
//   4. Upsert user in D1
//   5. Create session in KV
//   6. Set session cookie → redirect to /practice

const SESSION_TTL = 60 * 60 * 24 * 7; // 7 days in seconds

export async function onRequest(context) {
  const { env, request } = context;
  const url = new URL(request.url);

  // ── Validate required env/bindings ────────────────────────────────────────
  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) {
    return error('OAuth not configured.', 503);
  }
  if (!env.DB) {
    return error('Database not configured.', 503);
  }
  if (!env.SESSION_KV) {
    return error('Session store not configured.', 503);
  }

  // ── Extract code and state from query params ──────────────────────────────
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const errorParam = url.searchParams.get('error');

  if (errorParam) {
    return redirect('/practice?auth_error=cancelled');
  }
  if (!code || !state) {
    return redirect('/practice?auth_error=missing_params');
  }

  // ── Validate CSRF state ───────────────────────────────────────────────────
  const cookies = parseCookies(request.headers.get('Cookie') || '');
  if (cookies.oauth_state !== state) {
    return redirect('/practice?auth_error=invalid_state');
  }

  // ── Exchange code for tokens ──────────────────────────────────────────────
  const redirectUri = `${url.origin}/api/auth/callback`;
  let tokens;
  try {
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: env.GOOGLE_CLIENT_ID,
        client_secret: env.GOOGLE_CLIENT_SECRET,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });
    tokens = await tokenRes.json();
    if (!tokens.access_token) {
      return redirect('/practice?auth_error=token_exchange');
    }
  } catch {
    return redirect('/practice?auth_error=token_exchange');
  }

  // ── Fetch user info from Google ───────────────────────────────────────────
  let gUser;
  try {
    const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    gUser = await userRes.json();
    if (!gUser.id || !gUser.email) {
      return redirect('/practice?auth_error=user_info');
    }
  } catch {
    return redirect('/practice?auth_error=user_info');
  }

  // ── Upsert user in D1 ────────────────────────────────────────────────────
  try {
    await env.DB.prepare(
      `INSERT INTO user (google_id, email, name, picture)
       VALUES (?1, ?2, ?3, ?4)
       ON CONFLICT(google_id) DO UPDATE SET
         email = excluded.email,
         name = excluded.name,
         picture = excluded.picture,
         last_login = CURRENT_TIMESTAMP`
    )
      .bind(gUser.id, gUser.email, gUser.name || '', gUser.picture || '')
      .run();
  } catch {
    return redirect('/practice?auth_error=db_error');
  }

  // ── Create session ────────────────────────────────────────────────────────
  const sessionId = crypto.randomUUID();
  const sessionData = JSON.stringify({
    google_id: gUser.id,
    email: gUser.email,
    name: gUser.name || '',
    picture: gUser.picture || '',
  });

  await env.SESSION_KV.put(`sess:${sessionId}`, sessionData, {
    expirationTtl: SESSION_TTL,
  });

  // ── Set cookie and redirect ───────────────────────────────────────────────
  const sessionCookie = `session=${sessionId}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${SESSION_TTL}`;
  // Clear the oauth_state cookie
  const clearState = 'oauth_state=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0';

  return new Response(null, {
    status: 302,
    headers: [
      ['Location', '/practice'],
      ['Set-Cookie', sessionCookie],
      ['Set-Cookie', clearState],
    ],
  });
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function parseCookies(cookieHeader) {
  const cookies = {};
  cookieHeader.split(';').forEach((c) => {
    const [key, ...val] = c.trim().split('=');
    if (key) cookies[key.trim()] = val.join('=').trim();
  });
  return cookies;
}

function redirect(path) {
  return new Response(null, { status: 302, headers: { Location: path } });
}

function error(msg, status = 400) {
  return new Response(msg, { status });
}
