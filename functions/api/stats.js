// Cloudflare Pages Function — returns live social stats for the hero section.
// Requires YOUTUBE_API_KEY and LINKEDIN_FOLLOWERS environment variables
// (set in Cloudflare Pages → Settings → Variables).
// Caches at the edge for 1 hour to stay within YouTube API quotas.

// Parse ISO 8601 duration (e.g. PT12M30S) into total seconds.
function parseDuration(iso) {
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) return 0;
  return (parseInt(m[1] || 0) * 3600) + (parseInt(m[2] || 0) * 60) + parseInt(m[3] || 0);
}

export async function onRequest(context) {
  const { env } = context;
  const CHANNEL_ID = 'UCn4jxGfKSB5JR3aas48iI1Q';
  const KEY = env.YOUTUBE_API_KEY;
  const linkedinFollowers = parseInt(env.LINKEDIN_FOLLOWERS || '0', 10);

  try {
    if (!KEY) throw new Error('YOUTUBE_API_KEY not configured');

    // 1. Fetch channel statistics + uploads playlist ID.
    const chRes = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=statistics,contentDetails&id=${CHANNEL_ID}&key=${KEY}`
    );
    if (!chRes.ok) throw new Error(`YouTube API returned ${chRes.status}`);
    const chData = await chRes.json();
    const channel = chData.items?.[0];
    if (!channel) throw new Error('Channel not found');

    const youtubeSubscribers = parseInt(channel.statistics.subscriberCount || '0', 10);
    const videoCount         = parseInt(channel.statistics.videoCount       || '0', 10);
    const uploadsPlaylistId  = channel.contentDetails.relatedPlaylists.uploads;

    // 2. Page through uploads playlist to collect all video IDs.
    const videoIds = [];
    let pageToken = '';
    do {
      const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=contentDetails&playlistId=${uploadsPlaylistId}&maxResults=50&key=${KEY}${pageToken ? '&pageToken=' + pageToken : ''}`;
      const res  = await fetch(url);
      const data = await res.json();
      for (const item of data.items || []) {
        videoIds.push(item.contentDetails.videoId);
      }
      pageToken = data.nextPageToken || '';
    } while (pageToken);

    // 3. Fetch durations in batches of 50 and sum them up.
    let totalSeconds = 0;
    for (let i = 0; i < videoIds.length; i += 50) {
      const batch = videoIds.slice(i, i + 50).join(',');
      const res   = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${batch}&key=${KEY}`
      );
      const data  = await res.json();
      for (const video of data.items || []) {
        totalSeconds += parseDuration(video.contentDetails.duration);
      }
    }

    const contentHours = Math.floor(totalSeconds / 3600);

    return new Response(JSON.stringify({
      youtubeSubscribers,
      videoCount,
      linkedinFollowers,
      totalFollowers: youtubeSubscribers + linkedinFollowers,
      contentHours,
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
