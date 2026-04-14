// Cloudflare Pages Function — weekly challenge endpoint.
//
// Week = Monday 00:00 UTC → Sunday 23:59:59 UTC.
// week_id = the Sunday end-date in YYYY-MM-DD format.
//
// GET  /api/weekly-challenge
//   Returns current challenge + user completion status + streak.
//
// Bindings required:
//   DB          → D1 (aloktheanalyst_users)   — question_attempts, weekly_challenges
//   CONTENT_DB  → D1 (aloktheanalyst_content) — questions metadata
//   SESSION_KV  → KV namespace

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS },
  });
}

function parseCookies(header) {
  return Object.fromEntries(
    header.split(';').map(c => c.trim().split('=').map(decodeURIComponent))
  );
}

async function resolveGoogleId(request, env) {
  if (!env.SESSION_KV) return null;
  try {
    const cookies = parseCookies(request.headers.get('Cookie') || '');
    if (!cookies.session) return null;
    const raw = await env.SESSION_KV.get(`sess:${cookies.session}`);
    if (!raw) return null;
    return JSON.parse(raw).google_id || null;
  } catch { return null; }
}

// Returns YYYY-MM-DD of the Sunday that ends the current week
function getWeekId() {
  const now = new Date();
  const day = now.getUTCDay(); // 0=Sun
  const daysUntilSunday = day === 0 ? 0 : 7 - day;
  const sunday = new Date(now.getTime() + daysUntilSunday * 86400000);
  return sunday.toISOString().slice(0, 10);
}

// Monday of the week (6 days before Sunday)
function getWeekStart(weekId) {
  const d = new Date(weekId + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() - 6);
  return d.toISOString().slice(0, 10) + ' 00:00:00';
}

function getWeekEnd(weekId) {
  return weekId + ' 23:59:59';
}

// Previous week_id (7 days earlier)
function prevWeekId(weekId) {
  const d = new Date(weekId + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() - 7);
  return d.toISOString().slice(0, 10);
}

// Compute consecutive streak from a sorted-desc array of completed week_ids
function computeStreak(completedWeeks, currentWeekId) {
  if (!completedWeeks.length) return 0;
  let streak = 0;
  let expected = currentWeekId;
  for (const wid of completedWeeks) {
    if (wid === expected) {
      streak++;
      expected = prevWeekId(expected);
    } else {
      break;
    }
  }
  return streak;
}

async function getCurrentChallenge(env, weekId) {
  // 1. Manual entry — find the nearest challenge whose end date is today or in the future
  //    (robust against timezone drift in week_id computation)
  const manual = await env.DB.prepare(
    `SELECT week_id, question_id FROM weekly_challenges
     WHERE week_id >= date('now', '-6 days')
     ORDER BY week_id ASC
     LIMIT 1`
  ).first();
  if (manual) return manual.question_id;

  // 2. Auto-rotate: all hard SQL questions from content DB, ranked by attempts
  //    excluding questions used in the last 4 weeks
  const recentRows = await env.DB.prepare(
    `SELECT question_id FROM weekly_challenges
     WHERE week_id >= date(?, '-28 days')`
  ).bind(weekId).all();
  const recentIds = new Set(recentRows.results.map(r => r.question_id));

  // Get all hard SQL question IDs from content DB
  const { results: hardSql } = await env.CONTENT_DB.prepare(
    `SELECT id FROM questions WHERE topic = 'sql' AND difficulty = 'hard'`
  ).all();

  if (!hardSql.length) return null;

  const candidates = hardSql.map(r => r.id).filter(id => !recentIds.has(id));
  if (!candidates.length) return hardSql[0].id; // fallback: ignore recency filter

  // Get attempt counts for candidates
  const placeholders = candidates.map(() => '?').join(',');
  const { results: attempts } = await env.DB.prepare(
    `SELECT question_id, SUM(attempt_count) AS total
     FROM question_attempts
     WHERE question_id IN (${placeholders})
     GROUP BY question_id`
  ).bind(...candidates).all();

  const attemptMap = Object.fromEntries(attempts.map(r => [r.question_id, r.total || 0]));

  // Sort: highest attempts first, zero-attempt questions last
  candidates.sort((a, b) => (attemptMap[b] || 0) - (attemptMap[a] || 0));
  return candidates[0];
}

export async function onRequest(context) {
  const { env, request } = context;

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS });
  }

  if (request.method !== 'GET') {
    return json({ ok: false, error: 'Method not allowed' }, 405);
  }

  const weekId   = getWeekId();
  const weekStart = getWeekStart(weekId);
  const weekEnd   = getWeekEnd(weekId);

  const [questionId, googleId] = await Promise.all([
    getCurrentChallenge(env, weekId),
    resolveGoogleId(request, env),
  ]);

  if (!questionId) {
    return json({ ok: false, error: 'No challenge set for this week' }, 404);
  }

  // Question metadata
  const meta = await env.CONTENT_DB.prepare(
    'SELECT title, difficulty, tag FROM questions WHERE id = ?'
  ).bind(questionId).first();

  // How many distinct users solved the challenge this week
  const completionRow = await env.DB.prepare(
    `SELECT COUNT(DISTINCT google_id) AS count
     FROM question_attempts
     WHERE question_id = ?
       AND is_solved = 1
       AND solved_at >= ?
       AND solved_at <= ?`
  ).bind(questionId, weekStart, weekEnd).first();

  let userCompleted = false;
  let streak = 0;

  if (googleId) {
    // Did this user solve it this week?
    const userRow = await env.DB.prepare(
      `SELECT 1 FROM question_attempts
       WHERE question_id = ? AND google_id = ?
         AND is_solved = 1
         AND solved_at >= ? AND solved_at <= ?`
    ).bind(questionId, googleId, weekStart, weekEnd).first();
    userCompleted = !!userRow;

    // Streak: weeks where user solved that week's challenge within its window
    const { results: streakRows } = await env.DB.prepare(
      `SELECT wc.week_id
       FROM weekly_challenges wc
       JOIN question_attempts qa ON qa.question_id = wc.question_id
       WHERE qa.google_id = ?
         AND qa.is_solved = 1
         AND qa.solved_at >= date(wc.week_id, '-6 days') || ' 00:00:00'
         AND qa.solved_at <= wc.week_id || ' 23:59:59'
       ORDER BY wc.week_id DESC`
    ).bind(googleId).all();

    streak = computeStreak(streakRows.map(r => r.week_id), weekId);
  }

  return json({
    weekId,
    questionId,
    title:           meta?.title      || questionId,
    difficulty:      meta?.difficulty || 'hard',
    tag:             meta?.tag        || 'SQL',
    endsAt:          weekEnd,
    completionCount: completionRow?.count || 0,
    userCompleted,
    streak,
  });
}
