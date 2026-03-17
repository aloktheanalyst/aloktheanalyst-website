// GET /api/auth/logout — Destroys the session and clears the cookie.
//
// Required bindings:
//   SESSION_KV → KV namespace (aloktheanalyst_sessions)

export async function onRequest(context) {
  const { env, request } = context;

  const cookies = parseCookies(request.headers.get('Cookie') || '');
  const sessionId = cookies.session;

  // Delete session from KV if it exists
  if (sessionId && env.SESSION_KV) {
    try {
      await env.SESSION_KV.delete(`sess:${sessionId}`);
    } catch {
      // Ignore — session may have already expired
    }
  }

  // Clear the session cookie and redirect to practice page
  const clearCookie = 'session=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0';

  return new Response(null, {
    status: 302,
    headers: {
      Location: '/practice',
      'Set-Cookie': clearCookie,
    },
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
