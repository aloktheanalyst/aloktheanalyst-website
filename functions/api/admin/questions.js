// Admin API — add / edit / toggle / delete questions in D1.
//
// Auth: Protected by Cloudflare Access (configure on /admin/* and /api/admin/*).
// Access injects Cf-Access-Authenticated-User-Email; we verify it matches env.ADMIN_EMAIL.
//
// Routes (all require Access auth):
//   GET    /api/admin/questions              → list ALL questions (incl. hidden) for admin UI
//   GET    /api/admin/questions?id=<id>      → full question payload (for editing)
//   POST   /api/admin/questions              → create single ({...}) or bulk ([{...},{...}])
//   PATCH  /api/admin/questions?id=<id>      → partial update (e.g. { isVisible: false })
//   DELETE /api/admin/questions?id=<id>      → delete question + all related rows
//
// Required bindings:
//   CONTENT_DB  → D1 (aloktheanalyst_content)
//   ADMIN_EMAIL → env var, the allowed Google-login email

const VALID_TOPICS = new Set(['sql', 'casestudy', 'python', 'puzzles', 'guesstimates', 'bi', 'behavioral']);
const VALID_DIFFICULTY = new Set(['easy', 'medium', 'hard']);
const VALID_TAGS = new Set(['SQL', 'Case Study', 'Python', 'Puzzle', 'Guesstimate', 'BI', 'Behavioral']);
const SOLUTION_TYPES = { casestudy: 'casestudy', puzzles: 'puzzle', guesstimates: 'guesstimate', bi: 'bi', behavioral: 'behavioral' };

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });
}

function checkAuth(request, env) {
  if (!env.ADMIN_EMAIL) return { ok: false, error: 'ADMIN_EMAIL env var not configured', status: 503 };
  const email = request.headers.get('Cf-Access-Authenticated-User-Email');
  if (!email) return { ok: false, error: 'Unauthorized — Cloudflare Access headers missing', status: 401 };
  if (email.toLowerCase() !== env.ADMIN_EMAIL.toLowerCase()) {
    return { ok: false, error: 'Forbidden', status: 403 };
  }
  return { ok: true, email };
}

// ── Validation ────────────────────────────────────────────────────────────
function validateQuestion(q) {
  const errs = [];
  if (!q || typeof q !== 'object') return ['payload must be an object'];
  if (!q.id || typeof q.id !== 'string' || !/^[a-z0-9_]+$/i.test(q.id)) errs.push('id: required, alphanumeric + underscore only');
  if (!q.title || typeof q.title !== 'string') errs.push('title: required string');
  if (!VALID_TOPICS.has(q.topic)) errs.push(`topic: must be one of ${[...VALID_TOPICS].join('|')}`);
  if (!VALID_DIFFICULTY.has(q.difficulty)) errs.push('difficulty: must be easy|medium|hard');
  if (!VALID_TAGS.has(q.tag)) errs.push(`tag: must be one of ${[...VALID_TAGS].join('|')}`);
  if (!q.prompt || typeof q.prompt !== 'string') errs.push('prompt: required string (AI coaching prompt)');

  if (q.topic === 'sql') {
    if (!q.sqlDataset) errs.push('sqlDataset: required for topic=sql');
    else {
      if (!q.sqlDataset.label) errs.push('sqlDataset.label: required');
      if (!q.sqlDataset.question) errs.push('sqlDataset.question: required (HTML)');
      if (!q.sqlDataset.setup) errs.push('sqlDataset.setup: required (CREATE/INSERT SQL)');
    }
    if (!Array.isArray(q.testCases) || q.testCases.length < 2) errs.push('testCases: required array, minimum 2 tests');
  }
  if (q.topic === 'python') {
    if (!q.pythonDataset) errs.push('pythonDataset: required for topic=python');
    else {
      if (!q.pythonDataset.label) errs.push('pythonDataset.label: required');
      if (!q.pythonDataset.question) errs.push('pythonDataset.question: required (HTML)');
      if (!q.pythonDataset.setupCode) errs.push('pythonDataset.setupCode: required');
    }
    if (!Array.isArray(q.testCases) || q.testCases.length < 2) errs.push('testCases: required array, minimum 2 tests');
  }
  if (['casestudy', 'puzzles', 'guesstimates', 'bi', 'behavioral'].includes(q.topic)) {
    if (!q.solution || typeof q.solution !== 'string') errs.push('solution: required string for this topic');
  }

  if (Array.isArray(q.testCases)) {
    q.testCases.forEach((t, i) => {
      if (!t.name) errs.push(`testCases[${i}].name: required`);
      const hasCheck = t.expectedQuery || t.checkFunction || t.assertion || t.maxRows !== undefined || t.minRows !== undefined || t.minCols !== undefined;
      if (!hasCheck) errs.push(`testCases[${i}]: must have at least one of expectedQuery / checkFunction / assertion / maxRows / minRows / minCols`);
    });
  }
  return errs;
}

// ── Build D1 batch statements for inserting a full question ───────────────
function buildInsertStatements(db, q) {
  const stmts = [];
  const sortOrder = typeof q.sortOrder === 'number' ? q.sortOrder : 9999;
  const isVisible = q.isVisible === false ? 0 : 1;

  stmts.push(db.prepare(
    'INSERT INTO questions (id, title, topic, difficulty, tag, framework, sort_order, is_visible) VALUES (?,?,?,?,?,?,?,?)'
  ).bind(q.id, q.title, q.topic, q.difficulty, q.tag, q.framework || null, sortOrder, isVisible));

  stmts.push(db.prepare('INSERT INTO case_prompts (question_id, prompt) VALUES (?,?)').bind(q.id, q.prompt));

  if (q.solution) {
    const solType = SOLUTION_TYPES[q.topic] || q.topic;
    stmts.push(db.prepare('INSERT INTO solutions (question_id, solution_type, solution) VALUES (?,?,?)').bind(q.id, solType, q.solution));
  }

  if (q.sqlDataset) {
    const d = q.sqlDataset;
    stmts.push(db.prepare(
      'INSERT INTO sql_datasets (question_id, label, question_html, default_query, hints, schema_json, setup_sql, parts_json) VALUES (?,?,?,?,?,?,?,?)'
    ).bind(
      q.id, d.label, d.question,
      d.defaultQuery || '-- Write your SQL here\n',
      JSON.stringify(d.hints || []),
      JSON.stringify(d.schema || []),
      d.setup,
      d.parts ? JSON.stringify(d.parts) : null
    ));
  }

  if (q.pythonDataset) {
    const d = q.pythonDataset;
    stmts.push(db.prepare(
      'INSERT INTO python_datasets (question_id, label, question_html, default_query, hints, schema_json, setup_code, parts_json) VALUES (?,?,?,?,?,?,?,?)'
    ).bind(
      q.id, d.label, d.question,
      d.defaultQuery || '# Write your Python here\n',
      JSON.stringify(d.hints || []),
      JSON.stringify(d.schema || []),
      d.setupCode,
      d.parts ? JSON.stringify(d.parts) : null
    ));
  }

  if (Array.isArray(q.testCases)) {
    q.testCases.forEach((t, i) => {
      stmts.push(db.prepare(
        'INSERT INTO test_cases (question_id, test_index, name, expected_query, min_match_ratio, fail_msg, max_rows, min_rows, min_cols, check_function, assertion, part) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)'
      ).bind(
        q.id, i, t.name,
        t.expectedQuery ?? null,
        t.minMatchRatio ?? null,
        t.failMsg ?? null,
        t.maxRows ?? null,
        t.minRows ?? null,
        t.minCols ?? null,
        t.checkFunction ?? null,
        t.assertion ?? null,
        t.part ?? 1
      ));
    });
  }

  if (q.factorTree) {
    const treeStr = typeof q.factorTree === 'string' ? q.factorTree : JSON.stringify(q.factorTree);
    stmts.push(db.prepare('INSERT INTO factor_trees (question_id, tree_data) VALUES (?,?)').bind(q.id, treeStr));
  }

  return stmts;
}

function buildDeleteStatements(db, id) {
  return [
    db.prepare('DELETE FROM test_cases WHERE question_id = ?').bind(id),
    db.prepare('DELETE FROM sql_datasets WHERE question_id = ?').bind(id),
    db.prepare('DELETE FROM python_datasets WHERE question_id = ?').bind(id),
    db.prepare('DELETE FROM factor_trees WHERE question_id = ?').bind(id),
    db.prepare('DELETE FROM solutions WHERE question_id = ?').bind(id),
    db.prepare('DELETE FROM case_prompts WHERE question_id = ?').bind(id),
    db.prepare('DELETE FROM questions WHERE id = ?').bind(id),
  ];
}

// ── Handlers ──────────────────────────────────────────────────────────────
export async function onRequestGet(context) {
  const { request, env } = context;
  const auth = checkAuth(request, env);
  if (!auth.ok) return json({ error: auth.error }, auth.status);
  if (!env.CONTENT_DB) return json({ error: 'Database unavailable' }, 503);

  const url = new URL(request.url);
  const id = url.searchParams.get('id');

  if (!id) {
    const { results } = await env.CONTENT_DB.prepare(
      'SELECT id, title, topic, difficulty, tag, framework, sort_order, is_visible, created_at FROM questions ORDER BY sort_order, id'
    ).all();
    return json({ questions: results });
  }

  // Full payload for single question
  const q = await env.CONTENT_DB.prepare('SELECT * FROM questions WHERE id = ?').bind(id).first();
  if (!q) return json({ error: 'Not found' }, 404);

  const [prompt, solution, sqlDs, pyDs, tests, tree] = await Promise.all([
    env.CONTENT_DB.prepare('SELECT prompt FROM case_prompts WHERE question_id = ?').bind(id).first(),
    env.CONTENT_DB.prepare('SELECT solution_type, solution FROM solutions WHERE question_id = ?').bind(id).first(),
    env.CONTENT_DB.prepare('SELECT * FROM sql_datasets WHERE question_id = ?').bind(id).first(),
    env.CONTENT_DB.prepare('SELECT * FROM python_datasets WHERE question_id = ?').bind(id).first(),
    env.CONTENT_DB.prepare('SELECT * FROM test_cases WHERE question_id = ? ORDER BY test_index').bind(id).all(),
    env.CONTENT_DB.prepare('SELECT tree_data FROM factor_trees WHERE question_id = ?').bind(id).first(),
  ]);

  return json({
    question: q,
    prompt: prompt?.prompt || null,
    solution: solution?.solution || null,
    sqlDataset: sqlDs || null,
    pythonDataset: pyDs || null,
    testCases: tests.results || [],
    factorTree: tree?.tree_data || null,
  });
}

export async function onRequestPost(context) {
  const { request, env } = context;
  const auth = checkAuth(request, env);
  if (!auth.ok) return json({ error: auth.error }, auth.status);
  if (!env.CONTENT_DB) return json({ error: 'Database unavailable' }, 503);

  let body;
  try { body = await request.json(); } catch { return json({ error: 'Invalid JSON body' }, 400); }

  const items = Array.isArray(body) ? body : [body];
  if (items.length === 0) return json({ error: 'Empty payload' }, 400);
  if (items.length > 100) return json({ error: 'Bulk limit is 100 questions per request' }, 400);

  // Validate all first — fail entire batch if any is invalid
  const validationErrors = [];
  items.forEach((q, i) => {
    const errs = validateQuestion(q);
    if (errs.length) validationErrors.push({ index: i, id: q?.id, errors: errs });
  });
  if (validationErrors.length) return json({ error: 'Validation failed', details: validationErrors }, 400);

  // Check for ID conflicts
  const ids = items.map(q => q.id);
  const placeholders = ids.map(() => '?').join(',');
  const { results: existing } = await env.CONTENT_DB.prepare(
    `SELECT id FROM questions WHERE id IN (${placeholders})`
  ).bind(...ids).all();
  if (existing.length) {
    return json({ error: 'Duplicate IDs', conflicts: existing.map(r => r.id) }, 409);
  }

  // Build all statements, run as one batch
  const allStmts = items.flatMap(q => buildInsertStatements(env.CONTENT_DB, q));
  try {
    await env.CONTENT_DB.batch(allStmts);
  } catch (err) {
    return json({ error: 'Insert failed', detail: String(err?.message || err) }, 500);
  }

  return json({ ok: true, inserted: items.length, ids });
}

export async function onRequestPatch(context) {
  const { request, env } = context;
  const auth = checkAuth(request, env);
  if (!auth.ok) return json({ error: auth.error }, auth.status);
  if (!env.CONTENT_DB) return json({ error: 'Database unavailable' }, 503);

  const url = new URL(request.url);
  const id = url.searchParams.get('id');
  if (!id) return json({ error: 'Missing id query param' }, 400);

  let body;
  try { body = await request.json(); } catch { return json({ error: 'Invalid JSON body' }, 400); }

  const existing = await env.CONTENT_DB.prepare('SELECT id FROM questions WHERE id = ?').bind(id).first();
  if (!existing) return json({ error: 'Not found' }, 404);

  const updates = [];
  const params = [];
  const allowed = {
    title: 'title', difficulty: 'difficulty', tag: 'tag', framework: 'framework',
    sortOrder: 'sort_order', isVisible: 'is_visible', topic: 'topic',
  };
  for (const [key, col] of Object.entries(allowed)) {
    if (key in body) {
      let v = body[key];
      if (key === 'isVisible') v = v ? 1 : 0;
      if (key === 'topic' && !VALID_TOPICS.has(v)) return json({ error: `Invalid topic: ${v}` }, 400);
      if (key === 'difficulty' && !VALID_DIFFICULTY.has(v)) return json({ error: `Invalid difficulty: ${v}` }, 400);
      if (key === 'tag' && !VALID_TAGS.has(v)) return json({ error: `Invalid tag: ${v}` }, 400);
      updates.push(`${col} = ?`);
      params.push(v);
    }
  }
  if (updates.length === 0) return json({ error: 'No updatable fields provided' }, 400);

  params.push(id);
  await env.CONTENT_DB.prepare(`UPDATE questions SET ${updates.join(', ')} WHERE id = ?`).bind(...params).run();

  if (typeof body.prompt === 'string') {
    await env.CONTENT_DB.prepare(
      'INSERT INTO case_prompts (question_id, prompt) VALUES (?,?) ON CONFLICT(question_id) DO UPDATE SET prompt = excluded.prompt'
    ).bind(id, body.prompt).run();
  }
  if (typeof body.solution === 'string') {
    const solType = SOLUTION_TYPES[body.topic] || null;
    const existingSol = await env.CONTENT_DB.prepare('SELECT solution_type FROM solutions WHERE question_id = ?').bind(id).first();
    const type = solType || existingSol?.solution_type || 'casestudy';
    await env.CONTENT_DB.prepare(
      'INSERT INTO solutions (question_id, solution_type, solution) VALUES (?,?,?) ON CONFLICT(question_id) DO UPDATE SET solution = excluded.solution'
    ).bind(id, type, body.solution).run();
  }

  return json({ ok: true, id });
}

export async function onRequestDelete(context) {
  const { request, env } = context;
  const auth = checkAuth(request, env);
  if (!auth.ok) return json({ error: auth.error }, auth.status);
  if (!env.CONTENT_DB) return json({ error: 'Database unavailable' }, 503);

  const url = new URL(request.url);
  const id = url.searchParams.get('id');
  if (!id) return json({ error: 'Missing id query param' }, 400);

  const existing = await env.CONTENT_DB.prepare('SELECT id FROM questions WHERE id = ?').bind(id).first();
  if (!existing) return json({ error: 'Not found' }, 404);

  await env.CONTENT_DB.batch(buildDeleteStatements(env.CONTENT_DB, id));
  return json({ ok: true, deleted: id });
}
