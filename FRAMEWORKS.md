# Case Interview Frameworks — Complete Reference Guide
**By Alok The Analyst** | aloktheanalyst.com

A beginner-friendly guide to every framework you need for consulting, analytics, and data analyst interviews. Each framework includes what it is, when to use it, how to apply it step by step, common mistakes, and pro tips.

---

## HOW TO USE THIS GUIDE

If you're new to case interviews, start here:

1. **Read the Master Approach first** — it applies to every single case
2. **Learn the 6 Core Frameworks** — Profitability, Business Situation, Market Entry, M&A, Pricing, Porter's 5 Forces
3. **Practice Market Sizing and RCA** — these come up in almost every analytics interview
4. **Memorize the Finance Formulas** — you'll need mental math in every case
5. **Master the Synthesis** — a great close can save an average case performance

**Golden Rule:** Never memorize frameworks blindly. Understand WHY each piece exists so you can adapt it to any question.

---

## MASTER PROBLEM-SOLVING APPROACH

*This is not a framework — it's the METHOD you use in every single case, regardless of the topic.*

### The 4 Core Problem-Solving Tools

Think of a case interview like being a doctor. You don't just run random tests — you hypothesize, investigate systematically, and then prescribe.

**Tool 1: Hypothesis**
- What it is: An educated guess about the answer, stated early (within the first 5 minutes)
- Why it matters: It gives your analysis direction. Without a hypothesis, you're just collecting random facts.
- How to do it: "Based on what you've told me, I hypothesize that the profit decline is driven by rising costs rather than falling revenue, because the client mentioned expanding to new geographies recently."
- Common mistake: Being afraid to guess wrong. It's okay — hypotheses are meant to be revised.

**Tool 2: Issue Tree / Framework**
- What it is: A logical structure that breaks the problem into pieces. If you prove ALL branches, the hypothesis is confirmed.
- Why it matters: It ensures you don't miss anything (MECE = Mutually Exclusive, Collectively Exhaustive).
- How to do it: Draw a tree. Each branch is one part of the problem. Together, they cover everything. No overlaps.
- Example: "Profit decline" splits into "Revenue problem?" and "Cost problem?" — these two cover all possibilities with no overlap.

**Tool 3: Drill-Down Analysis**
- What it is: Systematically testing each branch of your tree with data and logic.
- Why it matters: This is where you actually find the answer. Most candidates do this poorly — they jump around instead of going deep.
- How to do it: Pick the most likely branch → ask for data → analyze → confirm or eliminate → move to next branch.
- Key technique: Segment → Isolate → Repeat. Keep breaking things into smaller pieces until you find the root cause.

**Tool 4: Synthesis**
- What it is: Your final recommendation — structured, action-oriented, and concise.
- Why it matters: The last 30 seconds of your case is what the interviewer remembers most.
- How to do it: "You should [action]. Because [fact 1], [fact 2], and [fact 3]. Therefore, I recommend [restate action]."

### The 3-Question Repetition

At ANY point during the case — beginning, middle, or when you're stuck — answer these 3 questions:

| Question | What it does |
|---|---|
| **Objective** | What decision are we helping the client make? (Keeps you on track) |
| **Hypothesis** | If we ended the case right now, what would we recommend? Why? (Forces you to always have an answer ready) |
| **Next Steps** | What would we need to analyze to be more confident? (Drives the case forward) |

**Pro tip:** If you ever feel lost in a case, pause and answer these 3 questions. It immediately reorients you.

---

## CORE FRAMEWORKS

### 1. Profitability Framework

**What is it?** A structured way to figure out WHY a company's profits are changing — is it a revenue problem or a cost problem?

**When to use it:** Any time the case mentions profit decline, margin pressure, financial performance, or "the client is losing money."

**The Structure:**

```
Profit = Revenue − Cost

Revenue
  ├── Price per unit — Has pricing changed? Discounts? Competition?
  └── Volume (# units sold) — Are fewer people buying?
       ├── Segment by geography — Is one region underperforming?
       ├── Segment by product line — Is one product dragging us down?
       └── Segment by customer type — Are we losing a specific customer group?

Cost
  ├── Fixed Costs — Don't change with volume
  │     Examples: rent, salaries, insurance, equipment leases
  │     Key question: Can we reduce these without hurting the business?
  │
  └── Variable Costs — Change proportionally with volume
        Examples: raw materials, packaging, shipping, sales commissions
        Key question: Has the cost per unit increased? Why?
        Variable Cost per Unit × # Units = Total Variable Cost
```

**Step-by-step approach:**

1. **Start with the equation:** Ask "Is this a revenue problem, a cost problem, or both?"
2. **Go where the problem is:** If revenue is down, drill into price vs volume. If costs are up, drill into fixed vs variable.
3. **Segment to isolate:** Don't just say "revenue is down." Find WHICH product, WHICH region, WHICH customer segment.
4. **Benchmark:** Compare each metric to (a) the same metric last year, and (b) the industry average.
5. **Find the root cause:** Keep asking "why?" until you reach something actionable.

**Key Formulas:**
- **Contribution Margin** = Price per Unit − Variable Cost per Unit *(how much each sale contributes toward covering fixed costs)*
- **Break-Even Units** = Fixed Costs ÷ Contribution Margin per Unit *(minimum units to stop losing money)*
- **Profit Margin** = Profit ÷ Revenue *(expressed as %, measures efficiency)*

**Common mistakes:**
- Jumping straight to cost-cutting without checking if revenue is the real problem
- Forgetting to segment — "revenue is down" is not an insight; "revenue from North India dropped 30% while other regions grew" IS an insight
- Mixing up fixed and variable costs (e.g., calling salaries "variable" — they're fixed unless you lay people off)

**Pro tip:** In most profitability cases, the answer is NOT "raise prices and cut costs." The interviewer wants you to find the specific root cause and recommend a targeted fix.

---

### 2. Business Situation Framework

**What is it?** A comprehensive 4-box framework for analyzing any business situation qualitatively. Think of it as a complete X-ray of the business environment.

**When to use it:** Market entry, new product launch, growth strategy, turnaround, competitive response — basically any case that needs a broad qualitative assessment. Covers ~50% of all consulting cases.

**The 4 Boxes:**

```
┌─────────────────────────────────────────────────┐
│               BUSINESS SITUATION                │
├────────────────────┬────────────────────────────┤
│     CUSTOMER       │       PRODUCT              │
│                    │                            │
│  • Who buys?       │  • What problem does it    │
│    (segments)      │    solve?                  │
│  • What do they    │  • Commodity or unique?    │
│    need?           │  • Substitutes?            │
│  • Price           │  • Complementary goods?    │
│    sensitivity?    │  • Life cycle stage?       │
│  • How do they     │    (intro/growth/          │
│    buy? (channel)  │    maturity/decline)       │
│  • Customer        │  • Bundling                │
│    concentration   │    opportunities?          │
│    (top 3 = what   │                            │
│    % of revenue?)  │                            │
├────────────────────┼────────────────────────────┤
│     COMPANY        │      COMPETITION           │
│                    │                            │
│  • Core            │  • Who are the key         │
│    competencies    │    competitors?            │
│  • Cost structure  │  • Their market share      │
│  • Financial       │    and growth?             │
│    health          │  • Their cost structure    │
│  • Distribution    │    vs ours?               │
│    channels        │  • Their value             │
│  • Management      │    proposition?            │
│    quality         │  • Barriers to entry?      │
│                    │  • Risk of retaliation?    │
└────────────────────┴────────────────────────────┘
```

**Step-by-step approach:**

1. **Don't cover all 4 boxes equally.** The case question tells you which boxes matter most. Market entry? Focus on Customer + Competition. Product launch? Focus on Product + Customer.
2. **Start with Customer** — everything in business starts with understanding who's paying.
3. **Use 2-3 sub-questions per box** — don't try to cover every bullet. Pick what's relevant.
4. **Connect the boxes** — the best candidates show how insights from one box affect another (e.g., "Because customers are price-sensitive [Customer], and competitors are offering discounts [Competition], our premium pricing [Product] may need adjustment").

**Common mistakes:**
- Treating it as a checklist and mechanically going through every sub-bullet
- Spending equal time on all 4 boxes instead of prioritizing based on the question
- Not connecting insights across boxes

**Pro tip:** This framework overlaps with many others (3Cs, 4Ps). If the interviewer gives you a broad question like "What should the client do?", start here. You can always drill deeper into Profitability or Market Entry sub-frameworks later.

---

### 3. Market Entry Framework

**What is it?** A structured way to evaluate whether a company should enter a new market — and HOW to do it. Think of it as a go/no-go decision framework.

**When to use it:** "Should company X enter market Y?", geographic expansion, new product line, new customer segment, international expansion.

**The 4 Lenses:**

```
Lens 1: MARKET ATTRACTIVENESS — Is this market worth entering?
  ├── Market size: TAM (Total Addressable Market), SAM (Serviceable), SOM (Obtainable)
  │     TAM = everyone who could theoretically buy
  │     SAM = the segment you can actually reach
  │     SOM = realistic share you can capture in 3-5 years
  ├── Growth rate — Is the market growing, flat, or shrinking?
  ├── Profitability — Are players in this market making money?
  └── Regulatory environment — Any legal barriers, licenses, or compliance requirements?

Lens 2: COMPETITIVE LANDSCAPE — Can we win against existing players?
  ├── Number and strength of competitors (fragmented vs concentrated)
  ├── Barriers to entry (capital, technology, brand, switching costs)
  ├── Risk of retaliation — Will incumbents fight back aggressively?
  └── Use Porter's 5 Forces for deeper analysis (see below)

Lens 3: COMPANY CAPABILITIES — Can we actually pull this off?
  ├── Does the client have relevant skills, assets, or technology?
  ├── Previous experience in similar markets?
  ├── Financial capacity — Can they fund 2-3 years of losses while building?
  └── Cultural and operational fit — Can the existing org support this?

Lens 4: ENTRY MODE — How should we enter?
  ├── Build organically (greenfield) — slow but full control
  ├── Acquire a competitor (M&A) — fast but expensive
  ├── Joint venture / partnership — shared risk, shared reward
  └── Timing: now vs later? Pilot in one city vs full national launch?
```

**Step-by-step approach:**

1. **Score each lens** mentally (1-5). This makes your recommendation data-driven.
2. **Start with Market Attractiveness** — if the market is tiny, shrinking, or unprofitable, the answer may be "no" regardless of other lenses.
3. **Entry Mode should come last** — first decide IF you should enter, then figure out HOW.
4. **Always do a quick financial check:** Cost to enter + ongoing costs vs expected revenue. Calculate ROI and payback period.

**Common mistakes:**
- Saying "yes, enter" without quantifying the financial opportunity
- Ignoring retaliation risk — large incumbents can undercut your pricing for years
- Not considering the "do nothing" option — sometimes the best answer is "don't enter"

**Pro tip:** The best answers are conditional: "Enter IF [condition]. Start with [specific approach]. Expand to [next step] after [milestone]."

---

### 4. M&A Framework (Mergers & Acquisitions)

**What is it?** A framework for evaluating whether one company should buy another. It covers the market context, both companies, and whether the deal creates value.

**When to use it:** "Should we acquire company X?", merger evaluation, due diligence cases, "a PE firm is considering buying..."

**The 4 Pillars:**

```
Pillar 1: THE MARKET
  ├── Is target in the same market or adjacent?
  ├── Market size, growth rate, and profitability
  └── Competitive intensity — will the acquisition change market dynamics?

Pillar 2: THE TARGET (company being acquired)
  ├── Financial health — Revenue, profit, cash flow (current and projected)
  ├── Key assets — IP, technology, customer base, distribution network
  ├── Management quality — Will key people stay post-acquisition?
  └── Culture fit — How similar are the two organizations?

Pillar 3: THE BUYER (our client)
  ├── Strategic rationale — WHY buy? (3 valid reasons:)
  │     1. Target is undervalued (financial arbitrage)
  │     2. Synergies make combined entity worth more than sum
  │     3. Strategic control (eliminate competitor, acquire capability)
  ├── Financing — How will the deal be funded? (cash, debt, stock swap)
  ├── Prior M&A experience — Track record of successful integration?
  └── Is this the right timing? (market cycle, interest rates, target readiness)

Pillar 4: SYNERGIES & RISKS
  ├── Revenue synergies — Cross-selling, access to new customers/markets
  ├── Cost synergies — Eliminate redundancies (HQ, back-office, procurement)
  ├── Combined value vs separate — Is 1+1 > 2?
  └── Biggest risks:
       ├── Integration failure (IT systems, processes)
       ├── Culture clash (different work styles, values)
       ├── Key employee departure
       └── Regulatory/antitrust issues
```

**Step-by-step approach:**

1. **Start with strategic rationale** — "Why does this acquisition make sense?" If you can't answer this clearly, the deal is probably bad.
2. **Quantify synergies in real numbers** — "The cost synergy is Rs.400 Cr/year from consolidating warehouses," not just "there are synergies."
3. **Calculate a fair price range** — Use ROI, payback period, or a multiple of revenue/EBITDA.
4. **Identify the #1 risk** and propose a mitigation plan.

**Key Formulas:**
- **Maximum acquisition price** = Standalone value of target + Present value of synergies
- **ROI on acquisition** = Annual synergy value ÷ Acquisition price
- **Payback period** = Acquisition price ÷ Annual net benefit

**Common mistakes:**
- Forgetting to value the target INDEPENDENTLY before adding synergies
- Assuming all synergies will be realized (industry average: only 60-70% are captured)
- Ignoring integration costs (typically 5-15% of deal value)

**Pro tip:** In interviews, always ask "What is the client's primary motivation for this acquisition?" The answer tells you which pillar to focus on.

---

### 5. Pricing Framework

**What is it?** A 3-lens approach to determine the optimal price for a product or service. Think of it as finding the sweet spot between "too cheap" (leaving money on the table) and "too expensive" (no one buys).

**When to use it:** New product pricing, repricing existing products, competitive pricing response, price optimization.

**The 3 Lenses:**

```
┌─────────────────────────────────────────────────────────┐
│                    PRICING SPECTRUM                      │
│                                                         │
│  FLOOR              SWEET SPOT              CEILING     │
│  (Cost-Based)       (Competitor-Based)      (Value-Based)│
│  ◄─────────────────────●─────────────────────────────►  │
│                                                         │
│  Below this =        This is where          Above this =│
│  you lose money      most deals happen      no one buys │
└─────────────────────────────────────────────────────────┘

Lens 1: COST-BASED PRICING (The Floor — minimum viable price)
  ├── Fixed costs allocated per unit (Total FC ÷ expected units)
  ├── Variable cost per unit (materials, labor, shipping)
  ├── Add target profit margin
  └── Result: The absolute minimum price to stay profitable

Lens 2: VALUE-BASED PRICING (The Ceiling — maximum willingness to pay)
  ├── What is the customer's next best alternative?
  ├── What unique value does our product add over that alternative?
  ├── Quantify that value in money terms
  └── Willingness to pay = Alternative's price + Value of added features

Lens 3: COMPETITOR-BASED PRICING (The Anchor — market reference point)
  ├── What do substitutes/competitors charge?
  ├── How does our product compare on key dimensions?
  └── Position: premium (>competitor), parity (=), or discount (<)?
```

**Step-by-step approach:**

1. **Calculate the floor** (cost-based) — you need to know your minimum viable price
2. **Estimate the ceiling** (value-based) — what's the maximum a customer would pay?
3. **Check the market** (competitor-based) — where do competitors sit?
4. **Choose your position** within the range based on your pricing objective:
   - Maximize profit → price closer to ceiling
   - Maximize market share → price closer to floor (penetration pricing)
   - Match market → price at competitor level

**Also consider:**
- Product tiering (good/better/best) — e.g., iPhone SE vs iPhone Pro
- Cross-sell and up-sell opportunities
- Psychological pricing (Rs.999 vs Rs.1,000)
- Volume discounts for B2B customers

**Common mistakes:**
- Only looking at cost-based pricing (most common beginner mistake)
- Forgetting that price affects volume — lower price ≠ always higher revenue
- Not considering the price of doing NOTHING (the customer's status quo)

**Pro tip:** Start your analysis with value-based pricing (what's the value to the customer?), then use cost-based as a sanity check (can we afford to sell at this price?), and competitor-based to position within the market.

---

### 6. Porter's 5 Forces

**What is it?** A framework for analyzing the competitive structure of an entire INDUSTRY (not just one company). It tells you WHY an industry is profitable or not.

**When to use it:** Industry attractiveness analysis, competitive dynamics, "should we enter this industry?", "why are margins declining industry-wide?"

**The 5 Forces:**

```
                    ┌─────────────────────┐
                    │  THREAT OF NEW      │
                    │  ENTRANTS           │
                    │                     │
                    │ • Regulatory barriers│
                    │ • Capital required  │
                    │ • Economies of scale│
                    │ • Network effects   │
                    │ • Brand loyalty     │
                    └─────────┬───────────┘
                              │
┌────────────────┐   ┌───────┴────────┐   ┌────────────────┐
│ SUPPLIERS'     │   │   EXISTING     │   │ BUYERS'        │
│ BARGAINING     │──►│   RIVALRY      │◄──│ BARGAINING     │
│ POWER          │   │                │   │ POWER          │
│                │   │ • # competitors│   │                │
│ • Concentration│   │ • Product      │   │ • Concentration│
│ • Switching    │   │   similarity   │   │ • Price        │
│   costs        │   │ • Financial    │   │   sensitivity  │
│ • Differentia- │   │   health       │   │ • Information  │
│   tion         │   │ • Exit barriers│   │   availability │
│ • Forward      │   │ • Growth rate  │   │ • Switching    │
│   integration  │   │                │   │   costs        │
└────────────────┘   └───────┬────────┘   └────────────────┘
                              │
                    ┌─────────┴───────────┐
                    │  THREAT OF          │
                    │  SUBSTITUTES        │
                    │                     │
                    │ • Alternative       │
                    │   solutions         │
                    │ • Ease of switching │
                    │ • Price-performance │
                    │   of substitutes    │
                    └─────────────────────┘
```

**How to interpret:**
- **HIGH force = BAD for industry profitability** (e.g., high buyer power means buyers squeeze your margins)
- **LOW force = GOOD for industry profitability** (e.g., low threat of substitutes means customers have few alternatives)

**Step-by-step approach:**

1. **Rate each force** as High, Medium, or Low
2. **Identify the 1-2 forces** that matter most in this specific industry
3. **Connect to the case question** — "The industry is structurally unattractive because of [force], which means [implication for the client]"

**Common mistakes:**
- Analyzing a COMPANY instead of an INDUSTRY — Porter's 5 Forces is about the entire playing field, not one player
- Listing all 5 forces equally — always prioritize the 1-2 that actually drive profitability
- Confusing "substitutes" with "competitors" — substitutes are DIFFERENT products that solve the SAME problem (e.g., trains vs flights, not Pepsi vs Coke)

**Pro tip:** A company can be highly profitable even in an unattractive industry (by having a moat), and a company can struggle even in an attractive industry (if they execute poorly). Porter's 5 Forces tells you about the industry backdrop, not the company's destiny.

---

### 7. 4Ps Marketing Framework

**What is it?** The classic marketing mix framework. It covers the 4 levers any company can pull to market a product or service.

**When to use it:** Marketing strategy, product launch planning, "how should we position this product?", go-to-market strategy.

**The 4Ps:**

```
PRODUCT — What are we selling?
  ├── What customer need does it fulfill?
  ├── Who uses it, where, and how?
  ├── Is it a physical good or a service?
  ├── Where is it in the product life cycle? (introduction / growth / maturity / decline)
  └── What are the substitutes?

PRICE — What should we charge?
  ├── What is the perceived value to the customer?
  ├── What do competitors charge?
  ├── How price-sensitive is the target customer?
  └── What are the production costs? (links to Pricing Framework)

PROMOTION — How do we tell people about it?
  ├── What marketing messages and positioning?
  ├── Which media channels? (TV, digital, social, influencer, print)
  ├── What timing is best? (seasonal, event-driven)
  └── What are competitors doing in promotion?

PLACE (Distribution) — How does it reach the customer?
  ├── Which channels? (online, retail, wholesale, direct sales)
  ├── What channel does the target customer prefer?
  ├── Do we need a sales force?
  └── How do competitors distribute?
```

**Common mistakes:**
- Spending all your time on Product and Price, neglecting Promotion and Place
- Not linking the 4Ps to each other — pricing should match the promotion message and the distribution channel

**Pro tip:** For digital/tech products, some consultants add 3 more Ps: People (customer service), Process (user experience), Physical Evidence (UI/branding). But for interviews, the classic 4Ps are sufficient.

---

### 8. 3Cs Framework

**What is it?** A strategic overview framework that looks at the three most important stakeholders in any business situation. Simpler and faster than the Business Situation Framework.

**When to use it:** Quick strategic assessment, competitive positioning, early-stage analysis before drilling deeper. Also good when you have limited time.

**The 3Cs:**

```
CUSTOMERS
  ├── Demographics (age, income, location, behavior)
  ├── Needs and pain points — What problem are they solving?
  ├── Segment size and growth — Which segments are worth pursuing?
  └── Price sensitivity — How much does price drive their decision?

COMPETITION
  ├── Value proposition and brand strength
  ├── Market share and growth trajectory
  └── Financial health — Are competitors well-funded or struggling?

COMPANY
  ├── Product offering and quality
  ├── Profitability and financial resources
  ├── Core competencies — What are we uniquely good at?
  ├── Unique selling proposition (USP)
  └── What are our weaknesses?
```

**When to use 3Cs vs Business Situation:**
- **3Cs** = faster, good for a 5-minute initial analysis
- **Business Situation** = deeper, includes "Product" as a separate box, better for 15+ minute cases

**Pro tip:** The 3Cs is a great "opening move." Use it to structure your initial thinking, then switch to a more specific framework (Profitability, Market Entry, etc.) once you understand the problem better.

---

## MARKET SIZING FRAMEWORKS

**What is market sizing?** Estimating the total revenue or volume of a market using logic and assumptions. There is no "correct" answer — interviewers evaluate your APPROACH, not your number.

### Top-Down Market Sizing

**What is it?** Start with a large, known number (total population or GDP) and narrow it down to your target market.

**When to use:** When you can logically filter from a large population to your target.

```
Formula: Market Size = Population × Penetration Rate × Purchase Frequency × Average Price

Step 1: Start with total population
  └── India: 1.4B | US: 330M | World: 8B

Step 2: Filter by target demographic
  └── Age? Income? Urban/rural? Gender? (Each filter reduces the number)

Step 3: Apply penetration rate
  └── What % of that group actually buys this type of product?

Step 4: Estimate purchase frequency
  └── How often do they buy? Daily? Monthly? Once a year?

Step 5: Estimate average ticket size
  └── How much do they spend per purchase?

Step 6: Calculate and sense-check
  └── Does your final number feel reasonable? Compare to known benchmarks.
```

**Example thought process:** "How big is the toothpaste market in India?"
- Population: 1.4B → Households: ~300M → Urban: ~120M, Rural: ~180M
- Penetration: Urban 95%, Rural 70% → (114M + 126M) = 240M households buying toothpaste
- Frequency: 1 tube/household/month = 12/year
- Price: Rs.80/tube average
- Market = 240M × 12 × Rs.80 = Rs.2,30,400 Cr ≈ Rs.2.3 Lakh Cr

### Bottom-Up Market Sizing

**What is it?** Start from individual units (stores, companies, operators) and build up to the total market.

**When to use:** When you can count supply-side units more easily than demand-side population.

```
Formula: Market Size = # Supply Units × Revenue per Unit per Period

Step 1: Count supply units
  └── How many stores, factories, operators, or providers exist?

Step 2: Estimate revenue per unit per time period
  └── How much does each unit sell per day/month/year?

Step 3: Multiply to get total market

Step 4: Cross-validate with top-down approach
  └── Do both methods give you a similar answer? If yes, your assumptions are solid.
```

### Key Facts to Memorize

| Category | Fact |
|---|---|
| **World** | ~8 billion people |
| **India** | 1.4 billion, ~300M households, ~35% urban |
| **USA** | 330 million, ~120M households |
| **China** | 1.4 billion |
| **Indonesia** | 280 million |
| **Brazil** | 210 million |
| **Conversions** | 1 mile = 5,280 feet, 1 km = 0.62 miles, 1 inch = 2.54 cm |
| **India GDP** | ~$3.7 trillion (Rs.310 Lakh Cr) |
| **India avg household income** | ~Rs.3.5 Lakh/year |

**Common mistakes in market sizing:**
- Making too many assumptions without stating them
- Not rounding — use clean numbers (300M not 298M)
- Forgetting to sense-check at the end
- Spending too long on one step instead of moving through the full calculation

**Pro tip:** Always state your assumptions BEFORE calculating. "I'll assume India has 1.4B people, about 300M households, and roughly 35% are urban. Does that seem reasonable?" This shows structured thinking and lets the interviewer correct you early.

---

## ROOT CAUSE ANALYSIS (RCA)

**What is it?** A systematic method for diagnosing WHY a metric dropped. This is the #1 framework for data analyst and analytics interviews.

### Decomposition Framework

**When to use:** "DAU dropped 20%", "conversion rate fell", "revenue declined this quarter" — any metric drop investigation.

```
Step 1: DEFINE AND DECOMPOSE the metric
  └── Break the metric into its components
       Example: Revenue = Users × Conversion Rate × Average Order Value
       Then ask: Is it a REACH problem or a DEPTH problem?
       ├── Reach: Fewer users seeing/touching the product
       └── Depth: Same users but lower engagement per visit

Step 2: CHECK INTERNAL vs EXTERNAL causes
  ├── Internal: Product changes, bugs, UI/UX issues, pricing changes,
  │             experiments gone wrong, infrastructure outages
  └── External: Competitor launched something, seasonality, economic downturn,
               regulatory changes, news events

Step 3: SEGMENT to isolate the problem
  ├── By time period — When exactly did the drop start?
  ├── By platform — iOS vs Android? Web vs App?
  ├── By user segment — New vs returning? Geography? Age group?
  ├── By funnel stage — Where in the funnel are users dropping off?
  └── By feature — Which specific feature/page shows the decline?

Step 4: FORM AND TEST hypotheses
  └── "I hypothesize [X] caused the drop because [Y].
       To confirm, I would check [Z]."

Step 5: RECOMMEND a fix
  ├── Short-term: Stop the bleeding (e.g., rollback a buggy release)
  └── Long-term: Fix the root cause and prevent recurrence
       (e.g., add automated tests, monitoring alerts)
```

**Common mistakes:**
- Looking at aggregate data instead of segmenting — the problem is almost always in ONE specific segment
- Assuming the cause is internal without checking external factors
- Jumping to solutions before understanding the root cause

**Pro tip:** The "when did it start?" question is the most powerful diagnostic tool. If the metric dropped on March 15 and you shipped a new feature on March 14, you've probably found your cause.

### AARRR / Pirate Metrics Framework

**What is it?** A framework for organizing product metrics across the entire user lifecycle. Created by Dave McClure. Essential for product analytics roles.

**When to use:** KPI design, product metric selection, "what metrics should we track?", analytics case studies.

```
A — ACQUISITION:  How do users find us?
                  Metrics: CAC (Customer Acquisition Cost), CTR, installs, sign-ups
                  Example: "We spend Rs.500 per install via Google Ads"

A — ACTIVATION:   Do users get value on first visit?
                  Metrics: Onboarding completion rate, D1 retention, first purchase
                  Example: "45% of new users complete their first lesson within 24 hours"

R — RETENTION:    Do users come back?
                  Metrics: D7/D30 retention, churn rate, MAU/DAU ratio
                  Example: "30-day retention is 22%, meaning 78% of users leave within a month"

R — REVENUE:      How do we make money?
                  Metrics: ARPU, LTV, conversion rate (free → paid)
                  Example: "LTV is Rs.2,400 and CAC is Rs.500, so LTV/CAC = 4.8x"

R — REFERRAL:     Do users tell others?
                  Metrics: NPS (Net Promoter Score), virality coefficient, referral rate
                  Example: "Each user invites 0.3 new users — we need >1.0 for viral growth"
```

**North Star Metric:** A single metric that captures the core value your product delivers to users. It predicts long-term success better than revenue.

| Product Type | North Star Metric Example |
|---|---|
| Social media | DAU (Daily Active Users) |
| E-commerce | Weekly Active Buyers |
| EdTech | Minutes of Learning per Active User per Week |
| SaaS | Weekly Active Teams |
| Payments | Monthly Transaction Volume |

**Pro tip:** If a metric drop question comes up in an analytics interview, start with AARRR to locate WHERE in the funnel the problem is, then use the RCA Decomposition Framework to diagnose WHY.

---

## BUSINESS JUDGMENT FRAMEWORKS

### Growth Strategy (Ansoff Matrix)

**What is it?** A 2×2 matrix that maps out 4 possible growth strategies based on whether you're targeting existing or new markets with existing or new products.

**When to use:** "How should the client grow?", revenue growth strategy, strategic planning.

```
                    EXISTING PRODUCTS          NEW PRODUCTS
                 ┌──────────────────────┬──────────────────────┐
 EXISTING        │  MARKET PENETRATION  │  PRODUCT DEVELOPMENT │
 MARKETS         │                      │                      │
                 │  Lowest risk.        │  Medium risk.        │
                 │  Sell more of what   │  New products to     │
                 │  you have to who     │  existing customers. │
                 │  you already serve.  │                      │
                 │                      │  Example: Apple      │
                 │  Example: Increase   │  launching AirPods   │
                 │  Swiggy's order      │  to iPhone users     │
                 │  frequency via       │                      │
                 │  loyalty program     │                      │
                 ├──────────────────────┼──────────────────────┤
 NEW             │  MARKET DEVELOPMENT  │  DIVERSIFICATION     │
 MARKETS         │                      │                      │
                 │  Medium risk.        │  Highest risk.       │
                 │  Take existing       │  New products in     │
                 │  products to new     │  new markets.        │
                 │  geographies or      │                      │
                 │  customer segments.  │  Example: Amazon     │
                 │                      │  launching AWS       │
                 │  Example: Zepto      │  (cloud computing,   │
                 │  expanding to        │  totally different    │
                 │  Tier-2 cities       │  from e-commerce)    │
                 └──────────────────────┴──────────────────────┘
```

**Revenue growth formula:**
```
Revenue = Volume × Price
  ├── Grow Volume: More customers, higher frequency, expand to new segments
  └── Grow Price: Premium tiers, reduce discounts, value-add features
```

### Cost Structure Analysis

**What is it?** A framework for understanding where a company's money goes, and finding opportunities to reduce costs.

**When to use it:** Cost reduction cases, profitability improvement, cost benchmarking against competitors.

```
Cost Structure
  ├── Fixed Costs (period costs — don't change with output volume)
  │     ├── Examples: Rent, salaries, depreciation, marketing budgets, tech infrastructure
  │     ├── Key question: Can we reduce fixed costs without hurting scale or quality?
  │     └── Levers: Renegotiate leases, automate roles, consolidate offices
  │
  └── Variable Costs (unit costs — increase proportionally with volume)
        ├── Examples: COGS, sales commissions, delivery, packaging, payment processing fees
        ├── Key question: Can we reduce the cost per unit?
        └── Levers: Bulk purchasing, supplier negotiation, process optimization

Key Formulas:
  Contribution Margin = Price − Variable Cost per Unit
  Operating Leverage  = Fixed Costs / Total Costs
    └── Higher operating leverage = more risky, but more upside at scale
        (because each additional unit has very high margins)
```

### Break-Even Analysis

**What is it?** Determines the minimum sales needed to cover all costs — the point where you stop losing money.

**When to use it:** New business viability, product launch go/no-go, investment decisions.

```
Break-Even Units    = Fixed Costs ÷ Contribution Margin per Unit
Break-Even Revenue  = Fixed Costs ÷ Gross Margin %
Payback Period      = Initial Investment ÷ Annual Profit
```

**How to think about it:** Every unit you sell BELOW break-even loses money. Every unit ABOVE break-even earns pure contribution margin. This is why high-fixed-cost businesses (software, airlines) are either very profitable or very unprofitable — there's no middle ground.

### Market Structure Analysis

**What is it?** Determines whether a market is concentrated (few big players) or fragmented (many small players). This affects competitive strategy.

**When to use it:** Industry analysis, competitive assessment, M&A rationale.

```
HHI (Herfindahl-Hirschman Index) = Sum of (market share %)² for all players

  ├── HHI > 2,500 → Highly concentrated (near-monopoly)
  │     Example: Indian telecom (Jio ~40%, Airtel ~35%, Vi ~20%)
  ├── HHI 1,500–2,500 → Moderately concentrated
  │     Example: Indian e-commerce (Amazon, Flipkart, Meesho dominate)
  └── HHI < 1,500 → Competitive / fragmented
       Example: Indian restaurants (millions of small players)

Implications:
  • Concentrated → Hard to enter, pricing power exists, M&A may face regulatory scrutiny
  • Fragmented → Easy to enter, price competition is fierce, consolidation is an opportunity
```

---

## FINANCE FORMULAS (Must Know)

These formulas come up in almost every case. Memorize them.

| Formula | Equation | What It Tells You |
|---|---|---|
| **Revenue** | Volume × Price | How much money comes in. Also: Market Size × Market Share |
| **Cost** | Fixed Costs + Variable Costs | How much money goes out. VC scales with volume; FC doesn't |
| **Profit** | Revenue − Cost | The bottom line. Also called Net Income or Net Earnings |
| **Profit Margin** | Profit ÷ Revenue | Efficiency — what % of every rupee earned is kept as profit |
| **ROI** | Profit ÷ Initial Investment | Return on investment — higher is better. Usually per year |
| **Payback Period** | Investment ÷ Annual Profit | How many years to earn back the initial investment |
| **Contribution Margin** | Price − Variable Cost per Unit | How much each sale contributes toward covering fixed costs |
| **Break-Even Units** | Fixed Costs ÷ Contribution Margin | Minimum units needed to cover all fixed costs |

**Nice to Know (advanced):**
- **EBITDA** = Earnings Before Interest, Tax, Depreciation, Amortisation *(a proxy for operating cash flow)*
- **NPV** = Net Present Value *(adjusts future cash flows to today's value using a discount rate)*
- **ROE** = Profit ÷ Shareholder Equity *(return to shareholders)*
- **ROA** = Profit ÷ Total Assets *(how efficiently assets generate profit)*

---

## MATH TECHNIQUES (Case Interview Speed)

### Written Math Structures

You'll often get messy numbers in a case. Use these structures to stay organized:

1. **Tables** — Best for comparing revenue, cost, and margin across segments. Draw rows for segments, columns for metrics.
2. **Calculation Trees** — Best for multi-step calculations. Write each step as a branch, multiply/add as you go down.
3. **Straight-Line Conversion** — Best for unit conversion chains. Write units in a line and convert step by step: pallets → boxes → units → revenue.

### Mental Math Shortcuts

```
ROUNDING:
  Round numbers ±10%. Alternate rounding up and down to cancel errors.
  Example: 487 × 312 ≈ 500 × 300 = 150,000 (actual: 151,944 — only 1.3% off)

LABELS:
  k = thousand | m = million | b = billion
  Example: 20k × 6m = 120b

MULTIPLICATION TRICKS:
  × 25 = ÷ 4 × 100     → 36 × 25 = (36 ÷ 4) × 100 = 900
  × 50 = ÷ 2 × 100     → 68 × 50 = (68 ÷ 2) × 100 = 3,400
  × 75 = ÷ 4 × 300     → 68 × 75 = (68 ÷ 4) × 300 = 5,100

GROWTH:
  Short periods (2-3 yrs): Add percentages
    → 10% year 1 + 20% year 2 ≈ 32% total (exact: 1.1 × 1.2 = 1.32)
  Long periods: Rate × Years (Rule of 72 for doubling)
    → 7% growth × 10 years ≈ 70% total growth
    → Money doubles in ~72/rate years (72/7 ≈ 10 years)

PERCENTAGES:
  10% of anything: move decimal left
  5% = half of 10%
  1% = move decimal two places left
  → 17% of 4,500 = 10% (450) + 5% (225) + 2% (90) = 765
```

### Vocal Math Delivery

In a case interview, you must NARRATE your math. Silence while calculating is a red flag.

1. **State your approach BEFORE calculating:** "I'm going to multiply the number of users by the conversion rate to get paying customers."
2. **Narrate as you go:** "150 thousand users times 3% conversion gives us 4,500 paying users."
3. **Tie the result back:** "So we can expect about 4,500 paying customers, which at Rs.2,000 ARPU gives us Rs.90 lakh in revenue."

---

## DATA INTERPRETATION METHOD

**What is it?** A structured approach to analyzing charts, tables, and data exhibits that come up mid-case.

**When to use:** Whenever the interviewer hands you a chart, table, or data exhibit.

```
Step 1: UNDERSTAND the structure (don't skip this!)
  └── Read headers, axes, units, and time periods.
      Misreading a unit (thousands vs millions) derails everything.

Step 2: ANALYZE vertically, then horizontally
  ├── Vertical: What's true at a single point in time?
  │     "In 2024, Product A had 45% market share while Product B had 30%."
  └── Horizontal: What changed over time?
       "Product A's share dropped from 60% to 45% over 3 years."

Step 3: COMBINE insights across multiple exhibits
  └── Look for connections between different charts/tables.
       "Market share dropped (Exhibit 1) right when the competitor launched (Exhibit 2)."

Step 4: RELATE to the case question
  └── "This data suggests that the profit decline is driven by market share loss to
       competitor X, which means our hypothesis about pricing being too high is likely correct."
```

**Pro tip:** Always narrate your observations aloud. Don't just stare at the chart silently. Say what you see, even obvious things — it shows structured thinking.

---

## BRAINSTORMING FRAMEWORK

**What is it?** A structured way to generate ideas when the interviewer asks an open-ended question like "What could be causing this?" or "What options does the client have?"

### The Master Structure

Any business problem can be decomposed into 3 buckets:

```
1. OUTSIDE FORCES (External — things we can't control)
   ├── Market saturation / market size changes
   ├── Competition (new entrant, aggressive pricing, better product)
   ├── Macro trends (regulation, economy, technology shifts, pandemic)
   └── Customer behavior shifts (preferences, demographics)

2. INTERNAL LEVERS (Things we can control)
   ├── Revenue levers: pricing, volume, product mix, new channels
   ├── Cost levers: fixed cost reduction, variable cost optimization
   ├── Operations: capacity utilization, quality, speed, supply chain
   └── Marketing & sales: targeting, messaging, channel mix

3. RISKS & OPPORTUNITIES
   ├── Brand equity risks (reputation damage, PR crises)
   ├── Financial exposure (debt, cash flow, currency)
   └── Strategic opportunities (partnerships, M&A, new markets)
```

### MECE Brainstorming Rules

- **Maximum 5 high-level buckets** (3 is ideal)
- **No overlap between buckets** (Mutually Exclusive)
- **Together they cover everything** (Collectively Exhaustive)
- **Generate 7-10 ideas** within your structure
- **Prioritize** your ideas — don't just list them, tell the interviewer which ones you'd explore first and why

### Mid-Case Action Plan

When you uncover a problem mid-case, quickly structure 3 possible paths:
```
1. FIX the problem → direct solution to the root cause
2. GROW around it → offset the problem with growth elsewhere
3. EXIT / PIVOT → abandon if unfixable

Then drill down the most promising path first.
```

---

## SYNTHESIS / HOW TO CLOSE A CASE

**What is it?** The final 30-60 seconds of your case where you deliver your recommendation. This is what the interviewer remembers most.

**Bad synthesis (avoid):** Listing everything you learned.
> "We found that revenue is down 20%, competitors have a cost advantage, and the Fortune 500 segment is growing."
> → Problem: The interviewer can't tell what the client should DO.

**Good synthesis structure:**
```
1. LEAD WITH THE ACTION:     "You should [do X]."
2. SUPPORTING FACT 1:         "Because [key finding]."
3. SUPPORTING FACT 2:         "Additionally, [key finding]."
4. SUPPORTING FACT 3:         "Furthermore, [key finding]."
5. RESTATE RECOMMENDATION:    "Therefore, I recommend [do X]."
```

**Example:**
> "I recommend the client focus on reducing variable delivery costs rather than raising prices. First, delivery cost per order increased 35% while revenue actually grew. Second, the cost increase is concentrated in 3 cities where driver incentives were raised above market rates. Third, optimizing delivery zones in these cities alone would save Rs.120 Cr annually. Therefore, I recommend a targeted delivery cost optimization program in Mumbai, Delhi, and Bangalore."

**Pro tips:**
- Your closing argument should mirror your issue tree — if your tree had 3 branches, your close has 3 supporting facts
- Practice this structure until it's automatic — you should be able to synthesize any case in under 60 seconds
- End with next steps: "As a next step, I'd want to validate the delivery zone optimization with a 2-week pilot in Mumbai."

---

## FRAMEWORK QUICK-REFERENCE BY CASE TYPE

| Case Type | Primary Framework | Also Consider |
|---|---|---|
| Profitability drop | Profitability Framework | RCA, Business Situation |
| Market entry | Market Entry (4 Lenses) | Porter's 5 Forces, 3Cs |
| M&A / Acquisition | M&A Framework | Profitability, Business Situation |
| Pricing strategy | Pricing (3 Lenses) | 4Ps, Profitability |
| Growth strategy | Ansoff Matrix | 3Cs, Market Sizing |
| Market sizing | Top-Down or Bottom-Up | MECE Brainstorming |
| A/B test / experiment | RCA + Statistical Thinking | AARRR |
| KPI design | AARRR / North Star | Business Situation |
| Cost reduction | Cost Structure + Break-Even | Profitability |
| Competitive analysis | Porter's 5 Forces | 3Cs, Market Structure |
| New product launch | 4Ps Framework | Business Situation, Pricing |
| Operations optimization | Cost Structure | Break-Even, Profitability |
| Metric drop (analytics) | Root Cause Analysis | AARRR, Decomposition |

---

*Last updated: 2026-03-25 | Consolidated from 5 books + YouTube | aloktheanalyst.com*
