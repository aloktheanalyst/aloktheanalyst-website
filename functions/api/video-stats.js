// Cloudflare Pages Function — returns view counts + isShort flag for a list of YouTube video IDs.
// Called client-side after RSS parsing: /api/video-stats?ids=id1,id2,...
// Requires YOUTUBE_API_KEY environment variable.
// Shorts detection: oEmbed portrait check (same logic as original, but run server-side to
// avoid browser rate-limiting). Results are edge-cached for 1 hour.

function parseDuration(iso) {
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) return 0;
  return (parseInt(m[1] || 0) * 3600) + (parseInt(m[2] || 0) * 60) + parseInt(m[3] || 0);
}

// oEmbed portrait check — the original reliable method, now done server-side.
// Returns true if the video is a Short (portrait oEmbed response), false otherwise.
async function isShortViaOembed(id) {
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 4000);
    const r = await fetch(
      `https://www.youtube.com/oembed?url=https%3A%2F%2Fwww.youtube.com%2Fshorts%2F${id}&format=json`,
      { signal: ctrl.signal }
    );
    clearTimeout(timer);
    if (!r.ok) return false;
    const data = await r.json();
    return data.height > data.width;
  } catch {
    return false;
  }
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
    const idList = ids.split(',').filter(Boolean);

    // Run YouTube API call and all oEmbed checks in parallel.
    const [ytRes, ...shortFlags] = await Promise.all([
      fetch(`https://www.googleapis.com/youtube/v3/videos?part=statistics,contentDetails&id=${ids}&key=${env.YOUTUBE_API_KEY}`),
      ...idList.map(id => isShortViaOembed(id)),
    ]);

    const data = await ytRes.json();
    const shortMap = Object.fromEntries(idList.map((id, i) => [id, shortFlags[i]]));

    const result = {};
    for (const item of data.items || []) {
      const duration = parseDuration(item.contentDetails?.duration || 'PT0S');
      result[item.id] = {
        views:   parseInt(item.statistics.viewCount || '0', 10),
        // oEmbed portrait = Short; fall back to duration ≤300s if oEmbed inconclusive
        isShort: shortMap[item.id] || (duration > 0 && duration <= 300),
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
