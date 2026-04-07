#!/usr/bin/env python3
"""
Migration script: Extract all practice arena data from JS files and output SQL INSERT statements.
Reads practice.html and functions/api/practice-content.js, outputs migration.sql
"""

import re
import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

PRACTICE_HTML = 'practice.html'
CONTENT_JS = 'functions/api/practice-content.js'

def read_file(path):
    with open(path, 'r', encoding='utf-8') as f:
        return f.read()

def sql_escape(s):
    """Escape a string for SQL single-quote literals."""
    if s is None:
        return 'NULL'
    return "'" + s.replace("'", "''") + "'"

# ─── 1. Parse PROMPTS array from practice.html ───

def parse_prompts(html):
    """Extract all entries from const PROMPTS = [...];"""
    # Find the PROMPTS array
    match = re.search(r'const PROMPTS\s*=\s*\[', html)
    if not match:
        raise ValueError("Could not find PROMPTS array")

    start = match.end()
    # Find matching ]
    depth = 1
    i = start
    while i < len(html) and depth > 0:
        if html[i] == '[':
            depth += 1
        elif html[i] == ']':
            depth -= 1
        i += 1

    array_content = html[match.start():i]

    # Parse each { ... } entry
    prompts = []
    for m in re.finditer(r'\{\s*id:\s*[\'"]([^"\']+)[\'"],\s*title:\s*[\'"]([^"\']+)[\'"],\s*topic:\s*[\'"]([^"\']+)[\'"],\s*difficulty:\s*[\'"]([^"\']+)[\'"],\s*tag:\s*[\'"]([^"\']+)[\'"](?:,\s*framework:\s*[\'"]([^"\']+)[\'"])?\s*\}', array_content):
        prompts.append({
            'id': m.group(1),
            'title': m.group(2),
            'topic': m.group(3),
            'difficulty': m.group(4),
            'tag': m.group(5),
            'framework': m.group(6),  # may be None
        })

    return prompts

# ─── 2. Parse SQL_DATASETS from practice.html ───

def parse_object_entries(text, obj_name):
    """Parse a JS object like const OBJ = { key: { ... }, key2: { ... } };
    Returns list of (key, raw_content) tuples where raw_content is the full { ... } block."""

    match = re.search(r'const\s+' + obj_name + r'\s*=\s*\{', text)
    if not match:
        return []

    start = match.end()
    # Find the entries by tracking key: { ... } patterns
    entries = []
    pos = start

    while pos < len(text):
        # Find next key
        key_match = re.search(r'(\w+)\s*:\s*\{', text[pos:])
        if not key_match:
            break

        key = key_match.group(1)
        brace_start = pos + key_match.end() - 1  # position of opening {

        # Find matching closing }
        depth = 1
        i = brace_start + 1
        in_string = None
        escaped = False
        while i < len(text) and depth > 0:
            c = text[i]
            if escaped:
                escaped = False
                i += 1
                continue
            if c == '\\':
                escaped = True
                i += 1
                continue
            if c in ("'", '"', '`'):
                if in_string is None:
                    in_string = c
                elif in_string == c:
                    in_string = None
                i += 1
                continue
            if in_string is None:
                if c == '{':
                    depth += 1
                elif c == '}':
                    depth -= 1
            i += 1

        block = text[brace_start:i]
        entries.append((key, block))
        pos = i

        # Check if we've hit the end of the object (};)
        remaining = text[pos:pos+20].strip()
        if remaining.startswith('};') or remaining.startswith('}'):
            # Check if this is the object end
            after_comma = text[pos:pos+50].strip()
            if after_comma.startswith('};'):
                break

    return entries

def extract_js_string(block, key):
    """Extract a JS string value for a given key from a block."""
    # Try template literal first
    pattern = re.compile(key + r"""\s*:\s*`((?:[^`\\]|\\.)*)""" + '`', re.DOTALL)
    m = pattern.search(block)
    if m:
        return m.group(1).replace('\\`', '`').replace("\\'", "'")

    # Try single-quoted string
    pattern = re.compile(key + r"""\s*:\s*'((?:[^'\\]|\\.)*)'""", re.DOTALL)
    m = pattern.search(block)
    if m:
        return m.group(1).replace("\\'", "'").replace('\\"', '"')

    # Try double-quoted string
    pattern = re.compile(key + r"""\s*:\s*"((?:[^"\\]|\\.)*)" """, re.DOTALL)
    m = pattern.search(block)
    if m:
        return m.group(1).replace('\\"', '"')

    return None

def extract_js_array(block, key):
    """Extract a JS array for a given key from a block, returned as raw text."""
    pattern = re.compile(key + r'\s*:\s*\[', re.DOTALL)
    m = pattern.search(block)
    if not m:
        return '[]'

    start = m.end() - 1  # position of [
    depth = 1
    i = start + 1
    in_string = None
    escaped = False
    while i < len(block) and depth > 0:
        c = block[i]
        if escaped:
            escaped = False
            i += 1
            continue
        if c == '\\':
            escaped = True
            i += 1
            continue
        if c in ("'", '"', '`'):
            if in_string is None:
                in_string = c
            elif in_string == c:
                in_string = None
            i += 1
            continue
        if in_string is None:
            if c == '[':
                depth += 1
            elif c == ']':
                depth -= 1
        i += 1

    return block[start:i]

def parse_sql_dataset(key, block):
    """Parse a single SQL_DATASETS entry."""
    label = extract_js_string(block, 'label')
    question = extract_js_string(block, 'question')
    default_query = extract_js_string(block, 'defaultQuery') or '-- Write your SQL here\n'

    # Parse hints array
    hints_raw = extract_js_array(block, 'hints')
    # Extract individual hint strings
    hints = []
    for hm in re.finditer(r"'((?:[^'\\]|\\.)*)'", hints_raw):
        hints.append(hm.group(1).replace("\\'", "'"))

    # Parse schema array
    schema_raw = extract_js_array(block, 'schema')
    # Convert JS schema to JSON-compatible format
    schema = []
    for table_match in re.finditer(r'\{\s*name:\s*[\'"]([^"\']+)[\'"],\s*columns:\s*\[(.*?)\]\s*\}', schema_raw, re.DOTALL):
        table_name = table_match.group(1)
        cols_raw = table_match.group(2)
        columns = []
        for col_match in re.finditer(r'\{\s*name:\s*[\'"]([^"\']+)[\'"],\s*type:\s*[\'"]([^"\']+)[\'"]\s*\}', cols_raw):
            columns.append({'name': col_match.group(1), 'type': col_match.group(2)})
        schema.append({'name': table_name, 'columns': columns})

    # Parse setup SQL (inside setup: { shared: `...` })
    setup_sql = extract_js_string(block, 'shared')

    return {
        'question_id': key,
        'label': label,
        'question_html': question,
        'default_query': default_query,
        'hints': json.dumps(hints),
        'schema_json': json.dumps(schema),
        'setup_sql': setup_sql or '',
    }

def parse_python_dataset(key, block):
    """Parse a single PYTHON_DATASETS entry."""
    label = extract_js_string(block, 'label')
    question = extract_js_string(block, 'question')
    default_query = extract_js_string(block, 'defaultQuery') or '# Write your Python here\n'

    hints = []
    hints_raw = extract_js_array(block, 'hints')
    for hm in re.finditer(r"'((?:[^'\\]|\\.)*)'", hints_raw):
        hints.append(hm.group(1).replace("\\'", "'"))

    schema_raw = extract_js_array(block, 'schema')
    schema = []
    for table_match in re.finditer(r'\{\s*name:\s*[\'"]([^"\']+)[\'"],\s*columns:\s*\[(.*?)\]\s*\}', schema_raw, re.DOTALL):
        table_name = table_match.group(1)
        cols_raw = table_match.group(2)
        columns = []
        for col_match in re.finditer(r'\{\s*name:\s*[\'"]([^"\']+)[\'"],\s*type:\s*[\'"]([^"\']+)[\'"]\s*\}', cols_raw):
            columns.append({'name': col_match.group(1), 'type': col_match.group(2)})
        schema.append({'name': table_name, 'columns': columns})

    setup_code = extract_js_string(block, 'setupCode')

    return {
        'question_id': key,
        'label': label,
        'question_html': question,
        'default_query': default_query,
        'hints': json.dumps(hints),
        'schema_json': json.dumps(schema),
        'setup_code': setup_code or '',
    }

# ─── 3. Parse CASE_PROMPTS from practice-content.js ───

def parse_case_prompts(js_content):
    """Extract CASE_PROMPTS entries."""
    match = re.search(r'const CASE_PROMPTS\s*=\s*\{', js_content)
    if not match:
        return {}

    prompts = {}
    start = match.end()

    # Find key: 'value' or key: `value` patterns
    pos = start
    while pos < len(js_content):
        # Find next key
        key_match = re.search(r"(\w+)\s*:\s*(['\"`])", js_content[pos:])
        if not key_match:
            break

        key = key_match.group(1)
        quote = key_match.group(2)
        str_start = pos + key_match.end()

        # Find end of string
        if quote == '`':
            # Template literal
            i = str_start
            escaped = False
            while i < len(js_content):
                if escaped:
                    escaped = False
                    i += 1
                    continue
                if js_content[i] == '\\':
                    escaped = True
                    i += 1
                    continue
                if js_content[i] == '`':
                    break
                i += 1
            value = js_content[str_start:i].replace('\\`', '`')
            pos = i + 1
        else:
            # Single or double quoted
            i = str_start
            escaped = False
            while i < len(js_content):
                if escaped:
                    escaped = False
                    i += 1
                    continue
                if js_content[i] == '\\':
                    escaped = True
                    i += 1
                    continue
                if js_content[i] == quote:
                    break
                i += 1
            value = js_content[str_start:i].replace("\\'", "'").replace('\\"', '"')
            pos = i + 1

        prompts[key] = value

        # Check if we've hit the end (};)
        remaining = js_content[pos:pos+20].strip()
        if remaining.startswith('};'):
            break

    return prompts

def parse_solutions(js_content, const_name):
    """Extract solution entries from a const like PUZZLE_SOLUTIONS, etc."""
    match = re.search(r'const\s+' + const_name + r'\s*=\s*\{', js_content)
    if not match:
        return {}

    solutions = {}
    start = match.end()
    pos = start

    while pos < len(js_content):
        # Find next key
        key_match = re.search(r"(\w+)\s*:\s*`", js_content[pos:])
        if not key_match:
            break

        key = key_match.group(1)
        str_start = pos + key_match.end()

        # Find end of template literal
        i = str_start
        escaped = False
        while i < len(js_content):
            if escaped:
                escaped = False
                i += 1
                continue
            if js_content[i] == '\\':
                escaped = True
                i += 1
                continue
            if js_content[i] == '`':
                break
            i += 1

        value = js_content[str_start:i]
        solutions[key] = value
        pos = i + 1

        # Check if we've hit the end
        remaining = js_content[pos:pos+20].strip()
        if remaining.startswith('};'):
            break

    return solutions

# ─── 4. Parse TEST_CASES ───

def parse_test_cases(html):
    """Extract TEST_CASES entries. These are complex - some have expectedQuery, some have check functions."""
    match = re.search(r'const TEST_CASES\s*=\s*\{', html)
    if not match:
        return {}

    # Find the end of TEST_CASES object
    start = match.end()
    depth = 1
    i = start
    in_string = None
    escaped = False
    while i < len(html) and depth > 0:
        c = html[i]
        if escaped:
            escaped = False
            i += 1
            continue
        if c == '\\':
            escaped = True
            i += 1
            continue
        if c in ("'", '"', '`'):
            if in_string is None:
                in_string = c
            elif in_string == c:
                in_string = None
            i += 1
            continue
        if in_string is None:
            if c == '{':
                depth += 1
            elif c == '}':
                depth -= 1
        i += 1

    obj_text = html[match.start():i]

    test_cases = {}
    # For each key: [ ... ] array
    key_pattern = re.compile(r'(\w+)\s*:\s*\[', re.DOTALL)
    pos = len('const TEST_CASES = {')

    for km in key_pattern.finditer(obj_text, pos):
        key = km.group(1)
        arr_start = km.end() - 1

        # Find matching ]
        depth = 1
        j = arr_start + 1
        in_str = None
        esc = False
        while j < len(obj_text) and depth > 0:
            c = obj_text[j]
            if esc:
                esc = False
                j += 1
                continue
            if c == '\\':
                esc = True
                j += 1
                continue
            if c in ("'", '"', '`'):
                if in_str is None:
                    in_str = c
                elif in_str == c:
                    in_str = None
                j += 1
                continue
            if in_str is None:
                if c == '[':
                    depth += 1
                elif c == ']':
                    depth -= 1
            j += 1

        arr_text = obj_text[arr_start:j]

        # Parse individual test entries within the array
        tests = []
        # Find each { ... } in the array
        entry_depth = 0
        entry_start = None
        k = 1  # skip [
        in_s = None
        es = False
        while k < len(arr_text) - 1:
            c = arr_text[k]
            if es:
                es = False
                k += 1
                continue
            if c == '\\':
                es = True
                k += 1
                continue
            if c in ("'", '"', '`'):
                if in_s is None:
                    in_s = c
                elif in_s == c:
                    in_s = None
                k += 1
                continue
            if in_s is None:
                if c == '{':
                    if entry_depth == 0:
                        entry_start = k
                    entry_depth += 1
                elif c == '}':
                    entry_depth -= 1
                    if entry_depth == 0 and entry_start is not None:
                        entry_text = arr_text[entry_start:k+1]
                        tests.append(entry_text)
                        entry_start = None
            k += 1

        test_cases[key] = tests

    return test_cases

def parse_single_test(entry_text):
    """Parse a single test case entry into structured data."""
    result = {}

    # Extract name
    name_match = re.search(r"name:\s*'((?:[^'\\]|\\.)*)'", entry_text)
    if not name_match:
        name_match = re.search(r'name:\s*"((?:[^"\\]|\\.)*)"', entry_text)
    if name_match:
        result['name'] = name_match.group(1)

    # Extract expectedQuery
    eq_match = re.search(r'expectedQuery:\s*`((?:[^`\\]|\\.)*)`', entry_text, re.DOTALL)
    if eq_match:
        result['expectedQuery'] = eq_match.group(1)

    # Extract minMatchRatio
    mmr_match = re.search(r'minMatchRatio:\s*([\d.]+)', entry_text)
    if mmr_match:
        result['minMatchRatio'] = float(mmr_match.group(1))

    # Extract failMsg
    fm_match = re.search(r"failMsg:\s*'((?:[^'\\]|\\.)*)'", entry_text)
    if fm_match:
        result['failMsg'] = fm_match.group(1)

    # Extract maxRows
    mr_match = re.search(r'maxRows:\s*(\d+)', entry_text)
    if mr_match:
        result['maxRows'] = int(mr_match.group(1))

    # Extract minCols
    mc_match = re.search(r'minCols:\s*(\d+)', entry_text)
    if mc_match:
        result['minCols'] = int(mc_match.group(1))

    # Check for check function
    if 'check(' in entry_text or 'check (' in entry_text:
        # Extract the check function body
        check_match = re.search(r'check\s*\(\s*\w+\s*\)\s*\{', entry_text)
        if check_match:
            # Find matching }
            start = check_match.end() - 1
            depth = 1
            j = start + 1
            while j < len(entry_text) and depth > 0:
                if entry_text[j] == '{':
                    depth += 1
                elif entry_text[j] == '}':
                    depth -= 1
                j += 1
            result['check_function'] = entry_text[check_match.start():j]

    return result

# ─── 5. Parse FACTOR_TREE_DATA ───

def parse_factor_trees(js_content):
    """Extract FACTOR_TREE_DATA entries as JSON strings."""
    match = re.search(r'/\*\s*FRAMEWORK_REGISTRY:FACTOR_TREE_DATA:START\s*\*/', js_content)
    if not match:
        # Try alternative
        match = re.search(r'const\s+FACTOR_TREE_DATA\s*=\s*\{', js_content)

    if not match:
        return {}

    # Find the FACTOR_TREE_DATA object
    ft_match = re.search(r'(?:const|var|let)\s+FACTOR_TREE_DATA\s*=\s*\{', js_content[match.start():])
    if not ft_match:
        return {}

    obj_start = match.start() + ft_match.end()

    trees = {}
    pos = obj_start

    while pos < len(js_content):
        # Find next key: { pattern (keys may be quoted with ' or unquoted)
        key_match = re.search(r"(?:'(\w+)'|(\w+))\s*:\s*\{", js_content[pos:])
        if not key_match:
            break

        key = key_match.group(1) or key_match.group(2)
        brace_start = pos + key_match.end() - 1

        # Find matching }
        depth = 1
        i = brace_start + 1
        in_str = None
        esc = False
        while i < len(js_content) and depth > 0:
            c = js_content[i]
            if esc:
                esc = False
                i += 1
                continue
            if c == '\\':
                esc = True
                i += 1
                continue
            if c in ("'", '"', '`'):
                if in_str is None:
                    in_str = c
                elif in_str == c:
                    in_str = None
                i += 1
                continue
            if in_str is None:
                if c == '{':
                    depth += 1
                elif c == '}':
                    depth -= 1
            i += 1

        block = js_content[brace_start:i]
        trees[key] = block
        pos = i

        remaining = js_content[pos:pos+20].strip()
        if remaining.startswith('};'):
            break

    return trees

# ─── Main ───

def main():
    html = read_file(PRACTICE_HTML)
    js_content = read_file(CONTENT_JS)

    out = open('migration.sql', 'w', encoding='utf-8')

    # 1. PROMPTS → questions table
    print("Parsing PROMPTS...")
    prompts = parse_prompts(html)
    print(f"  Found {len(prompts)} questions")

    out.write("-- ═══ questions table ═══\n")
    for i, p in enumerate(prompts):
        fw = sql_escape(p['framework']) if p['framework'] else 'NULL'
        out.write(f"INSERT INTO questions (id, title, topic, difficulty, tag, framework, sort_order) VALUES ({sql_escape(p['id'])}, {sql_escape(p['title'])}, {sql_escape(p['topic'])}, {sql_escape(p['difficulty'])}, {sql_escape(p['tag'])}, {fw}, {i});\n")

    # 2. SQL_DATASETS → sql_datasets table
    print("Parsing SQL_DATASETS...")
    # Extract the SQL_DATASETS section manually
    sql_ds_match = re.search(r'const SQL_DATASETS\s*=\s*\{', html)
    if sql_ds_match:
        # Find end
        start = sql_ds_match.end()
        depth = 1
        i = start
        in_str = None
        esc = False
        while i < len(html) and depth > 0:
            c = html[i]
            if esc:
                esc = False
                i += 1
                continue
            if c == '\\':
                esc = True
                i += 1
                continue
            if c in ("'", '"', '`'):
                if in_str is None:
                    in_str = c
                elif in_str == c:
                    in_str = None
                i += 1
                continue
            if in_str is None:
                if c == '{':
                    depth += 1
                elif c == '}':
                    depth -= 1
            i += 1

        sql_ds_text = html[sql_ds_match.start():i]

        # Parse entries
        entries = parse_object_entries(html[:i], 'SQL_DATASETS')
        print(f"  Found {len(entries)} SQL datasets")

        out.write("\n-- ═══ sql_datasets table ═══\n")
        for key, block in entries:
            ds = parse_sql_dataset(key, block)
            out.write(f"INSERT INTO sql_datasets (question_id, label, question_html, default_query, hints, schema_json, setup_sql) VALUES ({sql_escape(ds['question_id'])}, {sql_escape(ds['label'])}, {sql_escape(ds['question_html'])}, {sql_escape(ds['default_query'])}, {sql_escape(ds['hints'])}, {sql_escape(ds['schema_json'])}, {sql_escape(ds['setup_sql'])});\n")

    # 3. PYTHON_DATASETS → python_datasets table
    print("Parsing PYTHON_DATASETS...")
    py_entries = parse_object_entries(html, 'PYTHON_DATASETS')
    print(f"  Found {len(py_entries)} Python datasets")

    out.write("\n-- ═══ python_datasets table ═══\n")
    for key, block in py_entries:
        ds = parse_python_dataset(key, block)
        out.write(f"INSERT INTO python_datasets (question_id, label, question_html, default_query, hints, schema_json, setup_code) VALUES ({sql_escape(ds['question_id'])}, {sql_escape(ds['label'])}, {sql_escape(ds['question_html'])}, {sql_escape(ds['default_query'])}, {sql_escape(ds['hints'])}, {sql_escape(ds['schema_json'])}, {sql_escape(ds['setup_code'])});\n")

    # 4. CASE_PROMPTS → case_prompts table
    print("Parsing CASE_PROMPTS...")
    case_prompts = parse_case_prompts(js_content)
    print(f"  Found {len(case_prompts)} case prompts")

    out.write("\n-- ═══ case_prompts table ═══\n")
    for key, value in case_prompts.items():
        out.write(f"INSERT INTO case_prompts (question_id, prompt) VALUES ({sql_escape(key)}, {sql_escape(value)});\n")

    # 5. Solutions
    print("Parsing PUZZLE_SOLUTIONS...")
    puzzle_solutions = parse_solutions(js_content, 'PUZZLE_SOLUTIONS')
    print(f"  Found {len(puzzle_solutions)} puzzle solutions")

    print("Parsing GUESSTIMATE_SOLUTIONS...")
    guess_solutions = parse_solutions(js_content, 'GUESSTIMATE_SOLUTIONS')
    print(f"  Found {len(guess_solutions)} guesstimate solutions")

    print("Parsing CASESTUDY_SOLUTIONS...")
    case_solutions = parse_solutions(js_content, 'CASESTUDY_SOLUTIONS')
    print(f"  Found {len(case_solutions)} case study solutions")

    out.write("\n-- ═══ solutions table ═══\n")
    for key, value in puzzle_solutions.items():
        out.write(f"INSERT INTO solutions (question_id, solution_type, solution) VALUES ({sql_escape(key)}, 'puzzle', {sql_escape(value)});\n")
    for key, value in guess_solutions.items():
        out.write(f"INSERT INTO solutions (question_id, solution_type, solution) VALUES ({sql_escape(key)}, 'guesstimate', {sql_escape(value)});\n")
    for key, value in case_solutions.items():
        out.write(f"INSERT INTO solutions (question_id, solution_type, solution) VALUES ({sql_escape(key)}, 'casestudy', {sql_escape(value)});\n")

    # 6. TEST_CASES
    print("Parsing TEST_CASES...")
    test_cases = parse_test_cases(html)
    total_tests = sum(len(v) for v in test_cases.values())
    print(f"  Found {len(test_cases)} question test suites, {total_tests} total tests")

    out.write("\n-- ═══ test_cases table ═══\n")
    for question_id, tests in test_cases.items():
        for idx, test_text in enumerate(tests):
            tc = parse_single_test(test_text)
            name = sql_escape(tc.get('name', f'Test {idx+1}'))
            eq = sql_escape(tc.get('expectedQuery')) if 'expectedQuery' in tc else 'NULL'
            mmr = str(tc.get('minMatchRatio', 'NULL')) if 'minMatchRatio' in tc else 'NULL'
            fm = sql_escape(tc.get('failMsg')) if 'failMsg' in tc else 'NULL'
            mr = str(tc.get('maxRows')) if 'maxRows' in tc else 'NULL'
            mc = str(tc.get('minCols')) if 'minCols' in tc else 'NULL'
            cf = sql_escape(tc.get('check_function')) if 'check_function' in tc else 'NULL'
            out.write(f"INSERT INTO test_cases (question_id, test_index, name, expected_query, min_match_ratio, fail_msg, max_rows, min_cols, check_function) VALUES ({sql_escape(question_id)}, {idx}, {name}, {eq}, {mmr}, {fm}, {mr}, {mc}, {cf});\n")

    # 7. FACTOR_TREE_DATA
    print("Parsing FACTOR_TREE_DATA...")
    factor_trees = parse_factor_trees(js_content)
    print(f"  Found {len(factor_trees)} factor trees")

    out.write("\n-- ═══ factor_trees table ═══\n")
    for key, value in factor_trees.items():
        out.write(f"INSERT INTO factor_trees (question_id, tree_data) VALUES ({sql_escape(key)}, {sql_escape(value)});\n")

    out.close()

    # Summary
    print(f"\n{'='*50}")
    print(f"Migration SQL written to migration.sql")
    print(f"  Questions: {len(prompts)}")
    print(f"  SQL Datasets: {len(entries) if sql_ds_match else 0}")
    print(f"  Python Datasets: {len(py_entries)}")
    print(f"  Case Prompts: {len(case_prompts)}")
    print(f"  Puzzle Solutions: {len(puzzle_solutions)}")
    print(f"  Guesstimate Solutions: {len(guess_solutions)}")
    print(f"  Case Study Solutions: {len(case_solutions)}")
    print(f"  Test Cases: {total_tests} across {len(test_cases)} questions")
    print(f"  Factor Trees: {len(factor_trees)}")

if __name__ == '__main__':
    main()
