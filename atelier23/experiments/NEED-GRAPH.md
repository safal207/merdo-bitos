# Customer Need Graph 8.4 — experiment
Baseline: 9013ac0, stable audit 7.5 remains untouched.
All nodes and connections are business hypotheses, not verified customer insights or live inventory. No customer identifiers, revenue estimates, automated outreach or deployment.
Typed edges: trigger activates need; need served_by offer; channel exposes offer; offer may_support business goal; goal measured_by metric.
Repeat sales require prior paid order. Event recurrence in a population must not be mistaken for repeat purchases by one person. Unknown customer history leaves both goals hypothetical.
Next: ask owner which motives and triggers are observed, verify actual assortment by market, measure aggregate orders in same currency/cohort/period, and only then propose guided integration. Do not infer LTV from graph topology.
Run: node scripts/atelier23-need-graph.mjs
