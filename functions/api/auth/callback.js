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
//   6. Set session cookie → redirect to original page (from oauth_redirect cookie)

const SESSION_TTL = 60 * 60 * 24 * 7; // 7 days in seconds

export async function onRequest(context) {
  try {
    return await handleCallback(context);
  } catch (err) {
    // Top-level catch — prevents Error 1101 entirely
    return errorPage(
      'Something went wrong during sign-in.',
      `${err.name}: ${err.message}`,
      'Check that all Cloudflare bindings (DB, SESSION_KV) and secrets (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET) are configured in Pages → Settings → Functions.'
    );
  }
}

async function handleCallback(context) {
  const { env, request } = context;
  const url = new URL(request.url);

  // ── Validate required env/bindings ──────────────────────────────────────
  const missing = [];
  if (!env.GOOGLE_CLIENT_ID) missing.push('GOOGLE_CLIENT_ID');
  if (!env.GOOGLE_CLIENT_SECRET) missing.push('GOOGLE_CLIENT_SECRET');
  if (!env.DB) missing.push('DB (D1 database binding)');
  if (!env.SESSION_KV) missing.push('SESSION_KV (KV namespace binding)');

  if (missing.length > 0) {
    return errorPage(
      'OAuth is not fully configured.',
      `Missing: ${missing.join(', ')}`,
      'Add these in Cloudflare Dashboard → Pages → your project → Settings → Functions → Bindings / Environment variables.'
    );
  }

  // ── Extract code and state from query params ────────────────────────────
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const errorParam = url.searchParams.get('error');

  if (errorParam) {
    return errorPage(
      'Google sign-in was cancelled or denied.',
      `Google error: ${errorParam}`,
      'Please try signing in again.'
    );
  }
  if (!code || !state) {
    return errorPage(
      'Invalid callback — missing parameters.',
      `code: ${code ? 'present' : 'missing'}, state: ${state ? 'present' : 'missing'}`,
      'Please try signing in again from the login page.'
    );
  }

  // ── Validate CSRF state ─────────────────────────────────────────────────
  const cookies = parseCookies(request.headers.get('Cookie') || '');
  if (cookies.oauth_state !== state) {
    return errorPage(
      'Session verification failed.',
      'The OAuth state token did not match. This may happen if cookies are blocked or the request expired.',
      'Please try signing in again. Make sure cookies are enabled for this site.'
    );
  }

  // ── Exchange code for tokens ────────────────────────────────────────────
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
      return errorPage(
        'Failed to exchange authorization code.',
        `Google response: ${JSON.stringify(tokens.error || tokens).substring(0, 200)}`,
        'This may mean the Google OAuth app is not properly configured, or the redirect URI doesn\'t match.'
      );
    }
  } catch (err) {
    return errorPage(
      'Token exchange failed.',
      `${err.name}: ${err.message}`,
      'Could not reach Google\'s token endpoint. Please try again.'
    );
  }

  // ── Fetch user info from Google ─────────────────────────────────────────
  let gUser;
  try {
    const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    gUser = await userRes.json();
    if (!gUser.id || !gUser.email) {
      return errorPage(
        'Could not retrieve your Google profile.',
        `Received: ${JSON.stringify(gUser).substring(0, 200)}`,
        'Please try signing in again.'
      );
    }
  } catch (err) {
    return errorPage(
      'Failed to fetch user info.',
      `${err.name}: ${err.message}`,
      'Could not reach Google\'s user info endpoint. Please try again.'
    );
  }

  // ── Upsert user in D1 ──────────────────────────────────────────────────
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
  } catch (err) {
    return errorPage(
      'Database error while saving your account.',
      `${err.name}: ${err.message}`,
      'The D1 database binding (DB) may not be configured, or the "user" table may not exist. Run the CREATE TABLE statement in D1 console.'
    );
  }

  // ── Create session ──────────────────────────────────────────────────────
  const sessionId = crypto.randomUUID();
  const sessionData = JSON.stringify({
    google_id: gUser.id,
    email: gUser.email,
    name: gUser.name || '',
    picture: gUser.picture || '',
  });

  try {
    await env.SESSION_KV.put(`sess:${sessionId}`, sessionData, {
      expirationTtl: SESSION_TTL,
    });
  } catch (err) {
    return errorPage(
      'Failed to create your session.',
      `${err.name}: ${err.message}`,
      'The SESSION_KV binding may not be configured correctly. Add it in Pages → Settings → Functions → KV namespace bindings.'
    );
  }

  // ── Determine redirect destination ─────────────────────────────────────
  const rawRedirect = cookies.oauth_redirect
    ? decodeURIComponent(cookies.oauth_redirect)
    : '/practice';
  const safeRedirect = isLocalPath(rawRedirect) ? rawRedirect : '/practice';

  // ── Set cookie and redirect ─────────────────────────────────────────────
  const sessionCookie = `session=${sessionId}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${SESSION_TTL}`;
  const clearState = 'oauth_state=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0';
  const clearRedirect = 'oauth_redirect=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0';

  return new Response(null, {
    status: 302,
    headers: [
      ['Location', safeRedirect],
      ['Set-Cookie', sessionCookie],
      ['Set-Cookie', clearState],
      ['Set-Cookie', clearRedirect],
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

function isLocalPath(path) {
  if (!path || typeof path !== 'string') return false;
  if (!path.startsWith('/')) return false;
  if (path.startsWith('//')) return false;
  if (/^\/[^/]*:/.test(path)) return false;
  return true;
}

function errorPage(title, detail, hint) {
  return new Response(
    `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Sign-In Error — Alok The Analyst</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    min-height: 100vh; display: flex; align-items: center; justify-content: center;
    background: #f8faff; font-family: 'DM Sans', sans-serif; color: #334155;
  }
  .card {
    text-align: center; max-width: 520px; padding: 3rem 2rem;
  }
  .brand {
    font-family: 'Bebas Neue', sans-serif; font-size: 1.3rem;
    letter-spacing: 3px; color: #0f172a; margin-bottom: 2rem;
  }
  .brand span { color: #2563eb; }
  .icon { font-size: 2.5rem; margin-bottom: 1rem; }
  h1 {
    font-family: 'Bebas Neue', sans-serif; font-size: 1.5rem;
    letter-spacing: 1px; color: #0f172a; margin-bottom: 0.8rem;
  }
  .detail {
    background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px;
    padding: 0.8rem 1rem; font-size: 0.82rem; color: #991b1b;
    margin-bottom: 1rem; word-break: break-word; text-align: left;
  }
  .hint {
    color: #64748b; font-size: 0.85rem; line-height: 1.6;
    margin-bottom: 1.5rem;
  }
  .retry {
    display: inline-block; padding: 0.6rem 1.5rem; border-radius: 8px;
    background: #2563eb; color: #fff; text-decoration: none;
    font-weight: 600; font-size: 0.88rem; transition: background 0.2s;
  }
  .retry:hover { background: #1d4ed8; }
  .home {
    display: inline-block; margin-top: 1rem; font-size: 0.82rem;
    color: #64748b; text-decoration: none;
  }
  .home:hover { color: #2563eb; }
</style>
</head>
<body>
<div class="card">
  <div class="brand">ALOK.<span>ANALYST</span></div>
  <div class="icon">&#x26A0;&#xFE0F;</div>
  <h1>${escapeHtml(title)}</h1>
  <div class="detail">${escapeHtml(detail)}</div>
  <p class="hint">${escapeHtml(hint)}</p>
  <a href="/practice" class="retry">Try Again</a><br>
  <a href="/" class="home">&larr; Back to home</a>
</div>
</body>
</html>`,
    {
      status: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    }
  );
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
