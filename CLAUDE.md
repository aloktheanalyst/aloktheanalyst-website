# AlokTheAnalyst Website

## Adding Interview Questions

Questions live in two files. Both must be updated when adding new questions.

### File 1: `practice.html`

**PROMPTS array** (~line 2606) — metadata for every question:
```javascript
{ id: 'sql_company_topic', title: 'Company: Question Title', topic: 'sql', difficulty: 'medium', tag: 'SQL' }
// topic: sql | casestudy | python | puzzles | guesstimates
// tag:   SQL | Case Study | Python | Puzzle | Guesstimate
// optional: framework: 'Framework Name'
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
}
```

**PYTHON_DATASETS** (~line 3699) — same pattern but with `setupCode` instead of `setup.shared`.

### File 2: `functions/api/practice-content.js`

**CASE_PROMPTS** (~line 108) — AI coaching prompt for ALL question types (SQL, Python, case studies):
```javascript
question_id: 'You are interviewing a candidate... Guide them through...',
```

**CASESTUDY_SOLUTIONS** (~line 5759) — full model solution for case studies only:
```javascript
cs_id: `**Framework Used: ...**\n\nSolution content with \\n newlines...`,
```

**PUZZLE_SOLUTIONS** (~line 5519), **GUESSTIMATE_SOLUTIONS** (~line 5707) — solutions for those types.

### Insertion Points (use these anchors for Edit tool)

| What | Insert before this text |
|------|------------------------|
| SQL PROMPTS entries | `{ id: 'ab_test',` |
| Case study PROMPTS entries | `// ── Puzzles ──` |
| Guesstimate PROMPTS entries | `// ── Puzzles ──` |
| SQL_DATASETS entries | `};\n\n// ═══════════════════════════════\n// PYTHON EDITOR` |
| SQL CASE_PROMPTS | `// ── A/B Testing prompts ──` |
| Case study CASE_PROMPTS | `// ── Puzzle prompts ──` |
| CASESTUDY_SOLUTIONS | `};\n\n/* FRAMEWORK_REGISTRY:FACTOR_TREE_DATA:START */` |
| PUZZLE_SOLUTIONS | closing `};` before `const GUESSTIMATE_SOLUTIONS` |
| GUESSTIMATE_SOLUTIONS | closing `};` before `const CASESTUDY_SOLUTIONS` |

### Company Tag Convention
- SQL/Python questions: include `<em>Asked at CompanyName.</em>` at the start of the `question` HTML
- The `extractCompany()` function in practice.html auto-extracts this for display in the browse grid

### ID Naming Convention
- SQL: `sql_company_topic` (e.g., `sql_pelago_customers`)
- Case study: `cs_company_topic` (e.g., `cs_pelago_paid`)
- Python: `python_company_topic`
- Puzzle: `pz_shortname`
- Guesstimate: `guess_shortname`

### Checklist for adding a question
1. Add entry to PROMPTS array in `practice.html`
2. If SQL: add SQL_DATASETS entry in `practice.html`
3. If Python: add PYTHON_DATASETS entry in `practice.html`
4. Add CASE_PROMPTS entry in `practice-content.js` (ALL question types need this)
5. If case study: add CASESTUDY_SOLUTIONS entry in `practice-content.js`
6. If puzzle: add PUZZLE_SOLUTIONS entry
7. If guesstimate: add GUESSTIMATE_SOLUTIONS entry
