// Cloudflare Pages Function — returns view counts for a list of YouTube video IDs.
// Called client-side after RSS parsing: /api/video-stats?ids=id1,id2,...
// Requires YOUTUBE_API_KEY environment variable.

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
      `https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${ids}&key=${env.YOUTUBE_API_KEY}`
    );
    const data = await res.json();

    const result = {};
    for (const item of data.items || []) {
      result[item.id] = parseInt(item.statistics.viewCount || '0', 10);
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
