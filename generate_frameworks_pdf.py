"""
Alok The Analyst — Case Interview Frameworks PDF
Brand: #2563eb accent, #0f172a headings, #f8faff bg, clean minimal style
Fonts: Helvetica (PDF substitute for DM Sans), Courier (for JetBrains Mono)

Structure: Each framework → beginner explanation → solved example (inline)
"""
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_RIGHT
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether
)
from reportlab.lib.colors import HexColor

# ── Brand Palette (matches aloktheanalyst.com) ───────────────
ACCENT    = HexColor('#2563eb')
ACCENT2   = HexColor('#1d4ed8')
DARK      = HexColor('#0f172a')   # headings
TEXT      = HexColor('#334155')   # body
MUTED     = HexColor('#64748b')   # secondary text
BG        = HexColor('#f8faff')   # page bg tint
SURFACE   = HexColor('#ffffff')   # cards
SURFACE2  = HexColor('#f0f5ff')   # subtle highlight
BORDER    = HexColor('#e2e8f2')   # borders
BG3       = HexColor('#eef2f9')   # alternate rows
GREEN     = HexColor('#16a34a')
GREEN_L   = HexColor('#f0fdf4')
ORANGE    = HexColor('#f97316')
ORANGE_L  = HexColor('#fff7ed')
PURPLE    = HexColor('#7c3aed')
PURPLE_L  = HexColor('#f5f3ff')
RED       = HexColor('#ef4444')
RED_L     = HexColor('#fef2f2')
TEAL      = HexColor('#0891b2')
YELLOW_L  = HexColor('#fefce8')
WHITE     = HexColor('#ffffff')

W, H = A4
OUT = r"A:\Alok The Analyst - website\aloktheanalyst-website\.claude\worktrees\lucid-sanderson\Alok_The_Analyst_Case_Interview_Frameworks.pdf"
CW = W - 30*mm  # content width

# ── Styles ────────────────────────────────────────────────────
def S():
    d = {}
    d['body']     = ParagraphStyle('body', fontName='Helvetica', fontSize=8.5, leading=13, textColor=TEXT)
    d['body_b']   = ParagraphStyle('body_b', fontName='Helvetica-Bold', fontSize=8.5, leading=13, textColor=TEXT)
    d['muted']    = ParagraphStyle('muted', fontName='Helvetica-Oblique', fontSize=8, leading=12, textColor=MUTED)
    d['code']     = ParagraphStyle('code', fontName='Courier', fontSize=7.5, leading=11, textColor=TEXT)
    d['h3']       = ParagraphStyle('h3', fontName='Helvetica-Bold', fontSize=10.5, leading=14, textColor=DARK, spaceAfter=3)
    d['h4']       = ParagraphStyle('h4', fontName='Helvetica-Bold', fontSize=9, leading=13, textColor=ACCENT, spaceAfter=2, spaceBefore=6)
    d['bullet']   = ParagraphStyle('bullet', fontName='Helvetica', fontSize=8.5, leading=13, textColor=TEXT, leftIndent=12)
    d['sub_bul']  = ParagraphStyle('sub_bul', fontName='Helvetica', fontSize=8, leading=12, textColor=MUTED, leftIndent=24)
    d['tip']      = ParagraphStyle('tip', fontName='Helvetica-Oblique', fontSize=8, leading=12, textColor=ACCENT)
    return d


# ── Helpers ───────────────────────────────────────────────────
def section_label(text):
    style = ParagraphStyle('sl', fontName='Courier', fontSize=7, leading=10,
                           textColor=ACCENT, letterSpacing=3)
    return Paragraph(f'// {text.upper()}', style)


def section_title(text):
    style = ParagraphStyle('st', fontName='Helvetica-Bold', fontSize=18, leading=22,
                           textColor=DARK, spaceAfter=6)
    return Paragraph(text, style)


def accent_bar():
    t = Table([['']],  colWidths=[CW], rowHeights=[3])
    t.setStyle(TableStyle([('BACKGROUND', (0,0), (-1,-1), ACCENT)]))
    return t


def card(rows, col_widths=None, header_bg=None):
    cw = col_widths or [CW]
    t = Table(rows, colWidths=cw)
    styles = [
        ('BACKGROUND', (0,0), (-1,-1), WHITE),
        ('TOPPADDING', (0,0), (-1,-1), 7),
        ('BOTTOMPADDING', (0,0), (-1,-1), 7),
        ('LEFTPADDING', (0,0), (-1,-1), 10),
        ('RIGHTPADDING', (0,0), (-1,-1), 10),
        ('BOX', (0,0), (-1,-1), 0.6, BORDER),
        ('LINEBELOW', (0,0), (-1,-2), 0.3, BORDER),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]
    if header_bg:
        styles.append(('BACKGROUND', (0,0), (-1,0), header_bg))
    t.setStyle(TableStyle(styles))
    return t


def tint_box(content_para, bg=SURFACE2, border_color=None):
    t = Table([[content_para]], colWidths=[CW])
    bc = border_color or BORDER
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), bg),
        ('TOPPADDING',  (0,0), (-1,-1), 8),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
        ('LEFTPADDING', (0,0), (-1,-1), 12),
        ('RIGHTPADDING', (0,0), (-1,-1), 12),
        ('BOX', (0,0), (-1,-1), 0.5, bc),
    ]))
    return t


def code_box(lines):
    style = ParagraphStyle('cb', fontName='Courier', fontSize=7.5, leading=11, textColor=DARK)
    text = '<br/>'.join(lines)
    t = Table([[Paragraph(text, style)]], colWidths=[CW])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), BG),
        ('TOPPADDING',  (0,0), (-1,-1), 9),
        ('BOTTOMPADDING', (0,0), (-1,-1), 9),
        ('LEFTPADDING', (0,0), (-1,-1), 12),
        ('RIGHTPADDING', (0,0), (-1,-1), 12),
        ('BOX', (0,0), (-1,-1), 0.5, BORDER),
    ]))
    return t


def pill(text, color=ACCENT):
    style = ParagraphStyle('pill', fontName='Courier', fontSize=6.5, textColor=color, leading=9)
    return Paragraph(text.upper(), style)


def bul(text, s):
    return Paragraph(f'<b>&bull;</b>  {text}', s['bullet'])


def tip_box(text, s):
    """Pro tip box"""
    t = Table([[Paragraph(f'<b>Pro tip:</b>  {text}', s['tip'])]], colWidths=[CW])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), SURFACE2),
        ('TOPPADDING',  (0,0), (-1,-1), 7),
        ('BOTTOMPADDING', (0,0), (-1,-1), 7),
        ('LEFTPADDING', (0,0), (-1,-1), 12),
        ('BOX', (0,0), (-1,-1), 0.5, ACCENT),
        ('LINEBEFORE', (0,0), (0,-1), 3, ACCENT),
    ]))
    return t


def mistake_box(text, s):
    """Common mistake warning"""
    t = Table([[Paragraph(f'<b>Common mistake:</b>  {text}', ParagraphStyle('ms', fontName='Helvetica', fontSize=8, leading=12, textColor=HexColor('#b91c1c')))]], colWidths=[CW])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), RED_L),
        ('TOPPADDING',  (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('LEFTPADDING', (0,0), (-1,-1), 12),
        ('BOX', (0,0), (-1,-1), 0.5, RED),
        ('LINEBEFORE', (0,0), (0,-1), 3, RED),
    ]))
    return t


def example_block(s, framework, question, steps, answer, insight, color=ACCENT):
    """Solved example in clean card style — placed inline after framework"""
    items = []
    # Header
    hdr_s = ParagraphStyle('eh', fontName='Helvetica-Bold', fontSize=9, textColor=WHITE)
    tag_s = ParagraphStyle('et', fontName='Courier', fontSize=7, textColor=HexColor('#bfdbfe'))
    hdr = Table([[Paragraph(framework, hdr_s), Paragraph('SOLVED EXAMPLE', tag_s)]],
                colWidths=[CW*0.7, CW*0.3])
    hdr.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), color),
        ('TOPPADDING', (0,0), (-1,-1), 7), ('BOTTOMPADDING', (0,0), (-1,-1), 7),
        ('LEFTPADDING', (0,0), (0,-1), 12), ('RIGHTPADDING', (-1,0), (-1,-1), 12),
        ('ALIGN', (-1,0), (-1,-1), 'RIGHT'), ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    items.append(hdr)

    # Question
    q_s = ParagraphStyle('eq', fontName='Helvetica-Bold', fontSize=9, textColor=DARK, leading=13)
    q_t = Table([[Paragraph(f'Q: {question}', q_s)]], colWidths=[CW])
    q_t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), SURFACE2),
        ('TOPPADDING', (0,0), (-1,-1), 8), ('BOTTOMPADDING', (0,0), (-1,-1), 8),
        ('LEFTPADDING', (0,0), (-1,-1), 12),
    ]))
    items.append(q_t)

    # Steps
    step_s = ParagraphStyle('es', fontName='Helvetica-Bold', fontSize=7.5, textColor=color)
    body_s = ParagraphStyle('eb', fontName='Helvetica', fontSize=8, leading=12, textColor=TEXT)
    step_rows = [[Paragraph(lbl, step_s), Paragraph(val, body_s)] for lbl, val in steps]
    st_t = Table(step_rows, colWidths=[30*mm, CW-30*mm])
    st_t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (0,-1), BG),
        ('BACKGROUND', (1,0), (1,-1), WHITE),
        ('TOPPADDING', (0,0), (-1,-1), 5), ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('LINEBELOW', (0,0), (-1,-2), 0.3, BORDER),
        ('BOX', (0,0), (-1,-1), 0.5, BORDER),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))
    items.append(st_t)

    # Answer
    ans_s = ParagraphStyle('ea', fontName='Helvetica', fontSize=8, leading=12, textColor=TEXT)
    ans_t = Table([[Paragraph(f'<b>Answer:</b>  {answer}', ans_s)]], colWidths=[CW])
    ans_t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), GREEN_L),
        ('TOPPADDING', (0,0), (-1,-1), 8), ('BOTTOMPADDING', (0,0), (-1,-1), 8),
        ('LEFTPADDING', (0,0), (-1,-1), 12),
        ('BOX', (0,0), (-1,-1), 0.5, GREEN),
    ]))
    items.append(ans_t)

    # Insight
    ins_s = ParagraphStyle('ei', fontName='Helvetica-Bold', fontSize=8, textColor=GREEN)
    items.append(Table([[Paragraph(f'Key Insight:  {insight}', ins_s)]], colWidths=[CW]))
    items.append(Spacer(1, 10))
    return items


# ── Page template ─────────────────────────────────────────────
def header_footer(canvas, doc):
    canvas.saveState()
    pw, ph = doc.pagesize
    if doc.page == 1:
        canvas.restoreState()
        return
    # Top line
    canvas.setStrokeColor(BORDER)
    canvas.setLineWidth(0.5)
    canvas.line(15*mm, ph - 18*mm, pw - 15*mm, ph - 18*mm)
    # Header text
    canvas.setFont('Courier', 7)
    canvas.setFillColor(ACCENT)
    canvas.drawString(15*mm, ph - 16*mm, '// ALOK THE ANALYST')
    canvas.setFillColor(MUTED)
    canvas.setFont('Helvetica', 7)
    canvas.drawRightString(pw - 15*mm, ph - 16*mm, 'Case Interview Frameworks')
    # Footer
    canvas.setStrokeColor(BORDER)
    canvas.line(15*mm, 12*mm, pw - 15*mm, 12*mm)
    canvas.setFillColor(MUTED)
    canvas.setFont('Helvetica', 7)
    canvas.drawString(15*mm, 6*mm, 'aloktheanalyst.com')
    canvas.setFillColor(ACCENT)
    canvas.setFont('Helvetica-Bold', 7)
    canvas.drawRightString(pw - 15*mm, 6*mm, f'{doc.page - 1}')
    canvas.restoreState()


# ══════════════════════════════════════════════════════════════
# BUILD
# ══════════════════════════════════════════════════════════════
def build():
    doc = SimpleDocTemplate(OUT, pagesize=A4,
        leftMargin=15*mm, rightMargin=15*mm,
        topMargin=24*mm, bottomMargin=18*mm,
        title='Case Interview Frameworks — Alok The Analyst',
        author='Alok The Analyst')

    s = S()
    story = []

    # ══ COVER ═════════════════════════════════════════════════
    story.append(Spacer(1, 25*mm))
    story.append(accent_bar())
    story.append(Spacer(1, 10*mm))

    cv_label = ParagraphStyle('cvl', fontName='Courier', fontSize=8, textColor=ACCENT, leading=12)
    cv_title = ParagraphStyle('cvt', fontName='Helvetica-Bold', fontSize=38, leading=42, textColor=DARK)
    cv_sub   = ParagraphStyle('cvs', fontName='Helvetica-Bold', fontSize=16, leading=22, textColor=ACCENT)
    cv_desc  = ParagraphStyle('cvd', fontName='Helvetica', fontSize=10.5, leading=16, textColor=MUTED)

    story.append(Paragraph('// CASE INTERVIEW PREP', cv_label))
    story.append(Spacer(1, 4*mm))
    story.append(Paragraph('CASE INTERVIEW', cv_title))
    story.append(Paragraph('FRAMEWORKS', cv_title))
    story.append(Spacer(1, 5*mm))
    story.append(Paragraph('Complete Reference Guide', cv_sub))
    story.append(Spacer(1, 8*mm))

    desc = tint_box(Paragraph(
        'Every framework you need for consulting, analytics, and data analyst interviews. '
        'Each framework includes beginner-friendly explanations, step-by-step approach, common mistakes to avoid, '
        'and a <b>solved example with Indian business context</b> right after each section.',
        cv_desc), bg=SURFACE2, border_color=ACCENT)
    story.append(desc)
    story.append(Spacer(1, 20*mm))

    # Brand footer
    brand_row = [[
        Paragraph('<b>Alok The Analyst</b>', ParagraphStyle('bf', fontName='Helvetica-Bold', fontSize=13, textColor=WHITE)),
        Paragraph('aloktheanalyst.com  |  @aloktheanalyst', ParagraphStyle('bu', fontName='Courier', fontSize=8.5, textColor=HexColor('#93c5fd'), alignment=TA_RIGHT)),
    ]]
    brand_t = Table(brand_row, colWidths=[CW*0.5, CW*0.5])
    brand_t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), ACCENT),
        ('TOPPADDING', (0,0), (-1,-1), 12), ('BOTTOMPADDING', (0,0), (-1,-1), 12),
        ('LEFTPADDING', (0,0), (0,-1), 16), ('RIGHTPADDING', (-1,0), (-1,-1), 16),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(brand_t)
    story.append(PageBreak())

    # ═════════════════════════════════════════════════════════
    # TABLE OF CONTENTS
    # ═════════════════════════════════════════════════════════
    story.append(section_label('Contents'))
    story.append(section_title('TABLE OF CONTENTS'))
    story.append(Spacer(1, 4))

    toc = [
        ('01', 'Master Problem-Solving Approach', '4 Core Tools + 3-Question Repetition'),
        ('02', 'Profitability Framework', 'Revenue vs Cost decomposition + Example'),
        ('03', 'Business Situation Framework', 'Customer, Product, Company, Competition + Example'),
        ('04', 'Market Entry Framework', '4 Lenses + Example'),
        ('05', 'M&A Framework', 'Market, Target, Buyer, Synergies + Example'),
        ('06', 'Pricing Framework', 'Cost / Value / Competitor lenses + Example'),
        ('07', "Porter's 5 Forces", 'Industry analysis + Example'),
        ('08', '4Ps + 3Cs', 'Marketing mix + Strategic overview'),
        ('09', 'Market Sizing', 'Top-Down, Bottom-Up + Example'),
        ('10', 'Root Cause Analysis', 'RCA decomposition + Example'),
        ('11', 'AARRR / North Star', 'Product metrics + Example'),
        ('12', 'Growth, Cost & Break-Even', 'Ansoff, cost structure + Example'),
        ('13', 'Finance Formulas + Math', 'Must-know formulas + mental math shortcuts'),
        ('14', 'Data Interpretation + Brainstorming', 'Chart analysis + MECE brainstorm'),
        ('15', 'Synthesis / Close', 'How to deliver your final recommendation'),
        ('16', 'Quick Reference Table', 'Which framework for which case type'),
    ]

    num_s = ParagraphStyle('tn', fontName='Courier', fontSize=9, textColor=ACCENT)
    title_s = ParagraphStyle('tt', fontName='Helvetica-Bold', fontSize=9, textColor=DARK)
    desc_s  = ParagraphStyle('td', fontName='Helvetica', fontSize=8, textColor=MUTED)
    toc_rows = [[Paragraph(n, num_s), Paragraph(t, title_s), Paragraph(d, desc_s)] for n, t, d in toc]

    toc_t = Table(toc_rows, colWidths=[14*mm, 72*mm, CW-86*mm])
    toc_t.setStyle(TableStyle([
        ('TOPPADDING', (0,0), (-1,-1), 5), ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('LINEBELOW', (0,0), (-1,-2), 0.3, BORDER),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(toc_t)
    story.append(PageBreak())

    # ═════════════════════════════════════════════════════════
    # HOW TO USE THIS GUIDE
    # ═════════════════════════════════════════════════════════
    story.append(section_label('Start Here'))
    story.append(section_title('HOW TO USE THIS GUIDE'))
    story.append(accent_bar())
    story.append(Spacer(1, 6))

    steps_intro = [
        ('Step 1', 'Read the Master Approach first — it applies to every single case, regardless of the topic.'),
        ('Step 2', 'Learn the 6 Core Frameworks — Profitability, Business Situation, Market Entry, M&A, Pricing, Porter\'s 5 Forces.'),
        ('Step 3', 'Practice Market Sizing and RCA — these come up in almost every analytics interview.'),
        ('Step 4', 'Memorize the Finance Formulas — you\'ll need mental math in every case.'),
        ('Step 5', 'Master the Synthesis — a great close can save an average case performance.'),
    ]
    sl = ParagraphStyle('sl2', fontName='Helvetica-Bold', fontSize=9, textColor=ACCENT)
    for label, desc in steps_intro:
        t = Table([[Paragraph(label, sl), Paragraph(desc, s['body'])]],
                  colWidths=[20*mm, CW-20*mm])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), WHITE),
            ('TOPPADDING', (0,0), (-1,-1), 7), ('BOTTOMPADDING', (0,0), (-1,-1), 7),
            ('LEFTPADDING', (0,0), (-1,-1), 10),
            ('BOX', (0,0), (-1,-1), 0.5, BORDER),
            ('LINEBEFORE', (0,0), (0,-1), 3, ACCENT),
            ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ]))
        story.append(t)
        story.append(Spacer(1, 2))

    story.append(Spacer(1, 6))
    story.append(tint_box(Paragraph(
        '<b>Golden Rule:</b>  Never memorize frameworks blindly. Understand WHY each piece exists so you can adapt it to any question.',
        s['body_b']), bg=YELLOW_L, border_color=HexColor('#ca8a04')))
    story.append(PageBreak())

    # ═════════════════════════════════════════════════════════
    # SECTION 1: MASTER APPROACH
    # ═════════════════════════════════════════════════════════
    story.append(section_label('Problem Solving'))
    story.append(section_title('MASTER PROBLEM-SOLVING APPROACH'))
    story.append(accent_bar())
    story.append(Spacer(1, 4))
    story.append(Paragraph('This is not a framework — it\'s the METHOD you use in every case. Think of it like being a doctor: hypothesize, investigate systematically, then prescribe.', s['muted']))
    story.append(Spacer(1, 6))

    story.append(Paragraph('<b>The 4 Core Problem-Solving Tools</b>', s['h3']))
    story.append(Spacer(1, 4))

    tools = [
        ('1. Hypothesis', 'State an educated guess early (within 5 min). "I hypothesize the profit decline is driven by rising costs because the client expanded to new geographies." It\'s okay to be wrong — hypotheses are meant to be revised.', ACCENT),
        ('2. Issue Tree', 'Build a logical structure: IF branch 1 AND branch 2 AND branch 3 are true, THEN hypothesis is proven. Must be MECE (no overlaps, no gaps). Example: "Profit decline" splits into "Revenue problem?" and "Cost problem?" — covers everything.', PURPLE),
        ('3. Drill-Down', 'Systematically test each branch. Pick the most likely branch, ask for data, confirm or eliminate, move to the next. Key technique: Segment, Isolate, Repeat. Keep breaking into smaller pieces until you find the root cause.', ORANGE),
        ('4. Synthesis', 'Action-oriented close: "You should [do X]. Because [fact 1], [fact 2], [fact 3]. Therefore, I recommend [X]." The last 30 seconds is what the interviewer remembers most.', GREEN),
    ]
    lbl_s = lambda c: ParagraphStyle('tl', fontName='Helvetica-Bold', fontSize=9, textColor=c)
    for label, desc, color in tools:
        t = Table([[Paragraph(label, lbl_s(color)), Paragraph(desc, s['body'])]],
                  colWidths=[36*mm, CW-36*mm])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), WHITE),
            ('TOPPADDING', (0,0), (-1,-1), 8), ('BOTTOMPADDING', (0,0), (-1,-1), 8),
            ('LEFTPADDING', (0,0), (-1,-1), 10),
            ('BOX', (0,0), (-1,-1), 0.5, BORDER),
            ('LINEBEFORE', (0,0), (0,-1), 3, color),
            ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ]))
        story.append(t)
        story.append(Spacer(1, 3))

    story.append(Spacer(1, 8))
    story.append(Paragraph('<b>The 3-Question Repetition</b>', s['h3']))
    story.append(Paragraph('Answer these at ANY point — beginning, middle, or when you\'re stuck. They immediately reorient you.', s['muted']))
    story.append(Spacer(1, 4))

    q3 = [
        ('Objective', 'What decision are we helping the client make? (Keeps you on track)'),
        ('Hypothesis', 'If we ended the case right now, what would we recommend? Why? (Forces you to always have an answer ready)'),
        ('Next Steps', 'What do we need to analyze to be more confident? (Drives the case forward)'),
    ]
    q_lbl = ParagraphStyle('ql', fontName='Helvetica-Bold', fontSize=9, textColor=ACCENT)
    q_rows = [[Paragraph(q[0], q_lbl), Paragraph(q[1], s['body'])] for q in q3]
    q_t = Table(q_rows, colWidths=[30*mm, CW-30*mm])
    q_t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), SURFACE2),
        ('TOPPADDING', (0,0), (-1,-1), 8), ('BOTTOMPADDING', (0,0), (-1,-1), 8),
        ('LEFTPADDING', (0,0), (-1,-1), 10),
        ('LINEBELOW', (0,0), (-1,-2), 0.4, BORDER),
        ('BOX', (0,0), (-1,-1), 0.5, ACCENT),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(q_t)
    story.append(PageBreak())

    # ═════════════════════════════════════════════════════════
    # SECTION 2: PROFITABILITY
    # ═════════════════════════════════════════════════════════
    story.append(section_label('Core Framework'))
    story.append(section_title('PROFITABILITY FRAMEWORK'))
    story.append(accent_bar())
    story.append(Spacer(1, 4))

    story.append(Paragraph('<b>What is it?</b> A structured way to figure out WHY a company\'s profits are changing — is it a revenue problem or a cost problem?', s['body']))
    story.append(Spacer(1, 3))
    story.append(Paragraph('<b>When to use:</b> Any case mentioning profit decline, margin pressure, financial performance, or "the client is losing money."', s['body']))
    story.append(Spacer(1, 6))

    story.append(code_box([
        'Profit = Revenue - Cost',
        '',
        'Revenue = Price per Unit  x  # Units Sold',
        '         Segment by: geography | product line | customer type',
        '',
        'Cost = Fixed Costs + Variable Costs',
        '  Fixed:    rent, salaries, insurance (don\'t change with volume)',
        '  Variable: materials, packaging, delivery (change per unit)',
        '',
        'Contribution Margin = Price - Variable Cost per Unit',
        'Break-Even Units    = Fixed Costs / Contribution Margin per Unit',
    ]))
    story.append(Spacer(1, 6))

    story.append(Paragraph('<b>Step-by-step approach:</b>', s['h4']))
    for step in [
        '<b>1.</b> Ask: Is this a revenue problem, a cost problem, or both?',
        '<b>2.</b> Go where the problem is — if revenue is down, drill into price vs volume',
        '<b>3.</b> Segment to isolate: WHICH product, WHICH region, WHICH customer segment?',
        '<b>4.</b> Benchmark: compare to (a) same metric last year, (b) industry average',
        '<b>5.</b> Keep asking "why?" until you reach something actionable',
    ]:
        story.append(bul(step, s))
    story.append(Spacer(1, 6))

    story.append(mistake_box('Jumping straight to cost-cutting without checking if revenue is the real problem. Also: "revenue is down" is NOT an insight — "revenue from North India dropped 30% while other regions grew" IS.', s))
    story.append(Spacer(1, 6))
    story.append(tip_box('In most profitability cases, the answer is NOT "raise prices and cut costs." The interviewer wants you to find the SPECIFIC root cause and recommend a targeted fix.', s))
    story.append(Spacer(1, 10))

    # ── SOLVED EXAMPLE: Profitability ──
    story += example_block(s, 'Profitability Framework',
        "Swiggy's profit margins have declined 15% YoY. What's causing it?",
        [('Decompose', 'Profit = Revenue - Cost. Is it a revenue problem or cost problem?'),
         ('Revenue', 'Orders up 20%, AOV flat. Revenue is UP. Not the issue.'),
         ('Cost', 'Delivery cost per order UP 35% (fuel + driver incentives). Fixed costs stable. Root cause = variable cost spike.'),
         ('Isolate', 'Cost per delivery rose from Rs.45 to Rs.61 due to incentive hikes and longer avg distances in 3 new cities.')],
        'Decline is driven by 35% rise in variable delivery costs. Optimize delivery zones, reduce incentive burn, or raise delivery fee in high-cost areas.',
        'Always separate Revenue vs Cost before diving deeper. Blaming pricing here would have been wrong — revenue was actually growing.', ACCENT)
    story.append(PageBreak())

    # ═════════════════════════════════════════════════════════
    # SECTION 3: BUSINESS SITUATION
    # ═════════════════════════════════════════════════════════
    story.append(section_label('Core Framework'))
    story.append(section_title('BUSINESS SITUATION FRAMEWORK'))
    story.append(accent_bar())
    story.append(Spacer(1, 4))

    story.append(Paragraph('<b>What is it?</b> A comprehensive 4-box framework for analyzing any business situation qualitatively. Think of it as a complete X-ray of the business environment. Covers ~50% of all consulting cases.', s['body']))
    story.append(Spacer(1, 3))
    story.append(Paragraph('<b>When to use:</b> Market entry, new product launch, growth strategy, turnaround, competitive response — any broad qualitative assessment.', s['body']))
    story.append(Spacer(1, 6))

    bsf = [
        ('Customer', ACCENT, 'Who buys? (segments) &bull; What do they need? &bull; Price sensitivity &bull; How do they buy? (channel) &bull; Customer concentration (top 3 = what % of revenue?)'),
        ('Product', GREEN, 'What problem does it solve? &bull; Commodity or unique? &bull; Substitutes/complements &bull; Life cycle stage (intro/growth/maturity/decline) &bull; Bundling opportunities'),
        ('Company', PURPLE, 'Core competencies &bull; Cost structure &bull; Financial health &bull; Distribution channels &bull; Management quality'),
        ('Competition', ORANGE, 'Key competitors + market share &bull; Their cost structure vs ours &bull; Value proposition &bull; Barriers to entry &bull; Risk of retaliation'),
    ]
    bsf_rows = [[
        Paragraph(b[0], ParagraphStyle('bl', fontName='Helvetica-Bold', fontSize=9, textColor=WHITE, alignment=TA_CENTER)),
        Paragraph(b[2], s['body']),
    ] for b in bsf]
    bsf_t = Table(bsf_rows, colWidths=[28*mm, CW-28*mm])
    bsf_styles = [
        ('TOPPADDING', (0,0), (-1,-1), 9), ('BOTTOMPADDING', (0,0), (-1,-1), 9),
        ('LEFTPADDING', (0,0), (-1,-1), 10),
        ('LINEBELOW', (0,0), (-1,-2), 0.4, BORDER),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('BOX', (0,0), (-1,-1), 0.5, BORDER),
    ]
    for i, b in enumerate(bsf):
        bsf_styles.append(('BACKGROUND', (0,i), (0,i), b[1]))
        bsf_styles.append(('BACKGROUND', (1,i), (1,i), WHITE))
    bsf_t.setStyle(TableStyle(bsf_styles))
    story.append(bsf_t)
    story.append(Spacer(1, 6))

    story.append(mistake_box('Treating it as a checklist and mechanically covering every sub-bullet. Instead, let the case question guide which boxes matter most. Start with Customer — everything in business starts with who is paying.', s))
    story.append(Spacer(1, 6))
    story.append(tip_box('Don\'t cover all 4 boxes equally. The best candidates connect insights ACROSS boxes: "Because customers are price-sensitive [Customer] and competitors are discounting [Competition], our premium pricing [Product] may need adjustment."', s))
    story.append(Spacer(1, 10))

    # ── SOLVED EXAMPLE: Business Situation ──
    story += example_block(s, 'Business Situation Framework',
        "Zepto wants to launch in Tier-2 cities. Should they?",
        [('Customer', 'Tier-2: price-sensitive, lower AOV (~Rs.250 vs Rs.450 metros), growing smartphone penetration (68%).'),
         ('Product', 'Quick commerce (10-min) is a premium proposition. Tier-2 dark store density is low — harder to deliver in 10 min.'),
         ('Company', 'Capital available ($200M). Proven metro ops. No Tier-2 experience. Unit economics untested at lower AOV.'),
         ('Competition', 'Blinkit + Swiggy Instamart also exploring. First-mover advantage exists but burn is high.')],
        'Conditional yes — pilot 2-3 cities (Indore, Surat) with modified model: 20-min delivery, smaller dark stores, higher delivery fee.',
        'Use Business Situation for qualitative analysis first, then switch to Profitability to validate unit economics. "Conditional yes" is often the best answer.', PURPLE)
    story.append(PageBreak())

    # ═════════════════════════════════════════════════════════
    # SECTION 4: MARKET ENTRY
    # ═════════════════════════════════════════════════════════
    story.append(section_label('Core Framework'))
    story.append(section_title('MARKET ENTRY FRAMEWORK'))
    story.append(accent_bar())
    story.append(Spacer(1, 4))

    story.append(Paragraph('<b>What is it?</b> A structured go/no-go decision framework for evaluating whether a company should enter a new market — and HOW.', s['body']))
    story.append(Spacer(1, 3))
    story.append(Paragraph('<b>When to use:</b> "Should company X enter market Y?", geographic expansion, new product line, new customer segment.', s['body']))
    story.append(Spacer(1, 6))

    lenses = [
        ('Market Attractiveness', 'Market size (TAM/SAM/SOM) &bull; Growth rate &bull; Profitability of existing players &bull; Regulatory environment'),
        ('Competitive Landscape', "Number and strength of competitors &bull; Barriers to entry (capital, tech, brand) &bull; Retaliation risk &bull; Porter's 5 Forces"),
        ('Company Capabilities', 'Relevant skills/assets &bull; Prior expansion experience &bull; Financial capacity (can they fund 2-3 years of losses?) &bull; Cultural/operational fit'),
        ('Entry Mode', 'Build organically (slow, full control) &bull; Acquire competitor (fast, expensive) &bull; JV/partnership (shared risk) &bull; Timing: now vs later? Pilot vs full launch?'),
    ]
    lens_rows = [[Paragraph(f'<b>{l[0]}</b><br/>{l[1]}', s['body'])] for l in lenses]
    lens_t = Table(lens_rows, colWidths=[CW])
    lens_t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), WHITE),
        ('TOPPADDING', (0,0), (-1,-1), 9), ('BOTTOMPADDING', (0,0), (-1,-1), 9),
        ('LEFTPADDING', (0,0), (-1,-1), 14),
        ('LINEBELOW', (0,0), (-1,-2), 0.4, BORDER),
        ('BOX', (0,0), (-1,-1), 0.5, BORDER),
        ('LINEBEFORE', (0,0), (0,-1), 3, ACCENT),
    ]))
    story.append(lens_t)
    story.append(Spacer(1, 6))

    story.append(Paragraph('<b>Step-by-step:</b> Score each lens mentally (1-5). Start with Market Attractiveness — if tiny/shrinking, the answer may be "no." Entry Mode comes last: decide IF first, then HOW. Always quantify: cost to enter, expected revenue, ROI, payback.', s['body']))
    story.append(Spacer(1, 6))
    story.append(tip_box('The best answers are conditional: "Enter IF [condition]. Start with [approach]. Expand after [milestone]." Also always consider the "do nothing" option.', s))
    story.append(Spacer(1, 10))

    # ── SOLVED EXAMPLE: Market Entry ──
    story += example_block(s, 'Market Entry (4 Lenses)',
        "Should a premium D2C chai brand enter the office vending machine market?",
        [('Market', 'Rs.3,200 Cr market, growing 12% YoY. 800K+ offices in India. High repeat frequency (2-3 cups/day).'),
         ('Competition', 'Nescafe/Lipton dominate. No premium chai brand has disrupted. Low differentiation = opportunity.'),
         ('Capabilities', 'Strong brand + supply chain. No B2B sales team or hardware expertise — gap to fill.'),
         ('Entry Mode', 'JV with a vending operator (e.g., Vendiman). License brand, supply product, pilot in 50 Bangalore offices first.')],
        'Enter via JV — avoids capex, leverages existing distribution, tests demand before full commitment.',
        'Score each lens 1-5 to make it data-driven. Market=4, Competition=4, Capabilities=2, Entry=3. Overall: proceed cautiously.', GREEN)
    story.append(PageBreak())

    # ═════════════════════════════════════════════════════════
    # SECTION 5: M&A
    # ═════════════════════════════════════════════════════════
    story.append(section_label('Core Framework'))
    story.append(section_title('M&A FRAMEWORK'))
    story.append(accent_bar())
    story.append(Spacer(1, 4))

    story.append(Paragraph('<b>What is it?</b> A framework for evaluating whether one company should buy another. Covers the market context, both companies, and whether the deal creates value.', s['body']))
    story.append(Spacer(1, 3))
    story.append(Paragraph('<b>When to use:</b> "Should we acquire company X?", merger evaluation, PE/VC investment cases.', s['body']))
    story.append(Spacer(1, 6))

    ma = [
        ('The Market', 'Same/adjacent market? &bull; Size, growth, profitability &bull; Will acquisition change competitive dynamics?'),
        ('The Target', 'Financial health (revenue, profit, cash flow) &bull; Key assets (IP, tech, customer base) &bull; Management quality &bull; Culture fit'),
        ('The Buyer', 'Strategic rationale: undervaluation? synergies? control? &bull; How will the deal be financed? &bull; Prior M&A track record &bull; Timing'),
        ('Synergies &amp; Risks', 'Revenue synergies (cross-sell, new markets) &bull; Cost synergies (eliminate redundancies) &bull; Is 1+1 &gt; 2? &bull; Risks: integration, culture clash, key employee departure, regulatory'),
    ]
    ma_rows = [[Paragraph(f'<b>{m[0]}</b><br/>{m[1]}', s['body'])] for m in ma]
    ma_t = Table(ma_rows, colWidths=[CW])
    ma_t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), WHITE),
        ('TOPPADDING', (0,0), (-1,-1), 9), ('BOTTOMPADDING', (0,0), (-1,-1), 9),
        ('LEFTPADDING', (0,0), (-1,-1), 14),
        ('LINEBELOW', (0,0), (-1,-2), 0.4, BORDER),
        ('BOX', (0,0), (-1,-1), 0.5, BORDER),
        ('LINEBEFORE', (0,0), (0,-1), 3, PURPLE),
    ]))
    story.append(ma_t)
    story.append(Spacer(1, 6))

    story.append(Paragraph('<b>Key formulas:</b> Max price = Standalone value + PV of synergies. ROI = Annual synergy / Price. Only 60-70% of planned synergies are typically captured. Integration costs = 5-15% of deal value.', s['body']))
    story.append(Spacer(1, 6))
    story.append(mistake_box('Saying "good strategic fit" without quantifying synergies in real numbers. Always calculate: how much synergy (Rs. Cr), what ROI, what payback period.', s))
    story.append(Spacer(1, 10))

    # ── SOLVED EXAMPLE: M&A ──
    story += example_block(s, 'M&A Framework',
        "Should Flipkart acquire Shadowfax (mid-size logistics company)?",
        [('Market', 'Indian logistics: Rs.22L Cr. E-commerce logistics up 28% YoY. Attractive and growing.'),
         ('Target', 'Shadowfax: Rs.1,200 Cr revenue, profitable, 2L+ delivery partners, strong Tier-2/3 coverage.'),
         ('Buyer', 'Flipkart: $36B valuation, Walmart-backed. Currently 60% outsourced logistics — costly and unreliable.'),
         ('Synergies', 'Cost: Rs.400 Cr/yr savings from bringing logistics in-house. Revenue: logistics-as-a-service to Meesho/others. Risk: culture integration.')],
        'Acquire at under Rs.3,200 Cr. ROI = 12.5%, 8-year payback. Strategically reduces logistics dependency.',
        'Always quantify synergies in Rs. and calculate ROI/payback. "Good fit" alone is never enough to justify an acquisition.', ORANGE)
    story.append(PageBreak())

    # ═════════════════════════════════════════════════════════
    # SECTION 6: PRICING
    # ═════════════════════════════════════════════════════════
    story.append(section_label('Core Framework'))
    story.append(section_title('PRICING FRAMEWORK'))
    story.append(accent_bar())
    story.append(Spacer(1, 4))

    story.append(Paragraph('<b>What is it?</b> A 3-lens approach to find the optimal price. Think of it as finding the sweet spot between "too cheap" (leaving money on the table) and "too expensive" (no one buys).', s['body']))
    story.append(Spacer(1, 3))
    story.append(Paragraph('<b>When to use:</b> New product pricing, repricing, competitive pricing response, price optimization.', s['body']))
    story.append(Spacer(1, 6))

    pr = [
        ('Cost-Based (Floor)', ACCENT, 'What price covers all costs? Fixed cost per unit + Variable cost per unit + Target margin = minimum price. Below this, you lose money.'),
        ('Value-Based (Ceiling)', GREEN, "How much will customers pay? Price of next best alternative + Value of your added features = willingness to pay. Above this, no one buys."),
        ('Competitor-Based (Anchor)', PURPLE, 'What does competition charge? Substitute prices + Your product vs theirs = positioning. Premium, parity, or discount?'),
    ]
    pr_rows = [[
        Paragraph(p[0], ParagraphStyle('pl', fontName='Helvetica-Bold', fontSize=8.5, textColor=p[1])),
        Paragraph(p[2], s['body']),
    ] for p in pr]
    pr_t = Table(pr_rows, colWidths=[44*mm, CW-44*mm])
    pr_styles = [
        ('TOPPADDING', (0,0), (-1,-1), 9), ('BOTTOMPADDING', (0,0), (-1,-1), 9),
        ('LEFTPADDING', (0,0), (-1,-1), 10),
        ('LINEBELOW', (0,0), (-1,-2), 0.4, BORDER),
        ('BOX', (0,0), (-1,-1), 0.5, BORDER),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]
    for i, p in enumerate(pr):
        pr_styles.append(('LINEBEFORE', (0,i), (0,i), 3, p[1]))
        pr_styles.append(('BACKGROUND', (0,i), (-1,i), WHITE))
    pr_t.setStyle(TableStyle(pr_styles))
    story.append(pr_t)
    story.append(Spacer(1, 4))
    story.append(tint_box(Paragraph(
        '<b>Also consider:</b>  Product tiering (good/better/best) &bull; Cross-sell / up-sell &bull; Psychological pricing (Rs.999 vs Rs.1,000) &bull; Volume discounts for B2B',
        s['body']), bg=YELLOW_L, border_color=HexColor('#ca8a04')))
    story.append(Spacer(1, 6))
    story.append(mistake_box('Only looking at cost-based pricing — the most common beginner mistake. Also: forgetting that price affects volume (lower price does NOT always mean higher revenue).', s))
    story.append(Spacer(1, 6))
    story.append(tip_box('Start with value-based (ceiling), use cost-based as a sanity check (floor), and competitor-based to position within the range.', s))
    story.append(Spacer(1, 10))

    # ── SOLVED EXAMPLE: Pricing ──
    story += example_block(s, 'Pricing Framework',
        "What should Razorpay charge for its new CFO dashboard product?",
        [('Cost-Based', 'Dev: Rs.2 Cr/yr + Support: Rs.50L. Target 500 clients. Minimum = Rs.50K/client/yr.'),
         ('Value-Based', 'CFO saves 40 hrs/month (worth Rs.80K/mo). WTP ~ 20-30% of value saved = Rs.1.9-2.9L/yr.'),
         ('Competitor', 'Zoho: Rs.60K/yr. SAP: Rs.5-12L/yr. We sit between — anchor at Rs.1.8-2.5L/yr.')],
        'Price at Rs.2L/yr (Rs.16,666/mo). Above floor, within ceiling, competitively positioned. Offer 15% annual discount.',
        'Start with value-based (ceiling), use cost-based (floor), and competitor-based picks the sweet spot.', PURPLE)
    story.append(PageBreak())

    # ═════════════════════════════════════════════════════════
    # SECTION 7: PORTER'S 5 FORCES
    # ═════════════════════════════════════════════════════════
    story.append(section_label('Industry Analysis'))
    story.append(section_title("PORTER'S 5 FORCES"))
    story.append(accent_bar())
    story.append(Spacer(1, 4))

    story.append(Paragraph('<b>What is it?</b> A framework for analyzing the competitive structure of an entire INDUSTRY (not just one company). It tells you WHY an industry is profitable or not. High force = bad for profitability; Low force = good.', s['body']))
    story.append(Spacer(1, 3))
    story.append(Paragraph('<b>When to use:</b> Industry attractiveness, competitive dynamics, "should we enter this industry?", "why are margins declining industry-wide?"', s['body']))
    story.append(Spacer(1, 6))

    forces = [
        ("Buyers' Power", 'Customer concentration (top 3 as % of revenue) &bull; Price sensitivity &bull; Information availability &bull; Switching costs'),
        ("Suppliers' Power", 'Supplier concentration &bull; Switching costs &bull; Supplier differentiation &bull; Threat of forward integration'),
        ('Threat of Substitutes', 'Different products solving the SAME problem (trains vs flights, NOT Pepsi vs Coke) &bull; Ease of switching &bull; Price-performance ratio'),
        ('Threat of New Entrants', 'Regulatory barriers &bull; Capital requirements &bull; Economies of scale &bull; Network effects &bull; Brand loyalty'),
        ('Existing Rivalry', '# of competitors + market shares &bull; Product similarity &bull; Financial health of rivals &bull; Exit barriers &bull; Industry growth rate'),
    ]
    f_rows = [[Paragraph(f'<b>{f[0]}</b>:  {f[1]}', s['body'])] for f in forces]
    f_t = Table(f_rows, colWidths=[CW])
    f_t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), WHITE),
        ('TOPPADDING', (0,0), (-1,-1), 7), ('BOTTOMPADDING', (0,0), (-1,-1), 7),
        ('LEFTPADDING', (0,0), (-1,-1), 14),
        ('LINEBELOW', (0,0), (-1,-2), 0.3, BORDER),
        ('BOX', (0,0), (-1,-1), 0.5, BORDER),
        ('LINEBEFORE', (0,0), (0,-1), 3, ACCENT),
    ]))
    story.append(f_t)
    story.append(Spacer(1, 6))

    story.append(Paragraph('<b>How to use:</b> Rate each force as High/Medium/Low. Identify the 1-2 forces that matter most. Don\'t list all 5 equally — prioritize.', s['body']))
    story.append(Spacer(1, 6))
    story.append(mistake_box('Analyzing a COMPANY instead of an INDUSTRY. Porter\'s 5 Forces is about the entire playing field. Also: confusing "substitutes" (different products, same problem) with "competitors" (same product type).', s))
    story.append(Spacer(1, 10))

    # ── SOLVED EXAMPLE: Porter's ──
    story += example_block(s, "Porter's 5 Forces",
        "Analyze the competitive structure of Indian UPI payments.",
        [("Buyers': HIGH", 'Zero switching cost — same UPI works on PhonePe, GPay, Paytm. Merchants too.'),
         ("Suppliers': HIGH", 'NPCI controls the rails. RBI sets MDR to 0%. Regulatory control over the ecosystem.'),
         ('Substitutes: LOW', 'Cash declining. Cards face same zero-MDR. No viable alternative for small digital payments.'),
         ('Rivalry: EXTREME', 'PhonePe (47%), GPay (36%), Paytm. No differentiation — all run on same NPCI rails.')],
        'Structurally unattractive for payments profit. Winning strategy: monetize adjacent services (credit, insurance, wealth).',
        "Porter's reveals WHY an industry is profitable or not. A company can still succeed in an unattractive industry if it has a strong moat.", HexColor('#dc2626'))
    story.append(PageBreak())

    # ═════════════════════════════════════════════════════════
    # SECTION 8: 4Ps + 3Cs
    # ═════════════════════════════════════════════════════════
    story.append(section_label('Strategy & Marketing'))
    story.append(section_title('4Ps + 3Cs FRAMEWORKS'))
    story.append(accent_bar())
    story.append(Spacer(1, 6))

    story.append(Paragraph('<b>4Ps Marketing Framework</b>', s['h3']))
    story.append(Paragraph('The classic marketing mix — 4 levers for marketing any product or service. Use for marketing strategy, product launch, go-to-market.', s['muted']))
    story.append(Spacer(1, 4))

    fps = [
        ('Product', ACCENT, 'What customer need does it fulfill? &bull; Who uses it, where, how? &bull; Good vs service &bull; Life cycle stage &bull; Substitutes'),
        ('Price', GREEN, 'Perceived value &bull; Competitor prices &bull; Customer price sensitivity &bull; Production costs (links to Pricing Framework)'),
        ('Promotion', PURPLE, 'Marketing messages &bull; Media channels (TV, digital, social, influencer) &bull; Timing (seasonal?) &bull; Competitor strategies'),
        ('Place', ORANGE, 'Distribution channels (online, retail, wholesale, direct) &bull; Customer channel preferences &bull; Sales force needed? &bull; Competitor distribution'),
    ]
    fps_rows = [[
        Paragraph(p[0], ParagraphStyle('fpl', fontName='Helvetica-Bold', fontSize=8.5, textColor=WHITE, alignment=TA_CENTER)),
        Paragraph(p[2], s['body']),
    ] for p in fps]
    fps_t = Table(fps_rows, colWidths=[24*mm, CW-24*mm])
    fps_styles = [
        ('TOPPADDING', (0,0), (-1,-1), 8), ('BOTTOMPADDING', (0,0), (-1,-1), 8),
        ('LEFTPADDING', (0,0), (-1,-1), 10),
        ('LINEBELOW', (0,0), (-1,-2), 0.4, BORDER),
        ('BOX', (0,0), (-1,-1), 0.5, BORDER),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]
    for i, p in enumerate(fps):
        fps_styles.append(('BACKGROUND', (0,i), (0,i), p[1]))
        fps_styles.append(('BACKGROUND', (1,i), (1,i), WHITE))
    fps_t.setStyle(TableStyle(fps_styles))
    story.append(fps_t)
    story.append(Spacer(1, 10))

    story.append(Paragraph('<b>3Cs Framework</b>', s['h3']))
    story.append(Paragraph('A quick strategic overview of the 3 most important stakeholders. Simpler and faster than Business Situation — good for 5-minute initial analysis.', s['muted']))
    story.append(Spacer(1, 4))

    tcs = [
        ('Customers', 'Demographics &bull; Needs and pain points &bull; Segment size and growth &bull; Price sensitivity'),
        ('Competition', 'Value proposition and brand &bull; Market share and growth &bull; Financial health'),
        ('Company', 'Product offering &bull; Profitability &bull; Core competencies and USP &bull; Weaknesses'),
    ]
    tcs_rows = [[Paragraph(f'<b>{t[0]}:</b>  {t[1]}', s['body'])] for t in tcs]
    tcs_t = Table(tcs_rows, colWidths=[CW])
    tcs_t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), SURFACE2),
        ('TOPPADDING', (0,0), (-1,-1), 8), ('BOTTOMPADDING', (0,0), (-1,-1), 8),
        ('LEFTPADDING', (0,0), (-1,-1), 14),
        ('LINEBELOW', (0,0), (-1,-2), 0.4, BORDER),
        ('BOX', (0,0), (-1,-1), 0.5, ACCENT),
    ]))
    story.append(tcs_t)
    story.append(Spacer(1, 6))
    story.append(tip_box('3Cs is a great "opening move" — use it to structure initial thinking, then switch to a more specific framework once you understand the problem.', s))
    story.append(PageBreak())

    # ═════════════════════════════════════════════════════════
    # SECTION 9: MARKET SIZING
    # ═════════════════════════════════════════════════════════
    story.append(section_label('Quantitative'))
    story.append(section_title('MARKET SIZING'))
    story.append(accent_bar())
    story.append(Spacer(1, 4))

    story.append(Paragraph('<b>What is it?</b> Estimating the total revenue or volume of a market using logic and assumptions. There is no "correct" answer — interviewers evaluate your APPROACH, not your number.', s['body']))
    story.append(Spacer(1, 6))

    story.append(Paragraph('<b>Top-Down Approach</b> — start big, filter down', s['h4']))
    story.append(code_box([
        'Market Size = Population x Penetration Rate x Frequency x Avg Price',
        '',
        '1. Start with total population (India: 1.4B, US: 330M)',
        '2. Filter by target demographic (age, geography, income)',
        '3. Apply category penetration (% who buy this type of product)',
        '4. Estimate purchase frequency (daily? monthly? yearly?)',
        '5. Estimate average ticket size (price per purchase)',
        '6. Calculate and sense-check against known benchmarks',
    ]))
    story.append(Spacer(1, 6))

    story.append(Paragraph('<b>Bottom-Up Approach</b> — start small, build up', s['h4']))
    story.append(code_box([
        'Market Size = # Supply Units x Revenue per Unit per Period',
        '',
        '1. Count supply units (stores, factories, operators)',
        '2. Estimate revenue per unit per time period',
        '3. Multiply to get total market',
        '4. Cross-validate with top-down approach',
    ]))
    story.append(Spacer(1, 6))

    # Key facts
    story.append(Paragraph('<b>Key Facts to Memorize</b>', s['h4']))
    pop_rows = [
        ['World: ~8B', 'India: 1.4B (~300M HH)', 'China: 1.4B'],
        ['USA: 330M (~120M HH)', 'Indonesia: 280M', 'Brazil: 210M'],
        ['1 mile = 5,280 ft', '1 km = 0.62 miles', '1 inch = 2.54 cm'],
    ]
    pop_s = ParagraphStyle('ps', fontName='Courier', fontSize=8, textColor=DARK)
    pop_rows_p = [[Paragraph(c, pop_s) for c in r] for r in pop_rows]
    pop_t = Table(pop_rows_p, colWidths=[CW/3]*3)
    pop_t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), SURFACE2),
        ('TOPPADDING', (0,0), (-1,-1), 6), ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('LEFTPADDING', (0,0), (-1,-1), 10),
        ('BOX', (0,0), (-1,-1), 0.5, BORDER),
        ('INNERGRID', (0,0), (-1,-1), 0.3, BORDER),
    ]))
    story.append(pop_t)
    story.append(Spacer(1, 6))
    story.append(mistake_box('Making too many assumptions without stating them. Always state assumptions BEFORE calculating: "I\'ll assume 300M households, 35% urban. Does that seem reasonable?" This lets the interviewer correct you early.', s))
    story.append(Spacer(1, 6))
    story.append(tip_box('Always cross-validate with a second approach. If top-down and bottom-up converge, your assumptions are solid. Also: round aggressively (300M not 298M).', s))
    story.append(Spacer(1, 10))

    # ── SOLVED EXAMPLE: Market Sizing ──
    story += example_block(s, 'Market Sizing (Bottom-Up)',
        "Estimate the annual market size for cloud kitchens in India.",
        [('Supply Base', '5 major metros + 15 Tier-1 cities. ~500 operators/city x 20 cities = 10,000 operators.'),
         ('Revenue/Operator', '3 brands x 150 orders/day x Rs.300 AOV = Rs.1.35L/day = Rs.4.9 Cr/yr per operator.'),
         ('Total Market', '10,000 x Rs.4.9 Cr = ~Rs.50,000 Cr (~$6B).'),
         ('Cross-Check', 'Food delivery = Rs.1.5L Cr. Cloud kitchens ~33% = Rs.50K Cr. Matches bottom-up estimate.')],
        'Indian cloud kitchen market: ~Rs.50,000 Cr ($6B), growing 25% YoY.',
        'Cross-validating with a second approach is the hallmark of a strong candidate. Both methods converging = solid assumptions.', GREEN)
    story.append(PageBreak())

    # ═════════════════════════════════════════════════════════
    # SECTION 10: RCA
    # ═════════════════════════════════════════════════════════
    story.append(section_label('Analytics'))
    story.append(section_title('ROOT CAUSE ANALYSIS'))
    story.append(accent_bar())
    story.append(Spacer(1, 4))

    story.append(Paragraph('<b>What is it?</b> A systematic method for diagnosing WHY a metric dropped. This is the #1 framework for data analyst and analytics interviews.', s['body']))
    story.append(Spacer(1, 3))
    story.append(Paragraph('<b>When to use:</b> "DAU dropped 20%", "conversion rate fell", "revenue declined" — any metric drop investigation.', s['body']))
    story.append(Spacer(1, 6))

    rca = [
        ('Step 1: Decompose', 'Break the metric into components. Example: Revenue = Users x Conversion x AOV. Is it a REACH problem (fewer users) or DEPTH problem (less per user)?'),
        ('Step 2: Internal vs External', 'Internal: product changes, bugs, UI issues, pricing. External: competitor actions, seasonality, macro trends, regulation.'),
        ('Step 3: Segment', 'By time (when did it start?) &bull; Platform (iOS/Android?) &bull; User type (new/returning?) &bull; Geography &bull; Funnel stage'),
        ('Step 4: Hypothesize + Test', '"I hypothesize X caused the drop because Y. To confirm, I would check Z."'),
        ('Step 5: Recommend', 'Short-term: stop the bleeding (e.g., rollback buggy release). Long-term: fix root cause + add monitoring to prevent recurrence.'),
    ]
    rca_lbl = ParagraphStyle('rl', fontName='Helvetica-Bold', fontSize=8, textColor=ACCENT)
    rca_rows = [[Paragraph(r[0], rca_lbl), Paragraph(r[1], s['body'])] for r in rca]
    rca_t = Table(rca_rows, colWidths=[38*mm, CW-38*mm])
    rca_t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), WHITE),
        ('TOPPADDING', (0,0), (-1,-1), 7), ('BOTTOMPADDING', (0,0), (-1,-1), 7),
        ('LEFTPADDING', (0,0), (-1,-1), 10),
        ('LINEBELOW', (0,0), (-1,-2), 0.3, BORDER),
        ('BOX', (0,0), (-1,-1), 0.5, BORDER),
        ('LINEBEFORE', (0,0), (0,-1), 3, ACCENT),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))
    story.append(rca_t)
    story.append(Spacer(1, 6))

    story.append(mistake_box('Looking at aggregate data instead of segmenting. The problem is almost always in ONE specific segment — a bug on iOS, a drop in one city, a broken feature for new users. Also: "when did it start?" is the most powerful diagnostic question.', s))
    story.append(Spacer(1, 10))

    # ── SOLVED EXAMPLE: RCA ──
    story += example_block(s, 'Root Cause Analysis',
        "Meesho's 7-day retention dropped from 42% to 31% in 2 weeks. Why?",
        [('Decompose', 'Retention = returning users / activated users. Reach or depth problem?'),
         ('Segment', 'D1 retention stable (68%). D7 dropped. Android stable, iOS crashed (42% to 19%).'),
         ('Isolate', 'iOS users who browsed but didn\'t purchase — they stopped returning after day 2-3.'),
         ('Hypothesis', 'iOS app update (v4.2.1) broke the "Save for later" wishlist feature. Users can\'t save items, so they don\'t return.')],
        'Root cause: iOS bug in wishlist feature from v4.2.1. Fix: hotfix/rollback. Expected D7 recovery to 38%+ in 1 week.',
        'Always segment by platform, user type, and time. The iOS bug was invisible in aggregate data — only segmenting revealed it.', ACCENT)
    story.append(PageBreak())

    # ═════════════════════════════════════════════════════════
    # SECTION 11: AARRR / NORTH STAR
    # ═════════════════════════════════════════════════════════
    story.append(section_label('Product Analytics'))
    story.append(section_title('AARRR / NORTH STAR'))
    story.append(accent_bar())
    story.append(Spacer(1, 4))

    story.append(Paragraph('<b>What is it?</b> A framework for organizing product metrics across the entire user lifecycle. Essential for product analytics roles. Also called "Pirate Metrics" (AARRR).', s['body']))
    story.append(Spacer(1, 3))
    story.append(Paragraph('<b>When to use:</b> KPI design, "what metrics should we track?", product metric selection, analytics case studies.', s['body']))
    story.append(Spacer(1, 6))

    aarrr = [
        ('Acquisition', ACCENT, 'How users find you — CAC, CTR, installs, sign-ups. "We spend Rs.500 per install via Google Ads"'),
        ('Activation', GREEN, 'First value moment — onboarding completion, D1 retention. "45% complete first lesson in 24 hours"'),
        ('Retention', PURPLE, 'Users coming back — D7/D30 retention, churn, MAU/DAU ratio. "D30 retention is 22%"'),
        ('Revenue', ORANGE, 'Monetization — ARPU, LTV, free-to-paid conversion. "LTV is Rs.2,400, CAC is Rs.500, ratio = 4.8x"'),
        ('Referral', TEAL, 'Word of mouth — NPS, virality coefficient. "Each user invites 0.3 new users"'),
    ]
    aa_rows = [[
        Paragraph(a[0], ParagraphStyle('an', fontName='Helvetica-Bold', fontSize=8.5, textColor=WHITE, alignment=TA_CENTER)),
        Paragraph(a[2], s['body']),
    ] for a in aarrr]
    aa_t = Table(aa_rows, colWidths=[28*mm, CW-28*mm])
    aa_styles = [
        ('TOPPADDING', (0,0), (-1,-1), 7), ('BOTTOMPADDING', (0,0), (-1,-1), 7),
        ('LEFTPADDING', (0,0), (-1,-1), 10),
        ('LINEBELOW', (0,0), (-1,-2), 0.4, BORDER),
        ('BOX', (0,0), (-1,-1), 0.5, BORDER),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]
    for i, a in enumerate(aarrr):
        aa_styles.append(('BACKGROUND', (0,i), (0,i), a[1]))
        aa_styles.append(('BACKGROUND', (1,i), (1,i), WHITE))
    aa_t.setStyle(TableStyle(aa_styles))
    story.append(aa_t)
    story.append(Spacer(1, 6))

    # North Star
    story.append(Paragraph('<b>North Star Metric:</b> A single metric that captures the core value your product delivers. It predicts long-term success better than revenue.', s['body']))
    story.append(Spacer(1, 4))
    ns_rows = [
        ['Product Type', 'North Star Example'],
        ['Social media', 'DAU (Daily Active Users)'],
        ['E-commerce', 'Weekly Active Buyers'],
        ['EdTech', 'Minutes of Learning / Active User / Week'],
        ['SaaS', 'Weekly Active Teams'],
        ['Payments', 'Monthly Transaction Volume'],
    ]
    nsh = ParagraphStyle('nsh', fontName='Helvetica-Bold', fontSize=8, textColor=WHITE)
    nsb = ParagraphStyle('nsb', fontName='Helvetica', fontSize=8, textColor=TEXT)
    ns_r = []
    for i, row in enumerate(ns_rows):
        if i == 0:
            ns_r.append([Paragraph(c, nsh) for c in row])
        else:
            ns_r.append([Paragraph(row[0], ParagraphStyle('nsl', fontName='Helvetica-Bold', fontSize=8, textColor=ACCENT)), Paragraph(row[1], nsb)])
    ns_t = Table(ns_r, colWidths=[CW*0.35, CW*0.65])
    ns_t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), ACCENT2),
        ('TOPPADDING', (0,0), (-1,-1), 5), ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('LEFTPADDING', (0,0), (-1,-1), 10),
        ('BOX', (0,0), (-1,-1), 0.5, BORDER),
        ('INNERGRID', (0,0), (-1,-1), 0.3, BORDER),
    ]))
    for i in range(1, len(ns_rows)):
        ns_t.setStyle(TableStyle([('BACKGROUND', (0,i), (-1,i), WHITE if i%2==0 else SURFACE2)]))
    story.append(ns_t)
    story.append(Spacer(1, 6))
    story.append(tip_box('Best NSMs reflect value delivered TO the user — they predict long-term retention better than revenue metrics. If a metric drop question comes up, start with AARRR to locate WHERE in the funnel, then use RCA to diagnose WHY.', s))
    story.append(Spacer(1, 10))

    # ── SOLVED EXAMPLE: AARRR ──
    story += example_block(s, 'AARRR / North Star',
        "Design the KPI framework for a new B2C EdTech app.",
        [('Acquisition', 'CAC by channel (YouTube, Google, referral). Target: CAC < Rs.800 per install.'),
         ('Activation', 'Complete first lesson within 24 hrs. D1 activation target: >45%.'),
         ('Retention', 'D7 + D30 retention. Weekly active learners. Target: D30 > 25%.'),
         ('Revenue + NSM', 'Free-to-paid conversion. LTV/CAC > 3x. North Star: Minutes of Learning per Active User per Week.')],
        'North Star: "Minutes of Learning / Active User / Week." It captures depth of engagement, not vanity metrics like downloads.',
        'Best NSMs reflect value delivered TO the user — "minutes learned" predicts retention better than "revenue per user."', TEAL)
    story.append(PageBreak())

    # ═════════════════════════════════════════════════════════
    # SECTION 12: GROWTH, COST, BREAK-EVEN
    # ═════════════════════════════════════════════════════════
    story.append(section_label('Business Judgment'))
    story.append(section_title('GROWTH, COST & BREAK-EVEN'))
    story.append(accent_bar())
    story.append(Spacer(1, 6))

    story.append(Paragraph('<b>Growth Strategy (Ansoff Matrix)</b>', s['h3']))
    story.append(Paragraph('A 2x2 matrix mapping 4 growth strategies based on existing vs new markets/products. Use for "How should the client grow?"', s['muted']))
    story.append(Spacer(1, 4))

    ansoff = [
        ['', 'Existing Products', 'New Products'],
        ['Existing Markets', 'Market Penetration\n(lowest risk)', 'Product Development\n(medium risk)'],
        ['New Markets', 'Market Development\n(medium risk)', 'Diversification\n(highest risk)'],
    ]
    anh = ParagraphStyle('ah', fontName='Helvetica-Bold', fontSize=8.5, textColor=WHITE, alignment=TA_CENTER)
    anb = ParagraphStyle('ab', fontName='Helvetica', fontSize=8.5, textColor=TEXT, alignment=TA_CENTER)
    an_rows = []
    for i, row in enumerate(ansoff):
        an_rows.append([Paragraph(c, anh if i==0 or j==0 else anb) for j, c in enumerate(row)])
    an_t = Table(an_rows, colWidths=[CW/3]*3)
    an_t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), ACCENT2),
        ('BACKGROUND', (0,1), (0,-1), ACCENT),
        ('BACKGROUND', (1,1), (-1,-1), WHITE),
        ('TOPPADDING', (0,0), (-1,-1), 8), ('BOTTOMPADDING', (0,0), (-1,-1), 8),
        ('BOX', (0,0), (-1,-1), 0.5, BORDER),
        ('INNERGRID', (0,0), (-1,-1), 0.5, BORDER),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(an_t)
    story.append(Spacer(1, 6))

    story.append(Paragraph('<b>Revenue growth formula:</b> Revenue = Volume x Price. Grow volume (more customers, higher frequency) OR grow price (premium tiers, reduce discounts, add features).', s['body']))
    story.append(Spacer(1, 10))

    story.append(Paragraph('<b>Cost Structure Analysis</b>', s['h3']))
    story.append(Paragraph('Understanding where money goes and finding cost reduction opportunities.', s['muted']))
    story.append(Spacer(1, 4))
    story.append(code_box([
        'Fixed Costs (don\'t change with volume)',
        '  Examples: rent, salaries, depreciation, marketing budget, tech infra',
        '  Levers: renegotiate leases, automate roles, consolidate offices',
        '',
        'Variable Costs (change proportionally with volume)',
        '  Examples: COGS, commissions, delivery, packaging, payment fees',
        '  Levers: bulk purchasing, supplier negotiation, process optimization',
        '',
        'Contribution Margin = Price - Variable Cost per Unit',
        'Operating Leverage  = Fixed Costs / Total Costs',
        '  Higher = more risky, but more upside at scale',
    ]))
    story.append(Spacer(1, 10))

    story.append(Paragraph('<b>Break-Even Analysis</b>', s['h3']))
    story.append(Paragraph('The minimum sales needed to cover all costs — the point where you stop losing money.', s['muted']))
    story.append(Spacer(1, 4))
    story.append(code_box([
        'Break-Even Units   = Fixed Costs / Contribution Margin per Unit',
        'Break-Even Revenue = Fixed Costs / Gross Margin %',
        'Payback Period     = Initial Investment / Annual Profit',
        '',
        'Key insight: Every unit BELOW break-even loses money.',
        'Every unit ABOVE break-even earns pure contribution margin.',
    ]))
    story.append(Spacer(1, 10))

    # ── SOLVED EXAMPLE: Break-Even ──
    story += example_block(s, 'Break-Even Analysis',
        "Cafe in Bangalore: Rs.3L/month fixed costs. Coffee: Rs.40 to make, sells for Rs.140. How many cups to break even?",
        [('CM', 'Contribution Margin = Rs.140 - Rs.40 = Rs.100 per cup.'),
         ('Break-Even', 'BE = Rs.3,00,000 / Rs.100 = 3,000 cups/month = 100 cups/day.'),
         ('Sense Check', '100 cups in 12 hours = ~8 per hour. Achievable for a busy single-counter cafe.'),
         ('Upside', 'At 120 cups/day: (120-100) x Rs.100 = Rs.2,000 profit/day = Rs.60K/month. Add baked goods for higher margin.')],
        '3,000 cups/month to break even. Every cup beyond that earns Rs.100 in pure contribution margin.',
        'Break-even tells WHEN you become profitable. Contribution margin tells HOW MUCH each incremental unit earns.', ORANGE)
    story.append(PageBreak())

    # ═════════════════════════════════════════════════════════
    # SECTION 13: FINANCE + MATH
    # ═════════════════════════════════════════════════════════
    story.append(section_label('Quantitative'))
    story.append(section_title('FINANCE FORMULAS'))
    story.append(accent_bar())
    story.append(Spacer(1, 6))

    story.append(Paragraph('These formulas come up in almost every case. Memorize them.', s['muted']))
    story.append(Spacer(1, 4))

    formulas = [
        ['Metric', 'Formula', 'What It Tells You'],
        ['Revenue', 'Volume x Price', 'How much money comes in'],
        ['Cost', 'Fixed + Variable', 'How much money goes out'],
        ['Profit', 'Revenue - Cost', 'The bottom line'],
        ['Profit Margin', 'Profit / Revenue', 'Efficiency — what % is kept as profit'],
        ['Contribution Margin', 'Price - VC per Unit', 'How much each sale covers fixed costs'],
        ['Break-Even Units', 'FC / Contribution Margin', 'Minimum units to stop losing money'],
        ['ROI', 'Profit / Investment', 'Return — higher is better'],
        ['Payback Period', 'Investment / Annual Profit', 'Years to earn back the investment'],
    ]
    fh = ParagraphStyle('fh', fontName='Helvetica-Bold', fontSize=8, textColor=WHITE)
    fl = ParagraphStyle('fl', fontName='Helvetica-Bold', fontSize=8, textColor=ACCENT)
    fv = ParagraphStyle('fv', fontName='Courier-Bold', fontSize=7.5, textColor=DARK)
    fn = ParagraphStyle('fn', fontName='Helvetica-Oblique', fontSize=7.5, textColor=MUTED)
    f_rows = []
    for i, row in enumerate(formulas):
        if i == 0:
            f_rows.append([Paragraph(c, fh) for c in row])
        else:
            f_rows.append([Paragraph(row[0], fl), Paragraph(row[1], fv), Paragraph(row[2], fn)])
    f_t = Table(f_rows, colWidths=[40*mm, 55*mm, CW-95*mm])
    f_styles = [
        ('BACKGROUND', (0,0), (-1,0), ACCENT2),
        ('TOPPADDING', (0,0), (-1,-1), 5), ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('BOX', (0,0), (-1,-1), 0.5, BORDER),
        ('INNERGRID', (0,0), (-1,-1), 0.3, BORDER),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]
    for i in range(1, len(formulas)):
        f_styles.append(('BACKGROUND', (0,i), (-1,i), WHITE if i % 2 == 0 else SURFACE2))
    f_t.setStyle(TableStyle(f_styles))
    story.append(f_t)
    story.append(Spacer(1, 6))

    story.append(tint_box(Paragraph(
        '<b>Nice to Know:</b>  EBITDA (operating cash flow proxy) &bull; NPV (adjusts future cash flows to today) &bull; ROE (Profit / Equity) &bull; ROA (Profit / Assets)',
        s['body']), bg=SURFACE2))
    story.append(Spacer(1, 10))

    story.append(Paragraph('<b>Mental Math Shortcuts</b>', s['h3']))
    story.append(Spacer(1, 4))
    story.append(code_box([
        'ROUNDING:  Round +/- 10%. Alternate up/down to cancel errors.',
        '  487 x 312  ≈  500 x 300 = 150,000  (actual: 151,944 — 1.3% off)',
        '',
        'LABELS:  k = thousand | m = million | b = billion',
        '  20k x 6m = 120b',
        '',
        'TRICKS:',
        '  x 25 = / 4 x 100    ->  36 x 25 = 900',
        '  x 50 = / 2 x 100    ->  68 x 50 = 3,400',
        '  x 75 = / 4 x 300    ->  68 x 75 = 5,100',
        '',
        'PERCENTAGES:',
        '  10% = move decimal left | 5% = half of 10% | 1% = move 2 left',
        '  17% of 4,500 = 10%(450) + 5%(225) + 2%(90) = 765',
        '',
        'GROWTH:',
        '  Short (2-3 yrs): add %s.  10% + 20% ≈ 32%',
        '  Rule of 72: money doubles in 72/rate years (72/7 ≈ 10 yrs)',
    ]))
    story.append(Spacer(1, 6))
    story.append(tip_box('In interviews, NARRATE your math. Silence while calculating is a red flag. State approach, narrate steps, tie result back to the question.', s))
    story.append(PageBreak())

    # ═════════════════════════════════════════════════════════
    # SECTION 14: DATA INTERP + BRAINSTORMING
    # ═════════════════════════════════════════════════════════
    story.append(section_label('Analysis Skills'))
    story.append(section_title('DATA INTERPRETATION'))
    story.append(accent_bar())
    story.append(Spacer(1, 4))

    story.append(Paragraph('<b>What is it?</b> A structured approach to analyzing charts, tables, and data exhibits that come up mid-case. Always narrate your observations aloud.', s['body']))
    story.append(Spacer(1, 6))

    di = [
        ('Step 1', 'UNDERSTAND headers, axes, and units. Misreading a unit (thousands vs millions) derails everything.'),
        ('Step 2', 'ANALYZE vertically (one point in time), then horizontally (change over time). Say what you see.'),
        ('Step 3', 'COMBINE insights across multiple exhibits. Look for connections between different charts/tables.'),
        ('Step 4', 'RELATE to the case question. "This data suggests X, which supports/contradicts our hypothesis about Y."'),
    ]
    di_lbl = ParagraphStyle('dl', fontName='Helvetica-Bold', fontSize=10, textColor=WHITE, alignment=TA_CENTER)
    di_rows = [[Paragraph(d[0], di_lbl), Paragraph(d[1], s['body'])] for d in di]
    di_t = Table(di_rows, colWidths=[18*mm, CW-18*mm])
    di_styles = [
        ('TOPPADDING', (0,0), (-1,-1), 9), ('BOTTOMPADDING', (0,0), (-1,-1), 9),
        ('LEFTPADDING', (0,0), (-1,-1), 10),
        ('LINEBELOW', (0,0), (-1,-2), 0.4, BORDER),
        ('BOX', (0,0), (-1,-1), 0.5, BORDER),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]
    for i in range(4):
        di_styles.append(('BACKGROUND', (0,i), (0,i), ACCENT))
        di_styles.append(('BACKGROUND', (1,i), (1,i), WHITE))
    di_t.setStyle(TableStyle(di_styles))
    story.append(di_t)
    story.append(Spacer(1, 12))

    # Brainstorming
    story.append(section_label('Structured Thinking'))
    story.append(section_title('BRAINSTORMING'))
    story.append(accent_bar())
    story.append(Spacer(1, 4))

    story.append(Paragraph('<b>What is it?</b> A structured way to generate ideas when asked open-ended questions like "What could be causing this?" or "What options does the client have?"', s['body']))
    story.append(Spacer(1, 6))

    story.append(Paragraph('<b>Master Structure — decompose any business problem into 3 buckets:</b>', s['body']))
    story.append(Spacer(1, 4))

    ms = [
        ('Outside Forces', ORANGE, 'Market saturation &bull; Competition (new entrant, pricing, better product) &bull; Macro trends (regulation, economy, tech) &bull; Customer behavior shifts'),
        ('Internal Levers', ACCENT, 'Revenue levers (pricing, volume, mix) &bull; Cost levers (fixed, variable, efficiency) &bull; Operations (capacity, quality, speed) &bull; Marketing'),
        ('Risks &amp; Opps', GREEN, 'Brand equity risks &bull; Financial exposure &bull; Strategic opportunities (partnerships, M&A, new markets) &bull; Timing'),
    ]
    ms_rows = [[
        Paragraph(m[0], ParagraphStyle('ml', fontName='Helvetica-Bold', fontSize=8.5, textColor=WHITE, alignment=TA_CENTER)),
        Paragraph(m[2], s['body']),
    ] for m in ms]
    ms_t = Table(ms_rows, colWidths=[32*mm, CW-32*mm])
    ms_styles = [
        ('TOPPADDING', (0,0), (-1,-1), 9), ('BOTTOMPADDING', (0,0), (-1,-1), 9),
        ('LEFTPADDING', (0,0), (-1,-1), 10),
        ('LINEBELOW', (0,0), (-1,-2), 0.4, BORDER),
        ('BOX', (0,0), (-1,-1), 0.5, BORDER),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]
    for i, m in enumerate(ms):
        ms_styles.append(('BACKGROUND', (0,i), (0,i), m[1]))
        ms_styles.append(('BACKGROUND', (1,i), (1,i), WHITE))
    ms_t.setStyle(TableStyle(ms_styles))
    story.append(ms_t)
    story.append(Spacer(1, 5))

    for r in [
        'Max 5 high-level buckets — must be MECE (Mutually Exclusive, Collectively Exhaustive)',
        'Generate 7-10 ideas within your structure, then PRIORITIZE — tell the interviewer which to explore first and why',
        '<b>Mid-case action plan:</b> When you find a problem, structure 3 paths: Fix it / Grow around it / Exit. Drill down the most promising.',
    ]:
        story.append(bul(r, s))
    story.append(PageBreak())

    # ═════════════════════════════════════════════════════════
    # SECTION 15: SYNTHESIS
    # ═════════════════════════════════════════════════════════
    story.append(section_label('Communication'))
    story.append(section_title('HOW TO CLOSE A CASE'))
    story.append(accent_bar())
    story.append(Spacer(1, 4))

    story.append(Paragraph('<b>What is it?</b> Your final 30-60 seconds — the recommendation the interviewer remembers most. Structure it, don\'t just list findings.', s['body']))
    story.append(Spacer(1, 6))

    # Bad
    bad_s2 = ParagraphStyle('bad', fontName='Courier', fontSize=8, leading=12, textColor=TEXT)
    bad_t = Table([[Paragraph('Avoid: listing everything you learned', ParagraphStyle('bh', fontName='Helvetica-Bold', fontSize=9, textColor=RED))],
                   [Paragraph('"Sales are down 20%, competitors have a cost advantage, Fortune 500 segment is growing..."<br/><br/>Problem: the interviewer can\'t tell what the client should DO.', bad_s2)]],
                  colWidths=[CW])
    bad_t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), RED_L), ('BOX', (0,0), (-1,-1), 0.5, RED),
        ('TOPPADDING', (0,0), (-1,-1), 8), ('BOTTOMPADDING', (0,0), (-1,-1), 8),
        ('LEFTPADDING', (0,0), (-1,-1), 12),
    ]))
    story.append(bad_t)
    story.append(Spacer(1, 6))

    # Good
    good_t = Table([[Paragraph('Use this structure:', ParagraphStyle('gh', fontName='Helvetica-Bold', fontSize=9, textColor=GREEN))],
                    [Paragraph('1. LEAD WITH ACTION: "You should [do X]."<br/>2. BECAUSE: "[key finding 1]."<br/>3. ADDITIONALLY: "[key finding 2]."<br/>4. FURTHERMORE: "[key finding 3]."<br/>5. RESTATE: "Therefore, I recommend [X]."<br/><br/>End with next steps: "As a next step, I\'d validate this with a 2-week pilot."', bad_s2)]],
                   colWidths=[CW])
    good_t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), GREEN_L), ('BOX', (0,0), (-1,-1), 0.5, GREEN),
        ('TOPPADDING', (0,0), (-1,-1), 8), ('BOTTOMPADDING', (0,0), (-1,-1), 8),
        ('LEFTPADDING', (0,0), (-1,-1), 12),
    ]))
    story.append(good_t)
    story.append(Spacer(1, 6))
    story.append(tip_box('Your closing argument should mirror your issue tree — 3 branches in the tree = 3 supporting facts in the close. Practice until you can synthesize any case in under 60 seconds.', s))
    story.append(PageBreak())

    # ═════════════════════════════════════════════════════════
    # SECTION 16: QUICK REFERENCE
    # ═════════════════════════════════════════════════════════
    story.append(section_label('Reference'))
    story.append(section_title('FRAMEWORK BY CASE TYPE'))
    story.append(accent_bar())
    story.append(Spacer(1, 6))

    qr = [
        ['Case Type', 'Primary Framework', 'Also Consider'],
        ['Profitability drop', 'Profitability Framework', 'RCA, Business Situation'],
        ['Market entry', 'Market Entry (4 Lenses)', "Porter's 5 Forces, 3Cs"],
        ['M&A / Acquisition', 'M&A Framework', 'Profitability, Biz Situation'],
        ['Pricing strategy', 'Pricing (3 Lenses)', '4Ps, Profitability'],
        ['Growth strategy', 'Ansoff Matrix', '3Cs, Market Sizing'],
        ['Market sizing', 'Top-Down or Bottom-Up', 'MECE Brainstorming'],
        ['KPI design', 'AARRR / North Star', 'Business Situation'],
        ['Metric drop', 'Root Cause Analysis', 'AARRR, Decomposition'],
        ['Cost reduction', 'Cost Structure + Break-Even', 'Profitability, CM'],
        ['Competitive analysis', "Porter's 5 Forces", '3Cs, Market Structure'],
        ['New product launch', '4Ps Framework', 'Business Situation, Pricing'],
        ['Operations', 'Cost Structure', 'Break-Even, Profitability'],
    ]
    qrh = ParagraphStyle('qh', fontName='Helvetica-Bold', fontSize=8, textColor=WHITE)
    qrl = ParagraphStyle('ql2', fontName='Helvetica-Bold', fontSize=8, textColor=ACCENT)
    qrv = ParagraphStyle('qv', fontName='Helvetica', fontSize=8, textColor=TEXT)
    qrn = ParagraphStyle('qn', fontName='Helvetica-Oblique', fontSize=7.5, textColor=MUTED)

    qr_rows = []
    for i, row in enumerate(qr):
        if i == 0:
            qr_rows.append([Paragraph(c, qrh) for c in row])
        else:
            qr_rows.append([Paragraph(row[0], qrl), Paragraph(row[1], qrv), Paragraph(row[2], qrn)])

    qr_t = Table(qr_rows, colWidths=[48*mm, 58*mm, CW-106*mm])
    qr_styles = [
        ('BACKGROUND', (0,0), (-1,0), ACCENT2),
        ('TOPPADDING', (0,0), (-1,-1), 5), ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('BOX', (0,0), (-1,-1), 0.5, BORDER),
        ('INNERGRID', (0,0), (-1,-1), 0.3, BORDER),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]
    for i in range(1, len(qr)):
        qr_styles.append(('BACKGROUND', (0,i), (-1,i), WHITE if i % 2 == 0 else SURFACE2))
    qr_t.setStyle(TableStyle(qr_styles))
    story.append(qr_t)

    story.append(Spacer(1, 15*mm))
    story.append(brand_t)

    # ── Build ─────────────────────────────────────────────────
    doc.build(story, onFirstPage=header_footer, onLaterPages=header_footer)
    print(f'PDF saved: {OUT}')

build()
