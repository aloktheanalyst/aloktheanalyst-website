Add interview questions to the practice website.

Questions may be provided inline in the chat OR as attached documents (PDFs, images, text files). Parse whichever format is given.

$ARGUMENTS

## Architecture Overview

**D1 is the single source of truth.** All data lives in Cloudflare D1 — `practice.html` is fully migrated and only contains empty stubs (`PROMPTS = []`, `SQL_DATASETS = {}`, etc.) that are populated at runtime via API calls. Do NOT edit practice.html for data.

Data flows:
- Page load → `GET /api/practice-content?list=questions` → populates PROMPTS
- Opening SQL/Python question → `fetchDataset()` → `?dataset=<id>` → populates SQL_DATASETS / PYTHON_DATASETS
- Running tests → `fetchTestCases()` → `?testcases=<id>` → populates TEST_CASES
- Case content (prompt/solution) → `fetchCaseContent()` → `?id=<id>`

**`functions/api/practice-content.js`** is the API layer — do NOT edit it.

Additionally:
- **`frameworks/_registry.yaml`** — framework mapping for case study questions (case studies only)

## Instructions

Follow these steps exactly.

### Step 1: Parse the questions

Extract from inline text or attached document:
- **Company name** (if provided; use "Classic SQL" / "Classic Python" if none given)
- **Individual questions** with their:
  - Category: SQL, case study, python, puzzle, or guesstimate
  - Difficulty: easy, medium, or hard
  - Question text
  - Any sample tables/data provided
  - Any solution/answer provided

### Step 2: Categorize and plan

For each question, determine what D1 tables are needed:

| Type | D1 tables | _registry.yaml |
|------|-----------|----------------|
| **SQL** | questions + case_prompts + sql_datasets + test_cases | — |
| **Python** | questions + case_prompts + python_datasets + test_cases | — |
| **Case study** | questions + case_prompts + solutions | ✅ Add framework |
| **Puzzle** | questions + case_prompts + solutions | — |
| **Guesstimate** | questions + case_prompts + solutions | — |

**Combining questions**: If multiple small SQL questions share the same schema/tables, combine 2–3 into a single multi-part question for better practice.

**Difficulty rules**:
- easy: Single concept (basic WHERE, simple GROUP BY, straightforward estimation)
- medium: 2–3 concepts combined (JOINs + aggregation, multi-step analysis)
- hard: Advanced patterns (window functions, CTEs, cumulative logic, multi-framework analysis)

### Step 3: Generate IDs

Use the naming convention:
- `sql_{company}_{topic}` for SQL (e.g., `sql_pelago_customers`)
- `cs_{company}_{topic}` for case studies (e.g., `cs_pelago_paid`)
- `python_{company}_{topic}` for Python
- `pz_{shortname}` for puzzles
- `ge_{shortname}` for guesstimates

**Verify IDs are unique** — query D1 before inserting:
```sql
SELECT id FROM questions WHERE id IN ('proposed_id_1', 'proposed_id_2');
```
If any exist, adjust the ID or handle as a duplicate (see "Handling duplicates" below).

### Step 4: Determine framework for case study questions

**Mandatory for all case study questions.**

Read `frameworks/_registry.yaml` first. Choose from:

| Code | Display Name Examples |
|------|----------------------|
| `rca` | Root Cause Analysis, Root Cause + Solutions |
| `metric-design` | AARRR / North Star Metric, Dashboard Design, KPI Design |
| `product-analytics` | Product Analytics, Impact Assessment, Operations Optimization |
| `market-entry` | Market Entry Framework |
| `profitability` | Profitability Analysis, Break-Even Analysis, Cost Structure |
| `funnel-analysis` | Funnel Analysis, Conversion Optimization |
| `ab-testing` | A/B Testing & Statistical Power |

For the `framework` field in `questions`, use a **specific display name** (not the generic code).

### Step 5: Build and insert into D1

Use `d1_database_query` with `database_id: bcba85e7-9594-4182-ad42-66bb989102a0`. Run each INSERT separately. Use `INSERT OR IGNORE` for idempotency.

**D1 escaping rules:**
- Single quotes inside SQL strings: double them `''` (NOT `\'`)
- Newlines: use `\n` literals
- `hints` and `schema_json` fields: must be valid JSON strings (double-quoted keys and values)

#### For SQL questions:

```sql
-- 1. questions table
INSERT OR IGNORE INTO questions (id, title, topic, difficulty, tag, framework, sort_order)
VALUES ('sql_company_topic', 'Company: Question Title', 'sql', 'medium', 'SQL', NULL,
        (SELECT COALESCE(MAX(sort_order),0)+1 FROM questions));

-- 2. case_prompts table (AI coaching prompt — required for ALL questions)
INSERT OR IGNORE INTO case_prompts (question_id, prompt)
VALUES ('sql_company_topic', 'You are interviewing a candidate for a data analyst role. They must write SQL to [describe task]. Guide them step by step. If stuck, offer hints without giving the full answer.');

-- 3. sql_datasets table
INSERT OR IGNORE INTO sql_datasets (question_id, label, question_html, default_query, hints, schema_json, setup_sql)
VALUES (
  'sql_company_topic',
  'Question Label',
  '<em>Asked at Company.</em><br><br>Question text in HTML...',
  '-- Write your SQL here\n',
  '["Hint 1", "Hint 2", "Hint 3"]',
  '[{"name":"table_name","columns":[{"name":"col","type":"TYPE"}]}]',
  'CREATE TABLE table_name (col TYPE, ...); INSERT INTO table_name VALUES (...);'
);

-- 4. test_cases table (one INSERT per test; at least 2 tests required)
INSERT OR IGNORE INTO test_cases (question_id, test_index, name, expected_query, min_match_ratio, fail_msg, max_rows, min_cols, check_function)
VALUES ('sql_company_topic', 0, 'Test name', 'SELECT ... reference query ...', 0.4, 'Hint about technique', NULL, NULL, NULL);

INSERT OR IGNORE INTO test_cases (question_id, test_index, name, expected_query, min_match_ratio, fail_msg, max_rows, min_cols, check_function)
VALUES ('sql_company_topic', 1, 'Second test', NULL, NULL, NULL, NULL, NULL,
  'function check(out) { if (!out) return { pass: false, msg: "No output" }; const lower = out.toLowerCase(); if (!lower.includes("expected_value")) return { pass: false, msg: "Hint" }; return { pass: true, msg: "Correct" }; }');
```

**Test case rules:**
- At least 2 tests per SQL/Python question — no exceptions
- **test_index 0 MUST have an `expected_query`** — this powers the "Expected Output" tab in the UI. Without it, users see "No expected output" which is confusing. The `expected_query` should be a complete reference SQL that produces the correct answer.
- `expectedQuery`: reference SQL that produces the correct answer; the runner extracts numeric values and checks if they appear in user output. Use `minMatchRatio` 0.3–0.5
- `check_function`: a JS function string `function check(out) { ... return {pass, msg}; }` for pattern matching. A test can have BOTH `expected_query` and `check_function` — use both on test_index 0 when the expected output alone isn't enough to validate correctness.
- `failMsg` should hint at the technique, not reveal the answer
- Use `maxRows` / `minCols` constraints when relevant

#### For Python questions:

Same as SQL but insert into `python_datasets` instead, and test cases use `check_function` with assertion-style JS:

```sql
INSERT OR IGNORE INTO python_datasets (question_id, label, question_html, default_query, hints, schema_json, setup_code)
VALUES ('python_company_topic', 'Label', '<em>Asked at Company.</em><br><br>...', '# Write your code here\n',
  '["Hint 1", "Hint 2"]',
  '[{"name":"df","columns":[{"name":"col","type":"type"}]}]',
  'import pandas as pd\ndf = pd.DataFrame({...})');

INSERT OR IGNORE INTO test_cases (question_id, test_index, name, expected_query, min_match_ratio, fail_msg, max_rows, min_cols, check_function)
VALUES ('python_company_topic', 0, 'Test name', NULL, NULL, 'Hint', NULL, NULL,
  'function check(out) { if (!out) return { pass: false, msg: "No output" }; return { pass: out.includes("expected"), msg: "Correct" }; }');
```

#### For case study questions:

```sql
-- questions (with framework display name)
INSERT OR IGNORE INTO questions (id, title, topic, difficulty, tag, framework, sort_order)
VALUES ('cs_company_topic', 'Question Title', 'casestudy', 'medium', 'Case Study', 'Product Analytics',
        (SELECT COALESCE(MAX(sort_order),0)+1 FROM questions));

-- case_prompts
INSERT OR IGNORE INTO case_prompts (question_id, prompt)
VALUES ('cs_company_topic', 'Full coaching prompt...');

-- solutions
INSERT OR IGNORE INTO solutions (question_id, solution_type, solution)
VALUES ('cs_company_topic', 'casestudy', '**🎯 Framework: ...**\n\nFull model solution...');
```

#### For puzzles and guesstimates:

Same as case study. Solution type is `'puzzle'` or `'guesstimate'`. No test cases needed.

### Step 6: Update `_registry.yaml` (case studies only)

Read `frameworks/_registry.yaml` first. Add under the appropriate section:

```yaml
  cs_company_topic:
    framework: product-analytics    # one of: rca, metric-design, product-analytics, market-entry, profitability, funnel-analysis, ab-testing
```

### Step 7: Verify D1 data completeness

Run these verification queries:

```sql
-- All new questions exist
SELECT id, title, topic, difficulty FROM questions WHERE id IN ('new_id_1', 'new_id_2');

-- case_prompts exist for ALL new questions
SELECT question_id FROM case_prompts WHERE question_id IN ('new_id_1', 'new_id_2');

-- solutions exist for case study / puzzle / guesstimate
SELECT question_id, solution_type FROM solutions WHERE question_id IN ('cs_id');

-- test_cases exist for all SQL/Python (min 2 per question), and test_index 0 has expected_query
SELECT question_id, test_index,
  CASE WHEN expected_query IS NOT NULL THEN 'YES' ELSE 'MISSING' END AS has_expected_output,
  CASE WHEN check_function IS NOT NULL THEN 'YES' ELSE 'NO' END AS has_check_fn
FROM test_cases
WHERE question_id IN ('sql_id_1', 'sql_id_2')
ORDER BY question_id, test_index;

-- sql_datasets / python_datasets exist
SELECT question_id FROM sql_datasets WHERE question_id IN ('sql_id_1');
```

**Verify expected output**: Every SQL/Python question MUST have `expected_query` set on `test_index = 0`. This powers the "Expected Output" tab in the UI. If any test_index 0 row shows `has_expected_output = MISSING`, UPDATE it to add a reference query:

```sql
UPDATE test_cases SET expected_query = 'SELECT ...reference query...', min_match_ratio = 0.3
WHERE question_id = 'sql_id' AND test_index = 0;
```

If any data is missing, fix it before committing.

### Step 8: Commit and push

Stage only `frameworks/_registry.yaml` (only if case studies were added — practice.html is never staged for question data).

Commit message:
```
Add {N} interview questions ({breakdown})

- Brief description of what was added

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
```

Then push to the current branch.

---

### Handling duplicate questions

Before creating a new question, check if it already exists:
```sql
SELECT id, title FROM questions WHERE title LIKE '%keyword%' OR id LIKE '%topic%';
```

If a match exists:
1. **Do NOT create a duplicate** — skip it
2. **Append the new company** to the existing question's `question_html` `<em>` tag in `sql_datasets` (or `python_datasets`): `<em>Asked at Existing, NewCompany.</em>`
3. **Report** which questions were skipped / which got new company tags

---

### Important rules

- **EVERY SQL/Python question MUST have at least 2 TEST_CASES** — no exceptions.
- **EVERY case study question MUST have a `_registry.yaml` entry**.
- **EVERY question MUST have a D1 `case_prompts` entry**.
- **ALWAYS include `<em>Asked at {Company}.</em>`** in SQL/Python question HTML (use "Classic SQL" if no company).
- Keep SQL setup data realistic — at least 8–15 rows; expand if sample data is too small.
- The D1 `database_id` is always: `bcba85e7-9594-4182-ad42-66bb989102a0`
- D1 strings: use `''` (doubled single quotes) for escaping — NOT `\'`.

---

### Test case writing guide

**`expectedQuery` tests** (preferred for SQL — numeric value matching):
- Write a complete reference SQL query that returns the correct answer
- The runner extracts numeric values > 30 (decimals, negatives included) and checks they appear in user output
- `minMatchRatio: 0.3–0.5` (what fraction of values must match)
- `failMsg` hints at the technique, not the answer

**`check_function` tests** (for pattern/label matching):
```javascript
function check(out) {
  if (!out) return { pass: false, msg: 'No output' };
  const lower = out.toLowerCase();
  if (!lower.includes('expected_value')) return { pass: false, msg: 'Hint message' };
  return { pass: true, msg: 'Looks correct!' };
}
```

Store this as a string in the `check_function` column. The API reconstructs it via `eval()` client-side.
