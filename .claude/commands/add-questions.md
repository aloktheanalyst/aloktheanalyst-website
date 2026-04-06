Add interview questions from attached documents to the practice website.

The user has attached one or more documents (PDFs, text files, images) containing interview questions. Parse them and add to the website.

$ARGUMENTS

## Instructions

Follow these steps exactly. Do NOT explore the codebase — all structure info is in CLAUDE.md.

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

For each question, determine:
- **SQL**: Has tables + asks to write queries → needs PROMPTS + SQL_DATASETS + CASE_PROMPTS
- **Case study**: Business analysis, product strategy, RCA → needs PROMPTS + CASE_PROMPTS + CASESTUDY_SOLUTIONS
- **Python**: Code/pandas questions → needs PROMPTS + PYTHON_DATASETS + CASE_PROMPTS
- **Puzzle**: Logic/math puzzles → needs PROMPTS + CASE_PROMPTS + PUZZLE_SOLUTIONS
- **Guesstimate**: Market sizing/estimation → needs PROMPTS + CASE_PROMPTS + GUESSTIMATE_SOLUTIONS

**Combining questions**: If a document has multiple small SQL questions sharing the same schema/tables, combine 2-3 into a single multi-part question. This is better for practice.

**Difficulty rules**:
- easy: Single concept (basic WHERE, simple GROUP BY, straightforward estimation)
- medium: 2-3 concepts combined (JOINs + aggregation, multi-step analysis)
- hard: Advanced patterns (window functions, CTEs, cumulative logic, multi-framework analysis)

### Step 3: Generate IDs

Use the naming convention from CLAUDE.md:
- `sql_{company}_{topic}` for SQL
- `cs_{company}_{topic}` for case studies
- `python_{company}_{topic}` for Python
- `pz_{shortname}` for puzzles
- `guess_{shortname}` for guesstimates

### Step 4: Build the data

For **SQL questions**, create:
1. PROMPTS entry with company name in title
2. SQL_DATASETS with:
   - `question`: Start with `<em>Asked at {Company}.</em><br><br>` then the question in HTML
   - `hints`: 3 progressive hints (first hint = starting direction, second = key technique, third = edge case or trick)
   - `schema`: Array of table definitions from the document
   - `setup.shared`: CREATE TABLE + INSERT statements using the sample data from the document. If sample data is small (< 6 rows), expand it to 8-15 rows for better practice
3. CASE_PROMPTS: AI coaching prompt describing the interview scenario, what to ask, what to push on

For **case study questions**, create:
1. PROMPTS entry
2. CASE_PROMPTS: Coaching prompt with full context, data, and guidance
3. CASESTUDY_SOLUTIONS: Full model solution with framework, step-by-step analysis, tables, and key insight. Use `\n` for newlines in template literals. Follow the existing solution format with emoji framework header, steps, and summary.

### Step 5: Insert into files

Use the Edit tool with the exact insertion anchors from CLAUDE.md:
- SQL PROMPTS → insert before `{ id: 'ab_test',`
- Case study PROMPTS → insert before `// ── Puzzles ──`
- SQL_DATASETS → insert before `};` + `// PYTHON EDITOR` block
- CASE_PROMPTS (SQL) → insert before `// ── A/B Testing prompts ──`
- CASE_PROMPTS (case study) → insert before `// ── Puzzle prompts ──`
- CASESTUDY_SOLUTIONS → insert before `/* FRAMEWORK_REGISTRY:FACTOR_TREE_DATA:START */`

Read 5 lines around each insertion point FIRST to get the exact whitespace match.

### Step 6: Validate syntax before committing

**This step is MANDATORY — never skip it.** A single missing comma will break the entire practice page.

Run this Python validation script to check both files for syntax errors:

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

# Check for missing commas between SQL_DATASETS entries (closing }\\n  // or }\\n\\n  id:)
# Pattern: entry closing with }  } but no comma before next entry
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

### Step 7: Commit and push

Stage only `practice.html` and `functions/api/practice-content.js`. Commit with message:
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
3. **Update the CASE_PROMPTS** entry to mention the new company in the interview context
4. **Report** which questions were skipped and which got new company tags

Also after merging to main, verify no JS syntax errors by checking that the last line of each edited object has a trailing comma before `};`. **Always run the Step 6 validation script before committing.**

### Important rules
- **ALWAYS add a trailing comma** after every object entry closing `},` — including the LAST entry before `};`. This is the #1 cause of site outages.
- NEVER skip the CASE_PROMPTS entry — every question needs an AI coaching prompt
- NEVER skip the Step 6 validation — run it even if you're confident the syntax is correct
- ALWAYS include `<em>Asked at {Company}.</em>` in SQL/Python question HTML
- Keep SQL setup data realistic — use the document's sample data but expand if too small
- If a question is purely analytical (no code), make it a case study, not SQL
- Verify IDs are unique — grep for the ID before inserting
- After inserting into CASESTUDY_SOLUTIONS, verify the previous entry ends with a comma (`,`) before the new entry — missing commas cause build failures
