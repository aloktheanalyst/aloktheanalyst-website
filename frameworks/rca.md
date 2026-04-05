---
id: rca
name: Root Cause Analysis
badge: Root Cause Analysis
category: analytics

coaching:
  use_for: "metric drops, revenue decline, order drops, DAU/WAU decrease, conversion rate changes, engagement decline, any 'why did X drop/spike?' question."
  steps:
    - title: CLARIFY THE METRIC
      prompt: |
        Coach the user to ask: What metric dropped? By how much? Over what time period? Is it sudden or gradual? Is it across all segments or specific ones?
    - title: GUIDE THROUGH THE RCA DECISION TREE
      prompt: |
        The drop should be investigated from 2 broad lenses:

        A) EXTERNAL FACTORS
          1. Demographic / Geographic changes
             - Ban of products in certain geographies
             - Power outage or natural disaster in key regions
          2. Competitor action
             - Churn of users to competitor due to deep discounting
             - Competitor launched a new feature or product
          3. Collateral damage (macro events)
             - Pandemic
             - Mass layoffs in key customer segments
             - Holidays / long weekends
          4. Sentiment / PR
             - Negative press or social media backlash
             - Ad campaign gone wrong — users boycotting

        B) INTERNAL FACTORS
          1. Non-Technical
             a. Marketing spends
                - Did a marketing campaign recently end?
                - User onboarding flow changed?
                - Actual customer segment shifted?
             b. Pricing / Policy changes
                - Price hike
                - Product or service discontinued
                - Terms of service changed
             c. Seasonality
                - Is this drop expected for this day of week, month, or quarter?
                - Compare with same period last year
          2. Technical
             a. Funnel breakage — bounce rate spike at a specific step in user journey
             b. Platform-specific — WAU across different OS (iOS vs Android vs Web)
             c. Device-specific — WAU across device types (mobile vs desktop vs tablet)
             d. A/B experiments — was a test running that impacted the metric?
             e. Version upgrade — was there a recent app/product version release?
             f. UI/UX changes — did any interface elements change?
             g. New feature launch — did a new feature cannibalize or break existing flows?
             h. Infrastructure — increased latency, downtime, API failures?
    - title: DATA VALIDATION
      prompt: |
        Coach user to ask: Is the data itself reliable? Could it be a tracking/logging issue, a broken ETL pipeline, or a change in how the metric is defined?
    - title: QUANTIFY & PRIORITIZE
      prompt: |
        Guide user to size each hypothesis: which factor explains the largest portion of the drop? Use segmentation (by geo, platform, user cohort, channel) to isolate.
    - title: RECOMMEND
      prompt: |
        Coach user to propose: short-term fix, long-term solution, and what to monitor going forward.
  style_notes: |
    - Start by asking the user "What would you investigate first?" — let them build their own tree.
    - If they jump to technical causes, nudge them: "Good — but what about external factors? What could have changed outside your product?"
    - If they miss seasonality, ask: "Is this the same period as last year? Could day-of-week or holidays explain part of this?"
    - Reward structured thinking: "Great — you're segmenting by platform. That's exactly what a senior analyst would do."
    - Push for data requests: "What data would you pull to validate that hypothesis? Write the SQL."

diagram:
  type: factor-tree
  default_external:
    - { name: "Demographic / Geographic", items: [] }
    - { name: "Competitor", items: [] }
    - { name: "Macro / Collateral", items: [] }
    - { name: "Sentiment / PR", items: [] }
  default_internal:
    - { name: "Non-Technical", items: [] }
    - { name: "Seasonality", items: [] }
    - { name: "Policy", items: [] }
    - { name: "Technical", items: [] }
---
