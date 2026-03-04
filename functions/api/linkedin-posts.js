// Cloudflare Pages Function — manages LinkedIn post embeds stored in KV.
//
// GET  /api/linkedin-posts          → returns array of embed URLs (public)
// POST /api/linkedin-posts          → adds a new post from a LinkedIn URL (webhook, secret-protected)
//
// Required environment variables (Cloudflare Pages → Settings → Variables):
//   WEBHOOK_SECRET  — any random string; Zapier sends this in Authorization: Bearer <secret>
//
// Required KV binding (Cloudflare Pages → Settings → Functions → KV namespace bindings):
//   Variable name: LINKEDIN_POSTS_KV  →  namespace: aloktheanalyst_linkedin_posts

const KV_KEY = 'posts';
const MAX_POSTS = 6; // keep the latest N posts

// Extract LinkedIn activity ID from a post URL or embed URL, then build embed URL.
// Supports formats:
//   https://www.linkedin.com/posts/username_slug-activity-7123456789-xxxx/
//   https://www.linkedin.com/feed/update/urn:li:activity:7123456789
//   https://www.linkedin.com/embed/feed/update/urn:li:activity:7123456789
function toEmbedUrl(url) {
  const match = url.match(/activity[:\-](\d{10,})/);
  if (!match) return null;
  return `https://www.linkedin.com/embed/feed/update/urn:li:activity:${match[1]}`;
}

export async function onRequest(context) {
  const { env, request } = context;
  const method = request.method.toUpperCase();

  // ── GET: return stored post embed URLs ──────────────────────────────────────
  if (method === 'GET') {
    const raw   = await env.LINKEDIN_POSTS_KV.get(KV_KEY);
    const posts = raw ? JSON.parse(raw) : [];
    return new Response(JSON.stringify(posts), {
      headers: {
        'Content-Type':                'application/json',
        'Cache-Control':               'public, max-age=300', // 5 min cache
        'Access-Control-Allow-Origin': '*',
      },
    });
  }

  // ── POST: add a new post via Zapier webhook ─────────────────────────────────
  if (method === 'POST') {
    // Verify secret
    const auth   = request.headers.get('Authorization') || '';
    const secret = auth.replace('Bearer ', '').trim();
    if (!env.WEBHOOK_SECRET || secret !== env.WEBHOOK_SECRET) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const body      = await request.json().catch(() => ({}));
    const embedUrl  = toEmbedUrl(body.url || '');
    if (!embedUrl) {
      return new Response(JSON.stringify({ error: 'Could not extract activity ID from URL' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Prepend new post, deduplicate, keep latest MAX_POSTS
    const raw   = await env.LINKEDIN_POSTS_KV.get(KV_KEY);
    const posts = raw ? JSON.parse(raw) : [];
    const updated = [embedUrl, ...posts.filter(p => p !== embedUrl)].slice(0, MAX_POSTS);
    await env.LINKEDIN_POSTS_KV.put(KV_KEY, JSON.stringify(updated));

    return new Response(JSON.stringify({ ok: true, total: updated.length }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response('Method not allowed', { status: 405 });
}
