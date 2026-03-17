// GET /api/auth/login — Redirects user to Google OAuth consent screen.
//
// Required env vars (Cloudflare Pages → Settings → Variables):
//   GOOGLE_CLIENT_ID
//
// Flow: Browser → /api/auth/login → Google OAuth → /api/auth/callback

export async function onRequest(context) {
  const { env, request } = context;

  if (!env.GOOGLE_CLIENT_ID) {
    return new Response('Google OAuth not configured.', { status: 503 });
  }

  // Build the callback URL from the current request origin
  const url = new URL(request.url);
  const redirectUri = `${url.origin}/api/auth/callback`;

  // Generate a random state token to prevent CSRF
  const state = crypto.randomUUID();

  // Store state in a short-lived cookie (5 min)
  const stateCookie = `oauth_state=${state}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=300`;

  const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  googleAuthUrl.searchParams.set('client_id', env.GOOGLE_CLIENT_ID);
  googleAuthUrl.searchParams.set('redirect_uri', redirectUri);
  googleAuthUrl.searchParams.set('response_type', 'code');
  googleAuthUrl.searchParams.set('scope', 'openid email profile');
  googleAuthUrl.searchParams.set('state', state);
  googleAuthUrl.searchParams.set('prompt', 'select_account');

  return new Response(null, {
    status: 302,
    headers: {
      Location: googleAuthUrl.toString(),
      'Set-Cookie': stateCookie,
    },
  });
}
