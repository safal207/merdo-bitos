# Customer Need Graph 8.4 — experiment
Baseline: 9013ac0, stable audit 7.5 remains untouched.
All nodes and connections are business hypotheses, not verified customer insights or live inventory. No customer identifiers, revenue estimates, automated outreach or deployment.
Typed edges: trigger activates need; need served_by offer; channel exposes offer; offer may_support business goal; goal measured_by metric.
Repeat sales require prior paid order. Event recurrence in a population must not be mistaken for repeat purchases by one person. Unknown customer history leaves both goals hypothetical.
Next: ask owner which motives and triggers are observed, verify actual assortment by market, measure aggregate orders in same currency/cohort/period, and only then propose guided integration. Do not infer LTV from graph topology.
Run: node scripts/atelier23-need-graph.mjs

## 8.5 — Transition phases / space and time
A phase is a hypothesized shift between contexts, not a need, trigger, product or customer identity. 
Typed path: phase --may_activate--> trigger --activates--> need --served_by--> offer --may_support--> goal --measured_by--> metric.
Space is a semantic origin and destination, not tracked coordinates; time is a relative window around a known anchor. All window lengths are illustrative hypotheses for owner validation, not observed purchase frequency or deadlines. Local calendar dates, consented context and actual assortment need validation before operational use.
Before/during/after are distinct states. An outside context produces no paths; missing context returns explicitly unknown hypotheses, never a positive match. A first customer cannot be counted as repeat. No automatic outreach or pricing.
Examples: new role, preparation for an event, arrival at the event, change of season, travel, post-purchase fitting review, return to daily context.
Run: node scripts/atelier23-need-graph.mjs. Existing graph and discovery tests remain in CI.
