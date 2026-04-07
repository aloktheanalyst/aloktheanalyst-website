// Cloudflare Pages Function — serves practice arena content on-demand from D1 database.
// Content is never shipped in the HTML — only fetched when a user loads a specific case.
//
// Endpoints:
//   GET /api/practice-content?list=questions       → returns all question metadata (for browse grid)
//   GET /api/practice-content?id=rca_orders        → returns { prompt, solution, factorTree }
//   GET /api/practice-content?dataset=sql_window   → returns SQL/Python dataset for interactive editor
//   GET /api/practice-content?testcases=sql_window  → returns test cases for a question
//
// Required bindings:
//   SESSION_KV → KV namespace (aloktheanalyst_sessions)
//   CONTENT_DB → D1 database (aloktheanalyst_content)

const ALLOWED_ORIGIN = 'https://aloktheanalyst.com';

function corsHeaders(requestOrigin) {
  const origin = (requestOrigin === ALLOWED_ORIGIN || requestOrigin === 'https://www.aloktheanalyst.com')
    ? requestOrigin : ALLOWED_ORIGIN;
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Credentials': 'true',
  };
}

function json(body, status = 200, cors = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...cors },
  });
}

function parseCookies(cookieHeader) {
  const cookies = {};
  cookieHeader.split(';').forEach((c) => {
    const [key, ...val] = c.trim().split('=');
    if (key) cookies[key.trim()] = val.join('=').trim();
  });
  return cookies;
}

export async function onRequestGet(context) {
  const { request, env } = context;
  const origin = request.headers.get('Origin') || '';
  const cors = corsHeaders(origin);

  // CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: cors });
  }

  // ── Origin / Referer check — only allow requests from our site ──
  const referer = request.headers.get('Referer') || '';
  const isAllowedOrigin = origin === ALLOWED_ORIGIN || origin === 'https://www.aloktheanalyst.com' || !origin;
  const isAllowedReferer = !referer || referer.startsWith(ALLOWED_ORIGIN) || referer.startsWith('https://www.aloktheanalyst.com');
  if (!isAllowedOrigin || !isAllowedReferer) {
    return json({ error: 'Forbidden' }, 403, cors);
  }

  // ── Auth check ──
  if (env.SESSION_KV) {
    const cookies = parseCookies(request.headers.get('Cookie') || '');
    const sessionId = cookies.session;
    if (!sessionId) return json({ error: 'Unauthorized' }, 401, cors);
    const sessionData = await env.SESSION_KV.get(`sess:${sessionId}`);
    if (!sessionData) return json({ error: 'Unauthorized' }, 401, cors);
  } else {
    return json({ error: 'Service unavailable' }, 503, cors);
  }

  const url = new URL(request.url);

  // ── Route: list=questions — return all question metadata (no rate limit, lightweight) ──
  if (url.searchParams.get('list') === 'questions') {
    if (!env.CONTENT_DB) return json({ error: 'Database unavailable' }, 503, cors);
    const { results } = await env.CONTENT_DB.prepare(
      'SELECT id, title, topic, difficulty, tag, framework FROM questions ORDER BY sort_order'
    ).all();
    return json(results, 200, cors);
  }

  // ── Rate limiting — prevent bulk scraping (for content endpoints) ──
  if (env.SESSION_KV) {
    const cookies = parseCookies(request.headers.get('Cookie') || '');
    const sessionId = cookies.session;
    const rateKey = `content_rate:${sessionId}`;
    const current = parseInt(await env.SESSION_KV.get(rateKey) || '0', 10);
    if (current > 60) {
      return json({ error: 'Rate limited. Please slow down.' }, 429, cors);
    }
    await env.SESSION_KV.put(rateKey, String(current + 1), { expirationTtl: 3600 });
  }

  // ── Route: dataset=<id> — return SQL or Python dataset for interactive editor ──
  const datasetId = url.searchParams.get('dataset');
  if (datasetId) {
    if (!env.CONTENT_DB) return json({ error: 'Database unavailable' }, 503, cors);
    if (typeof datasetId !== 'string' || datasetId.length > 100) {
      return json({ error: 'Invalid dataset id' }, 400, cors);
    }

    // Try SQL dataset first
    let row = await env.CONTENT_DB.prepare(
      'SELECT question_id, label, question_html, default_query, hints, schema_json, setup_sql FROM sql_datasets WHERE question_id = ?'
    ).bind(datasetId).first();

    if (row) {
      return json({
        type: 'sql',
        label: row.label,
        question: row.question_html,
        defaultQuery: row.default_query,
        hints: JSON.parse(row.hints),
        schema: JSON.parse(row.schema_json),
        setup: { shared: row.setup_sql },
      }, 200, cors);
    }

    // Try Python dataset
    row = await env.CONTENT_DB.prepare(
      'SELECT question_id, label, question_html, default_query, hints, schema_json, setup_code FROM python_datasets WHERE question_id = ?'
    ).bind(datasetId).first();

    if (row) {
      return json({
        type: 'python',
        label: row.label,
        question: row.question_html,
        defaultQuery: row.default_query,
        hints: JSON.parse(row.hints),
        schema: JSON.parse(row.schema_json),
        setupCode: row.setup_code,
      }, 200, cors);
    }

    return json({ error: 'Dataset not found' }, 404, cors);
  }

  // ── Route: testcases=<id> — return test cases for a question ──
  const testId = url.searchParams.get('testcases');
  if (testId) {
    if (!env.CONTENT_DB) return json({ error: 'Database unavailable' }, 503, cors);
    if (typeof testId !== 'string' || testId.length > 100) {
      return json({ error: 'Invalid id' }, 400, cors);
    }

    const { results } = await env.CONTENT_DB.prepare(
      'SELECT name, expected_query, min_match_ratio, fail_msg, max_rows, min_cols, check_function FROM test_cases WHERE question_id = ? ORDER BY test_index'
    ).bind(testId).all();

    if (results.length === 0) {
      return json({ error: 'No test cases found' }, 404, cors);
    }

    // Reconstruct test case objects
    const tests = results.map(r => {
      const test = { name: r.name };
      if (r.expected_query) test.expectedQuery = r.expected_query;
      if (r.min_match_ratio !== null) test.minMatchRatio = r.min_match_ratio;
      if (r.fail_msg) test.failMsg = r.fail_msg;
      if (r.max_rows !== null) test.maxRows = r.max_rows;
      if (r.min_cols !== null) test.minCols = r.min_cols;
      if (r.check_function) test.checkFunction = r.check_function;
      return test;
    });

    return json(tests, 200, cors);
  }

  // ── Route: id=<id> — return prompt, solution, and factorTree ──
  const id = url.searchParams.get('id');
  if (!id || typeof id !== 'string' || id.length > 100) {
    return json({ error: 'Missing or invalid id parameter' }, 400, cors);
  }

  if (!env.CONTENT_DB) return json({ error: 'Database unavailable' }, 503, cors);

  const result = {};

  // Get case prompt
  const promptRow = await env.CONTENT_DB.prepare(
    'SELECT prompt FROM case_prompts WHERE question_id = ?'
  ).bind(id).first();
  if (promptRow) result.prompt = promptRow.prompt;

  // Get solution (puzzle, guesstimate, or casestudy)
  const solutionRow = await env.CONTENT_DB.prepare(
    'SELECT solution FROM solutions WHERE question_id = ?'
  ).bind(id).first();
  if (solutionRow) result.solution = solutionRow.solution;

  // Get factor tree
  const treeRow = await env.CONTENT_DB.prepare(
    'SELECT tree_data FROM factor_trees WHERE question_id = ?'
  ).bind(id).first();
  if (treeRow) {
    try {
      result.factorTree = JSON.parse(treeRow.tree_data);
    } catch {
      result.factorTree = treeRow.tree_data;
    }
  }

  if (Object.keys(result).length === 0) {
    return json({ error: 'Content not found' }, 404, cors);
  }

  return json(result, 200, cors);
}
