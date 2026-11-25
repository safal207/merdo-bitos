# Need Activation Engine 8.6 — synthetic experiment
Baseline: Transition Phases 8.5. No changes to the audit UI, stable branches or publication.

Each state is scoped to a synthetic need trajectory; a real customer identity is neither stored nor inferred.
State: latent (0), active (1–100), satisfied (0 by explicit feedback), expired (0 by decay).
The cycle count increments only on a transition from inactive to active.

## Time and space
Activation uses phasePaths from the existing graph, relative day = event day minus anchor day. The phase window and both semantic spaces must match, and a typed path to the selected need must exist. Unknown/outside context or absent path cannot activate. Day and anchor are integer simulation days, not local calendar dates. Before/during/after windows remain hypotheses.

## Rules
- Linear decay: intensity = max(0, old intensity - elapsed days × decay per day). Default 5 points/day is a synthetic parameter, not calibrated behavior.
- Activation strength 1–100 is explicit simulation input. Overlapping occurrences reinforce by max, never sum; do not count an additional cycle while active.
- Satisfaction subtracts an explicit feedback amount after decay. A purchase alone is not evidence of satisfaction. Full satisfaction and expiration are different states.
- A new occurrence can start a new cycle after expiration or satisfaction. An already accepted occurrence cannot activate again, even through another phase. This deliberately conservative deduplication requires consistent occurrence identifiers upstream.
- Events are ordered by simulation day, with caller order within a day. Duplicate event ID and identical normalized payload is idempotent; conflicting ID or older new event is rejected. Accepted events with unknown/outside context still advance the clock, without activation.
- No automatic sales, outreach, customer tracking, LTV prediction or financial writes.

## QA
Run node scripts/atelier23-need-activation.mjs. Includes phase boundary and space tests, missing-context negative controls, saturation, recurrence, idempotency, state immutability, and seeded replay of 5,000 events. Graph and discovery suites remain in CI.
Limitations: no calibration on real client data, no persistent event store, no concurrency guarantee, no validated causal model of satisfaction or decay, no production integration. The immutable in-memory event ledger is for small simulations only.
