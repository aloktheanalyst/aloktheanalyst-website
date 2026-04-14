// Cloudflare Pages Function — question attempt/solve tracking + stats API.
//
// POST { questionId, event: 'attempt' | 'solve' }
//   Records an attempt or solve for the authenticated user.
//   Anonymous users (no session) are silently ignored.
//
// GET ?id=questionId
//   Returns stats for a single question.
//   { attemptCount, solveCount, solveRate, showBadge }
//
// GET ?all=1
//   Returns stats for all questions as { [questionId]: { ... } }
//
// Bindings required:
//   DB          → D1 (aloktheanalyst_users)
//   SESSION_KV  → KV namespace

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const MIN_ATTEMPTS  = 10;   // hide badge below this
const MIN_SOLVE_PCT = 0.10; // hide badge below this solve rate

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

function computeBadge(attemptCount, solveCount) {
  if (attemptCount < MIN_ATTEMPTS) return null;
  const rate = solveCount / attemptCount;
  if (rate < MIN_SOLVE_PCT) return null;
  return Math.round(rate * 100);
}

export async function onRequest(context) {
  const { env, request } = context;
  const url = new URL(request.url);

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS });
  }

  // ── POST: record attempt or solve ────────────────────────────────────────
  if (request.method === 'POST') {
    let body;
    try { body = await request.json(); } catch { return json({ ok: false, error: 'Bad JSON' }, 400); }

    const { questionId, event } = body;
    if (!questionId || !['attempt', 'solve'].includes(event)) {
      return json({ ok: false, error: 'Invalid payload' }, 400);
    }

    const googleId = await resolveGoogleId(request, env);
    if (!googleId) return json({ ok: true, skipped: true }); // anonymous — silently skip

    if (event === 'attempt') {
      // Insert on first attempt, increment counter on subsequent runs
      await env.DB.prepare(
        `INSERT INTO question_attempts (question_id, google_id, attempt_count)
         VALUES (?, ?, 1)
         ON CONFLICT(question_id, google_id) DO UPDATE SET
           attempt_count = attempt_count + 1`
      ).bind(questionId, googleId).run();
    } else {
      // solve: upsert — ensure row exists, then mark solved if not already
      await env.DB.prepare(
        `INSERT INTO question_attempts (question_id, google_id, is_solved, solved_at, attempt_count)
         VALUES (?, ?, 1, datetime('now'), 1)
         ON CONFLICT(question_id, google_id) DO UPDATE SET
           is_solved = 1,
           solved_at = COALESCE(solved_at, datetime('now'))`
      ).bind(questionId, googleId).run();
    }

    return json({ ok: true });
  }

  // ── GET: return stats ────────────────────────────────────────────────────
  if (request.method === 'GET') {
    const questionId = url.searchParams.get('id');
    const all        = url.searchParams.get('all');

    if (all) {
      // All questions that have at least MIN_ATTEMPTS attempts
      const { results } = await env.DB.prepare(`
        SELECT
          question_id,
          COUNT(*)       AS attempt_count,
          SUM(is_solved) AS solve_count
        FROM question_attempts
        GROUP BY question_id
        HAVING COUNT(*) >= ?
      `).bind(MIN_ATTEMPTS).all();

      const stats = {};
      for (const row of results) {
        const pct = computeBadge(row.attempt_count, row.solve_count);
        if (pct !== null) {
          stats[row.question_id] = {
            attemptCount: row.attempt_count,
            solveCount:   row.solve_count,
            solveRate:    pct,
          };
        }
      }
      return json(stats);
    }

    if (questionId) {
      const row = await env.DB.prepare(`
        SELECT COUNT(*) AS attempt_count, SUM(is_solved) AS solve_count
        FROM question_attempts
        WHERE question_id = ?
      `).bind(questionId).first();

      const attemptCount = row?.attempt_count || 0;
      const solveCount   = row?.solve_count   || 0;
      const pct          = computeBadge(attemptCount, solveCount);

      return json({
        attemptCount,
        solveCount,
        solveRate:  pct,
        showBadge:  pct !== null,
      });
    }

    return json({ ok: false, error: 'Provide ?id= or ?all=1' }, 400);
  }

  return json({ ok: false, error: 'Method not allowed' }, 405);
}
