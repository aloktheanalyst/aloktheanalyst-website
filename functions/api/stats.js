// Cloudflare Pages Function — returns live social stats for the hero section.
// Requires YOUTUBE_API_KEY and LINKEDIN_FOLLOWERS environment variables
// (set in Cloudflare Pages → Settings → Variables).
// Caches at the edge for 1 hour to stay within YouTube API quotas.

export async function onRequest(context) {
  const { env } = context;
  const CHANNEL_ID = 'UCn4jxGfKSB5JR3aas48iI1Q';
  const linkedinFollowers = parseInt(env.LINKEDIN_FOLLOWERS || '0', 10);

  try {
    if (!env.YOUTUBE_API_KEY) throw new Error('YOUTUBE_API_KEY not configured');

    const ytRes = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${CHANNEL_ID}&key=${env.YOUTUBE_API_KEY}`
    );
    if (!ytRes.ok) throw new Error(`YouTube API returned ${ytRes.status}`);

    const ytData = await ytRes.json();
    const stats = ytData.items?.[0]?.statistics;
    if (!stats) throw new Error('No channel statistics in YouTube response');

    const youtubeSubscribers = parseInt(stats.subscriberCount || '0', 10);
    const videoCount         = parseInt(stats.videoCount       || '0', 10);

    return new Response(JSON.stringify({
      youtubeSubscribers,
      videoCount,
      linkedinFollowers,
      totalFollowers: youtubeSubscribers + linkedinFollowers,
    }), {
      headers: {
        'Content-Type':                'application/json',
        'Cache-Control':               'public, max-age=3600',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: {
        'Content-Type':                'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
}
