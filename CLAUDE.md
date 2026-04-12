# AlokTheAnalyst Website

## Architecture: D1-Only Data Model

**D1 is the single source of truth.** All question data lives in Cloudflare D1 database `bcba85e7-9594-4182-ad42-66bb989102a0`.

`practice.html` contains only empty stubs (`PROMPTS = []`, `SQL_DATASETS = {}`, `PYTHON_DATASETS = {}`, `TEST_CASES = {}`) — populated at runtime via API:
- Page load → `GET /api/practice-content?list=questions` → PROMPTS
- SQL/Python question open → `?dataset=<id>` → SQL_DATASETS / PYTHON_DATASETS
- Running tests → `?testcases=<id>` → TEST_CASES
- Case content → `?id=<id>` → prompts / solutions / factor trees

`functions/api/practice-content.js` is the API layer. Do NOT put inline data in practice.html or in the API function.

### D1 Tables

Use `d1_database_query` with `database_id: bcba85e7-9594-4182-ad42-66bb989102a0`.

| Table | Purpose |
|-------|---------|
| `questions` | Metadata: id, title, topic, difficulty, tag, framework, sort_order |
| `case_prompts` | AI coaching prompt for ALL question types (question_id, prompt) |
| `solutions` | Model solutions for casestudy/puzzle/guesstimate (question_id, solution_type, solution) |
| `sql_datasets` | SQL editor data: question_id, label, question_html, default_query, hints, schema_json, setup_sql |
| `python_datasets` | Python editor data: question_id, label, question_html, default_query, hints, schema_json, setup_code |
| `test_cases` | Validation tests: question_id, test_index, name, expected_query, min_match_ratio, fail_msg, max_rows, min_cols, check_function |
| `factor_trees` | RCA diagram data: question_id, tree_data JSON |

**D1 escaping:** Use `''` (doubled single quotes) in SQL strings, NOT `\'`.

### Framework registry: `frameworks/_registry.yaml`

Single source of truth for case-to-framework mapping. Every case study question MUST have an entry here.

Framework codes: `rca`, `metric-design`, `product-analytics`, `market-entry`, `profitability`, `funnel-analysis`, `ab-testing`

## Adding Interview Questions

### ID Naming Convention
- SQL: `sql_company_topic` (e.g., `sql_pelago_customers`)
- Case study: `cs_company_topic` (e.g., `cs_pelago_paid`)
- Python: `python_company_topic`
- Puzzle: `pz_shortname`
- Guesstimate: `ge_shortname`

### Company Tag Convention
- SQL/Python questions: include `<em>Asked at CompanyName.</em>` at the start of `question_html`
- Use "Classic SQL" if no company is known
- The `extractCompany()` function in practice.html auto-extracts this for the browse grid

### Checklist for adding a question

1. ✅ Insert into D1 `questions` table
2. ✅ Insert into D1 `case_prompts` table (ALL question types)
3. ✅ If SQL: insert into D1 `sql_datasets` + `test_cases` tables (min 2 tests)
4. ✅ If Python: insert into D1 `python_datasets` + `test_cases` tables (min 2 tests)
5. ✅ If case study: insert into D1 `solutions` table + add to `frameworks/_registry.yaml`
6. ✅ If puzzle/guesstimate: insert into D1 `solutions` table
7. ✅ Run D1 verification queries
8. ✅ Commit and push (only `frameworks/_registry.yaml` needs staging — practice.html is NOT modified for question data)

### topic and tag values

```
topic: sql | casestudy | python | puzzles | guesstimates
tag:   SQL | Case Study | Python | Puzzle | Guesstimate
```

Case studies also need `framework` column set to a specific display name (e.g., `'Product Analytics'`).
