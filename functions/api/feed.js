// Cloudflare Pages Function — proxies YouTube RSS server-side to avoid CORS issues.
// Deployed automatically by Cloudflare Pages at /api/feed
export async function onRequest() {
  const channelId = 'UCn4jxGfKSB5JR3aas48iI1Q';
  const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;

  try {
    const res = await fetch(rssUrl);
    const xml = await res.text();
    return new Response(xml, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=1800', // cache 30 min at edge
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (err) {
    return new Response('Feed unavailable', { status: 502 });
  }
}
