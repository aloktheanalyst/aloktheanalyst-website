Add interview questions from attached documents to the practice website.

The user has attached one or more documents (PDFs, text files, images) containing interview questions. Parse them and add to the website.

$ARGUMENTS

## Architecture Overview

Data lives in TWO places that must BOTH be updated:

1. **`practice.html`** (client-side, inline) — PROMPTS, SQL_DATASETS, PYTHON_DATASETS, TEST_CASES
2. **Cloudflare D1 database** (server-side) — questions, case_prompts, solutions, sql_datasets, python_datasets, test_cases

Additionally:
3. **`frameworks/_registry.yaml`** — framework mapping for case study questions (single source of truth)

**`functions/api/practice-content.js`** is the API layer — do NOT edit it. It reads from D1.

## Instructions

Follow these steps exactly. Do NOT explore the codebase — all structure info is here and in CLAUDE.md.

### Step 1: Parse the documents

Read each attached document and extract:
- **Company name** (from filename or document content)
- **Individual questions** with their:
  - Category: SQL, case study, python, puzzle, or guesstimate
  - Difficulty: easy, medium, or hard
  - Question text
  - Any sample tables/data provided
  - Any solution/answer provided

### Step 2: Categorize and plan

For each question, determine what data is needed:

| Type | practice.html | D1 tables | _registry.yaml |
|------|--------------|-----------|----------------|
| **SQL** | PROMPTS + SQL_DATASETS + TEST_CASES | questions + case_prompts + sql_datasets + test_cases | — |
| **Python** | PROMPTS + PYTHON_DATASETS + TEST_CASES | questions + case_prompts + python_datasets + test_cases | — |
| **Case study** | PROMPTS | questions + case_prompts + solutions | ✅ Add framework |
| **Puzzle** | PROMPTS | questions + case_prompts + solutions | — |
| **Guesstimate** | PROMPTS | questions + case_prompts + solutions | — |

**Combining questions**: If a document has multiple small SQL questions sharing the same schema/tables, combine 2-3 into a single multi-part question. This is better for practice.

**Difficulty rules**:
- easy: Single concept (basic WHERE, simple GROUP BY, straightforward estimation)
- medium: 2-3 concepts combined (JOINs + aggregation, multi-step analysis)
- hard: Advanced patterns (window functions, CTEs, cumulative logic, multi-framework analysis)

### Step 3: Generate IDs

Use the naming convention:
- `sql_{company}_{topic}` for SQL (e.g., `sql_pelago_customers`)
- `cs_{company}_{topic}` for case studies (e.g., `cs_pelago_paid`)
- `python_{company}_{topic}` for Python
- `pz_{shortname}` for puzzles
- `ge_{shortname}` for guesstimates

**Verify IDs are unique** — grep for the ID in both `practice.html` and query D1 before inserting.

### Step 4: Determine framework for case study questions

**This is MANDATORY for all case study questions** (cs_, rca_, fw_, bs_, bj_, me_, ms_, be_, cf_, fl_, ma_, pd_, pf_, pr_ prefixes).

The single source of truth is `frameworks/_registry.yaml`. Read it first.

Choose the appropriate framework code from this list:

| Code | Display Name Examples |
|------|----------------------|
| `rca` | Root Cause Analysis, Root Cause + Solutions |
| `metric-design` | AARRR / North Star Metric, Dashboard Design, KPI Design |
| `product-analytics` | Product Analytics, Impact Assessment, Operations Optimization |
| `market-entry` | Market Entry Framework |
| `profitability` | Profitability Analysis, Break-Even Analysis, Cost Structure |
| `funnel-analysis` | Funnel Analysis, Conversion Optimization |
| `ab-testing` | A/B Testing & Statistical Power |

For the `framework` field in the PROMPTS entry, use a **specific display name** that describes the question's approach (not the generic code). Look at existing PROMPTS entries for examples.

### Step 5: Build the data

#### For SQL questions:

1. **PROMPTS entry** (practice.html):
```javascript
{ id: 'sql_company_topic', title: 'Company: Question Title', topic: 'sql', difficulty: 'medium', tag: 'SQL' },
```

2. **SQL_DATASETS entry** (practice.html):
```javascript
sql_company_topic: {
  label: 'Title',
  question: '<em>Asked at Company.</em><br><br>question HTML...',
  defaultQuery: '-- Write your SQL here\n',
  hints: ['hint1', 'hint2', 'hint3'],
  schema: [{ name: 'table_name', columns: [{ name: 'col', type: 'TYPE' }] }],
  setup: { shared: `CREATE TABLE...; INSERT INTO...;` }
},
```

3. **TEST_CASES entry** (practice.html) — **MANDATORY for every SQL question**:
```javascript
sql_company_topic: [
  {
    name: 'Test description for sub-question 1',
    expectedQuery: `SELECT ... (reference query that produces correct answer)`,
    minMatchRatio: 0.4,
    failMsg: 'Hint about what SQL technique to use'
  },
  // One test per sub-question. For output-pattern tests, use check() instead:
  {
    name: 'Test description',
    check(out) {
      if (!out) return { pass: false, msg: 'No output' };
      // Validate output patterns
      return { pass: true, msg: 'Success message' };
    }
  }
],
```

**Test case rules for SQL:**
- Create one test per sub-question in the problem
- Prefer `expectedQuery` tests — write a reference SQL query that returns the correct answer. The test runner extracts key numeric values and checks if they appear in the user's output
- Use `check(out)` function tests for pattern-matching (e.g., checking specific names appear, category labels exist, row counts)
- Set `minMatchRatio` between 0.2–0.5 (lower = more lenient). Use 0.3 for complex queries with many values
- Add `maxRows`, `minCols` constraints when relevant
- `failMsg` should hint at the technique needed, not give the answer

4. **D1 inserts** — use the Cloudflare MCP tool `d1_database_query` with database_id `bcba85e7-9594-4182-ad42-66bb989102a0`:

```sql
-- questions table
INSERT OR IGNORE INTO questions (id, title, topic, difficulty, tag, framework, sort_order)
VALUES ('sql_company_topic', 'Company: Question Title', 'sql', 'medium', 'SQL', NULL, (SELECT COALESCE(MAX(sort_order),0)+1 FROM questions));

-- case_prompts table (AI coaching prompt)
INSERT OR IGNORE INTO case_prompts (question_id, prompt)
VALUES ('sql_company_topic', 'You are interviewing a candidate for a data analyst role at Company. They must write SQL to... Guide them through...');

-- sql_datasets table
INSERT OR IGNORE INTO sql_datasets (question_id, label, question_html, default_query, hints, schema_json, setup_sql)
VALUES ('sql_company_topic', 'Title', '<em>Asked at Company.</em><br><br>...', '-- Write your SQL here\n',
  '["hint1", "hint2", "hint3"]',
  '[{"name":"table","columns":[{"name":"col","type":"TYPE"}]}]',
  'CREATE TABLE...; INSERT INTO...;');

-- test_cases table (one row per test)
INSERT OR IGNORE INTO test_cases (question_id, test_index, name, expected_query, min_match_ratio, fail_msg, max_rows, min_cols, check_function)
VALUES ('sql_company_topic', 0, 'Test name', 'SELECT ...', 0.4, 'Hint message', NULL, NULL, NULL);
```

#### For Python questions:

Same as SQL but use `PYTHON_DATASETS` / `python_datasets` table, and test cases use `assertion` or `check`:
```javascript
python_company_topic: [
  {
    name: 'Test description',
    assertion: `
import pandas as pd
assert condition, "error message"
`,
    msg: 'Hint message'
  }
],
```

D1 test_cases for Python: set `check_function` to the assertion code, leave `expected_query` NULL.

#### For case study questions:

1. **PROMPTS entry** with `framework` field:
```javascript
{ id: 'cs_company_topic', title: 'Question Title', topic: 'casestudy', difficulty: 'medium', tag: 'Case Study', framework: 'Specific Framework Name' },
```

2. **_registry.yaml** — add under the appropriate section:
```yaml
  cs_company_topic:
    framework: product-analytics    # one of: rca, metric-design, product-analytics, market-entry, profitability, funnel-analysis, ab-testing
```

3. **D1 inserts**:
```sql
-- questions table (with framework)
INSERT OR IGNORE INTO questions (id, title, topic, difficulty, tag, framework, sort_order)
VALUES ('cs_company_topic', 'Question Title', 'casestudy', 'medium', 'Case Study', 'Specific Framework Name', (SELECT COALESCE(MAX(sort_order),0)+1 FROM questions));

-- case_prompts
INSERT OR IGNORE INTO case_prompts (question_id, prompt)
VALUES ('cs_company_topic', 'You are interviewing a candidate... Full coaching prompt...');

-- solutions
INSERT OR IGNORE INTO solutions (question_id, solution_type, solution)
VALUES ('cs_company_topic', 'casestudy', '**🎯 Framework Used: ...**\n\nFull model solution...');
```

#### For puzzles and guesstimates:

Same pattern — PROMPTS entry + D1 inserts (questions + case_prompts + solutions). No test cases needed. Solution type is `'puzzle'` or `'guesstimate'`.

### Step 6: Insert into practice.html

Use the Edit tool with these exact insertion anchors:

| What | Insert before this text |
|------|------------------------|
| SQL PROMPTS entries | `{ id: 'ab_test',` |
| Case study PROMPTS entries | `// ── Puzzles ──` |
| Guesstimate PROMPTS entries | `// ── Puzzles ──` |
| Puzzle PROMPTS entries | `// ── Guesstimates ──` (or end of puzzles section) |
| SQL_DATASETS entries | `};\n\n// ═══════════════════════════════\n// PYTHON EDITOR` |
| PYTHON_DATASETS entries | closing `};\n` before `function isSQLCase` |
| SQL TEST_CASES entries | `// ── Python Cases ──` inside TEST_CASES object |
| Python TEST_CASES entries | closing `};\n\nconst SYSTEM_PROMPT` |

Read 5 lines around each insertion point FIRST to get the exact whitespace match.

### Step 7: Insert into D1 database

Use the MCP tool `d1_database_query` with:
- `database_id`: `bcba85e7-9594-4182-ad42-66bb989102a0`
- `sql`: the INSERT statement

Run each INSERT separately. Use `INSERT OR IGNORE` for idempotency.

**Important D1 escaping rules:**
- Single quotes in SQL strings must be doubled: `''` not `\'`
- Newlines in content: use `\n` (actual newline chars in the SQL string)
- The `hints` and `schema_json` fields must be valid JSON strings

After all inserts, run a verification query:
```sql
SELECT id FROM questions WHERE id IN ('new_id_1', 'new_id_2') ORDER BY id;
```

### Step 8: Update _registry.yaml (case studies only)

For each case study question, add its framework mapping to `frameworks/_registry.yaml` under the appropriate section. Read the file first to find the right insertion point.

### Step 9: Validate syntax before committing

**This step is MANDATORY — never skip it.** A single missing comma will break the entire practice page.

Run this Python validation script to check practice.html for syntax errors:

```bash
python -c "
import re, sys
sys.stdout.reconfigure(encoding='utf-8')
errors = []

# Check practice.html - extract main script block and validate backtick balance
with open('practice.html', 'r', encoding='utf-8') as f:
    html = f.read()
scripts = re.findall(r'<script(?![^>]*type=[\"']module[\"'])[^>]*>(.*?)</script>', html, re.DOTALL)
for i, s in enumerate(scripts):
    if 'SQL_DATASETS' not in s:
        continue
    bt = s.count(chr(96))
    esc = s.count(chr(92) + chr(96))
    effective = bt - 2 * esc
    if effective % 2 != 0:
        errors.append(f'practice.html script block {i}: ODD backtick count ({effective}) - broken template literal')
    braces_open = s.count('{')
    braces_close = s.count('}')
    if braces_open != braces_close:
        errors.append(f'practice.html script block {i}: Unbalanced braces (open={braces_open}, close={braces_close})')

# Check for missing commas between SQL_DATASETS entries
bad_commas = re.findall(r'\}\s*\}\s*\n\s*(?://[^\n]*\n\s*)*\n?\s*\w+:', s)
for match in bad_commas:
    errors.append(f'practice.html: Missing comma between SQL_DATASETS entries near: {match[:60]}...')

if errors:
    print('VALIDATION FAILED:')
    for e in errors:
        print(f'  - {e}')
    sys.exit(1)
else:
    print('Validation passed: backticks balanced, braces matched, no missing commas detected')
"
```

If validation fails, **fix the error before committing**. Common fixes:
- Missing comma after `}` closing an entry → add `,`
- Unescaped backtick inside a template literal → escape with `\``
- Unclosed template literal → find the entry with mismatched backticks

### Step 10: Verify D1 data completeness

Run these verification queries to ensure everything was inserted:

```sql
-- Check all new questions exist
SELECT id, title, framework FROM questions WHERE id IN ('new_id_1', 'new_id_2');

-- Check case_prompts exist for ALL new questions
SELECT question_id FROM case_prompts WHERE question_id IN ('new_id_1', 'new_id_2');

-- Check solutions exist for case study/puzzle/guesstimate questions
SELECT question_id, solution_type FROM solutions WHERE question_id IN ('new_id_1', 'new_id_2');

-- Check test_cases exist for ALL SQL and Python questions
SELECT question_id, COUNT(*) as test_count FROM test_cases WHERE question_id IN ('new_id_1', 'new_id_2') GROUP BY question_id;

-- Check sql_datasets or python_datasets exist for code questions
SELECT question_id FROM sql_datasets WHERE question_id IN ('new_id_1');
```

**Every SQL/Python question MUST have at least 2 test cases.** If any are missing, add them before proceeding.

### Step 11: Commit and push

Stage only `practice.html` and `frameworks/_registry.yaml` (if modified). Commit with message:
```
Add {N} {Company} interview questions ({breakdown})

- Brief description of what was added
- Company tag: {Company}

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
```

Then push to the current branch.

### Handling duplicate questions

Before creating a new question, check if it already exists by searching for the question topic/pattern in PROMPTS and SQL_DATASETS. If a matching question already exists:

1. **Do NOT create a duplicate** — skip it
2. **Add the new company tag** to the existing question's `<em>Asked at ...</em>` text. Append the new company: e.g., `<em>Asked at eBay, Tredence.</em>` becomes `<em>Asked at eBay, Tredence, NewCompany.</em>`
3. **Update the D1 case_prompts** entry to mention the new company in the interview context
4. **Report** which questions were skipped and which got new company tags

### Important rules

- **ALWAYS add a trailing comma** after every object entry closing `},` — including the LAST entry before `};`. This is the #1 cause of site outages.
- **EVERY SQL/Python question MUST have TEST_CASES** — no exceptions. Create at least 2 tests per question.
- **EVERY case study question MUST have a _registry.yaml entry** with the correct framework code.
- **EVERY question MUST have a D1 case_prompts entry** — the AI coaching prompt.
- NEVER skip the Step 9 validation — run it even if you're confident the syntax is correct.
- ALWAYS include `<em>Asked at {Company}.</em>` in SQL/Python question HTML.
- Keep SQL setup data realistic — use the document's sample data but expand if too small (< 6 rows → expand to 8-15 rows).
- If a question is purely analytical (no code), make it a case study, not SQL.
- D1 strings use `''` (doubled single quotes) for escaping — NOT `\'`.
- After inserting into any object in practice.html, verify the previous entry ends with a comma.
- The D1 database_id is always: `bcba85e7-9594-4182-ad42-66bb989102a0`

### Test case writing guide

**SQL expectedQuery tests:**
- Write a complete reference query that produces the correct result
- The test runner extracts numeric values (>30, decimals, negatives) from the reference result
- It checks if those values appear in the user's output
- Set `minMatchRatio: 0.3-0.5` (what fraction of values must match)
- `failMsg` should hint at the SQL technique, not give the answer

**SQL check() tests (for pattern matching):**
```javascript
check(out) {
  if (!out) return { pass: false, msg: 'No output' };
  const lower = out.toLowerCase();
  // Check for expected patterns, values, labels
  if (!lower.includes('expected_value')) return { pass: false, msg: 'Hint' };
  return { pass: true, msg: 'Success description' };
}
```

**Python assertion tests:**
```javascript
{
  name: 'Description',
  assertion: `
assert condition, "error message"
`,
  msg: 'Hint if assertion fails'
}
```

**When to use which:**
- `expectedQuery` — when correct answer can be computed by a reference query (most SQL tests)
- `check()` — when checking output patterns, labels, categories, or row counts
- `assertion` — for Python questions (runs against user's variables/dataframes)
