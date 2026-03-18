// Server-side auth gate for /domain-knowledge routes.
// Blocks unauthenticated users from ever receiving the page content.
// All logic inlined — CF Pages Functions don't support cross-file imports.

export async function onRequest(context) {
  const { request, next, env } = context;
  const title = 'Sign in to access Domain Knowledge';
  const subtitle =
    'Deep-dive guides on SaaS funnels, marketing analytics, and real-world domain expertise — free with Google sign-in.';

  // ── Validate session ──────────────────────────────────────────────────────
  if (env.SESSION_KV) {
    const cookies = parseCookies(request.headers.get('Cookie') || '');
    const sessionId = cookies.session;

    if (sessionId) {
      const sessionData = await env.SESSION_KV.get(`sess:${sessionId}`);
      if (sessionData) {
        // Valid session — serve the page
        return next();
      }
    }
  } else {
    // SESSION_KV not bound — fail closed (block access until properly configured)
    const url = new URL(request.url);
    const redirectPath = url.pathname + url.search;
    const loginUrl = `/api/auth/login?redirect=${encodeURIComponent(redirectPath)}`;
    return new Response(renderLoginPage({ title, subtitle, loginUrl }), {
      status: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }

  // ── No valid session — return login page ──────────────────────────────────
  const url = new URL(request.url);
  const redirectPath = url.pathname + url.search;
  const loginUrl = `/api/auth/login?redirect=${encodeURIComponent(redirectPath)}`;

  const html = renderLoginPage({ title, subtitle, loginUrl });

  return new Response(html, {
    status: 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
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

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderLoginPage({ title, subtitle, loginUrl }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Sign In — Alok The Analyst</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f8faff;
    font-family: 'DM Sans', sans-serif;
    color: #334155;
  }
  .gate {
    text-align: center;
    max-width: 420px;
    padding: 3rem 2rem;
  }
  .brand {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 1.3rem;
    letter-spacing: 3px;
    color: #0f172a;
    margin-bottom: 2.5rem;
  }
  .brand span { color: #2563eb; }
  .lock-icon {
    width: 72px;
    height: 72px;
    border-radius: 50%;
    background: linear-gradient(135deg, rgba(37,99,235,0.1), rgba(124,58,237,0.08));
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 1.5rem;
    font-size: 1.8rem;
  }
  h1 {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 1.8rem;
    letter-spacing: 1.5px;
    color: #0f172a;
    margin-bottom: 0.6rem;
  }
  .subtitle {
    color: #64748b;
    font-size: 0.92rem;
    line-height: 1.6;
    margin-bottom: 2rem;
  }
  .google-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.7rem;
    padding: 0.75rem 1.8rem;
    border-radius: 8px;
    border: 1px solid #e2e8f2;
    background: #fff;
    color: #334155;
    font-size: 0.92rem;
    font-weight: 600;
    font-family: 'DM Sans', sans-serif;
    cursor: pointer;
    transition: all 0.2s;
    text-decoration: none;
    box-shadow: 0 1px 3px rgba(0,0,0,0.06);
  }
  .google-btn:hover {
    border-color: #2563eb;
    box-shadow: 0 4px 12px rgba(37,99,235,0.12);
    transform: translateY(-1px);
  }
  .google-btn svg { width: 18px; height: 18px; flex-shrink: 0; }
  .note {
    margin-top: 1.2rem;
    font-size: 0.78rem;
    color: #94a3b8;
  }
  .back-link {
    display: inline-block;
    margin-top: 2rem;
    font-size: 0.82rem;
    color: #64748b;
    text-decoration: none;
  }
  .back-link:hover { color: #2563eb; }
</style>
</head>
<body>
<div class="gate">
  <div class="brand">ALOK.<span>ANALYST</span></div>
  <div class="lock-icon">&#x1f512;</div>
  <h1>${escapeHtml(title)}</h1>
  <p class="subtitle">${escapeHtml(subtitle)}</p>
  <a href="${escapeHtml(loginUrl)}" class="google-btn">
    <svg viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
    Sign in with Google
  </a>
  <div class="note">Free &middot; No credit card needed</div>
  <a href="/" class="back-link">&larr; Back to home</a>
</div>
</body>
</html>`;
}
