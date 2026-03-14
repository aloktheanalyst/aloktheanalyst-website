// Cloudflare Pages Function — returns view counts + isShort flag for a list of YouTube video IDs.
// Called client-side after RSS parsing: /api/video-stats?ids=id1,id2,...
// Requires YOUTUBE_API_KEY environment variable.
// isShort is determined server-side by duration (≤60s) — eliminates N oEmbed browser requests.

function parseDuration(iso) {
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) return 0;
  return (parseInt(m[1] || 0) * 3600) + (parseInt(m[2] || 0) * 60) + parseInt(m[3] || 0);
}

export async function onRequest(context) {
  const { env, request } = context;
  const ids = new URL(request.url).searchParams.get('ids');

  if (!ids || !env.YOUTUBE_API_KEY) {
    return new Response(JSON.stringify({}), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }

  try {
    const res  = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=statistics,contentDetails&id=${ids}&key=${env.YOUTUBE_API_KEY}`
    );
    const data = await res.json();

    const result = {};
    for (const item of data.items || []) {
      const duration = parseDuration(item.contentDetails?.duration || 'PT0S');
      result[item.id] = {
        views:   parseInt(item.statistics.viewCount || '0', 10),
        isShort: duration > 0 && duration <= 300,
      };
    }

    return new Response(JSON.stringify(result), {
      headers: {
        'Content-Type':                'application/json',
        'Cache-Control':               'public, max-age=3600',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({}), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }
}
