# AlokTheAnalyst Website

## Architecture: Hybrid Data Model

Data lives in TWO places:

1. **`practice.html`** (client-side inline) — PROMPTS, SQL_DATASETS, PYTHON_DATASETS, TEST_CASES
2. **Cloudflare D1 database** `bcba85e7-9594-4182-ad42-66bb989102a0` (server-side) — questions, case_prompts, solutions, sql_datasets, python_datasets, test_cases, factor_trees

`functions/api/practice-content.js` is the API layer that reads from D1. Do NOT put inline data in it.

### Framework registry: `frameworks/_registry.yaml`

Single source of truth for case-to-framework mapping. Every case study question MUST have an entry here.

Framework codes: `rca`, `metric-design`, `product-analytics`, `market-entry`, `profitability`, `funnel-analysis`, `ab-testing`

## Adding Interview Questions

### File 1: `practice.html`

**PROMPTS array** (~line 2606) — metadata for every question:
```javascript
{ id: 'sql_company_topic', title: 'Company: Question Title', topic: 'sql', difficulty: 'medium', tag: 'SQL' }
// topic: sql | casestudy | python | puzzles | guesstimates | bi | behavioral
// tag:   SQL | Case Study | Python | Puzzle | Guesstimate | BI | Behavioral
// optional: framework: 'Specific Framework Display Name'  (case studies only)
```

**SQL_DATASETS** (~line 2984) — interactive SQL editor data:
```javascript
sql_id: {
  label: 'Title',
  question: '<em>Asked at Company.</em><br><br>question HTML...',
  defaultQuery: '-- Write your SQL here\n',
  hints: ['hint1', 'hint2', 'hint3'],
  schema: [{ name: 'table_name', columns: [{ name: 'col', type: 'TYPE' }] }],
  setup: { shared: `CREATE TABLE...; INSERT INTO...;` }
},
```

**PYTHON_DATASETS** (~line 3699) — same pattern but with `setupCode` instead of `setup.shared`.

**TEST_CASES** (~line 4327) — validation tests for SQL and Python questions:
```javascript
sql_id: [
  { name: 'Test name', expectedQuery: `SELECT ...`, minMatchRatio: 0.4, failMsg: 'Hint' },
  { name: 'Pattern test', check(out) { /* return {pass, msg} */ } }
],
```

### File 2: D1 Database (via MCP tool)

Use `d1_database_query` with `database_id: bcba85e7-9594-4182-ad42-66bb989102a0`.

**Tables:**
- `questions` — mirrors PROMPTS (id, title, topic, difficulty, tag, framework, sort_order)
- `case_prompts` — AI coaching prompt for ALL question types (question_id, prompt)
- `solutions` — model solutions for casestudy/puzzle/guesstimate (question_id, solution_type, solution)
- `sql_datasets` — mirrors SQL_DATASETS (question_id, label, question_html, default_query, hints, schema_json, setup_sql)
- `python_datasets` — mirrors PYTHON_DATASETS (question_id, label, question_html, default_query, hints, schema_json, setup_code)
- `test_cases` — mirrors TEST_CASES (question_id, test_index, name, expected_query, min_match_ratio, fail_msg, max_rows, min_cols, check_function)
- `factor_trees` — RCA diagram data (question_id, tree_data JSON)

**D1 escaping:** Use `''` (doubled single quotes) in SQL strings, NOT `\'`.

### File 3: `frameworks/_registry.yaml`

Add framework mapping for every case study question:
```yaml
  cs_company_topic:
    framework: product-analytics
```

### Insertion Points in practice.html (use these anchors for Edit tool)

| What | Insert before this text |
|------|------------------------|
| SQL PROMPTS entries | `{ id: 'ab_test',` |
| Case study PROMPTS entries | `// ── Puzzles ──` |
| Guesstimate PROMPTS entries | `// ── Puzzles ──` |
| Puzzle PROMPTS entries | `// ── Guesstimates ──` |
| SQL_DATASETS entries | `};\n\n// ═══════════════════════════════\n// PYTHON EDITOR` |
| PYTHON_DATASETS entries | closing `};\n` before `function isSQLCase` |
| SQL TEST_CASES entries | `// ── Python Cases ──` inside TEST_CASES |
| Python TEST_CASES entries | closing `};\n\nconst SYSTEM_PROMPT` |

### Company Tag Convention
- SQL/Python questions: include `<em>Asked at CompanyName.</em>` at the start of the `question` HTML
- The `extractCompany()` function in practice.html auto-extracts this for display in the browse grid

### ID Naming Convention
- SQL: `sql_company_topic` (e.g., `sql_pelago_customers`)
- Case study: `cs_company_topic` (e.g., `cs_pelago_paid`)
- Python: `python_company_topic`
- Puzzle: `pz_shortname`
- Guesstimate: `ge_shortname`
- BI: `bi_shortname`
- Behavioral: `beh_shortname`

### Checklist for adding a question

1. ✅ Add entry to PROMPTS array in `practice.html`
2. ✅ If SQL: add SQL_DATASETS entry in `practice.html`
3. ✅ If Python: add PYTHON_DATASETS entry in `practice.html`
4. ✅ If SQL/Python: add TEST_CASES entry in `practice.html` (MANDATORY — at least 2 tests)
5. ✅ Insert into D1 `questions` table
6. ✅ Insert into D1 `case_prompts` table (ALL question types need this)
7. ✅ If case study: insert into D1 `solutions` table + add to `_registry.yaml`
8. ✅ If puzzle/guesstimate/bi/behavioral: insert into D1 `solutions` table
9. ✅ If SQL: insert into D1 `sql_datasets` + `test_cases` tables
10. ✅ If Python: insert into D1 `python_datasets` + `test_cases` tables
11. ✅ Run validation script on practice.html
12. ✅ Run D1 verification queries
