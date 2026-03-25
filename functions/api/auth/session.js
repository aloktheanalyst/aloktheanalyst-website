// GET /api/auth/session — Returns the current user's session info.
//
// Required bindings:
//   SESSION_KV → KV namespace (aloktheanalyst_sessions)
//
// Returns:
//   200 { authenticated: true, user: { email, name, picture } }
//   401 { authenticated: false }

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function onRequest(context) {
  const { env, request } = context;

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: CORS });
  }

  if (!env.SESSION_KV) {
    return json({ authenticated: false, error: 'Session store not configured.' }, 503);
  }

  const cookies = parseCookies(request.headers.get('Cookie') || '');
  const sessionId = cookies.session;

  if (!sessionId) {
    return json({ authenticated: false });
  }

  const raw = await env.SESSION_KV.get(`sess:${sessionId}`);
  if (!raw) {
    return json({ authenticated: false });
  }

  try {
    const session = JSON.parse(raw);
    // Only expose necessary fields (not internal google_id)
    const user = { email: session.email, name: session.name, picture: session.picture };
    return new Response(JSON.stringify({ authenticated: true, user }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        // Cache in browser for 2 min — avoids repeated KV reads on page navigations
        'Cache-Control': 'private, max-age=120',
        ...CORS,
      },
    });
  } catch {
    return json({ authenticated: false });
  }
}

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
