# BitOS — Trust & Communication Foundations (8.9 research proposal)
Status: documentation only; baseline Learning Engine a22fd34. Date: 2026-11-25.
This is a focused review of accessible abstracts, publisher descriptions and author interviews, not a claim to have read the full books or a systematic review. No evidence here establishes BitOS sales lift. See PEDAGOGICAL-FOUNDATIONS.md, CULTURAL-PSYCHOLOGY.md, LEARNING-ENGINE.md and PEDAGOGICAL-VALIDATION.md.

## Source register
- S12: Carl R. Rogers (1957), The Necessary and Sufficient Conditions of Therapeutic Personality Change, Journal of Consulting Psychology 21(2), 95–103. Original bibliographic record https://pubmed.ncbi.nlm.nih.gov/13416422/ ; reprint abstract https://pubmed.ncbi.nlm.nih.gov/22122245/ ; DOI https://doi.org/10.1037/h0045357 . Empathic understanding, congruence, nonjudgmental regard and communicated understanding are proposed interpersonal conditions in therapy. These are not universally established necessary/sufficient conditions for commerce; BitOS is not therapy and does not assess psychological vulnerability.
- S13: Robert B. Cialdini, Influence: The Psychology of Persuasion (1984; expanded 2021). Author interview with Jennifer L. Eberhardt, APS, https://www.psychologicalscience.org/observer/universal-principles-of-influence ; APA overview https://www.apa.org/monitor/2011/02/persuasion ; author institute summary https://cialdini.com/principles . Seven influence mechanisms: reciprocity, scarcity, authority, commitment/consistency, liking, social proof, unity. These describe influences on decisions, not independent evidence of product suitability or a mandate to maximize compliance.
- S14: William R. Miller and Stephen Rollnick, Motivational Interviewing: Helping People Change and Grow, 4th ed., Guilford Press, 2023. Publisher description https://www.guilford.com/books/Motivational-Interviewing/Miller-Rollnick/9781462552795 ; contents https://www.guilford.com/books/Motivational-Interviewing/Miller-Rollnick/9781462552795/contents . Four tasks: engaging, focusing, evoking, planning. Borrow collaboration, open questions, reflective listening and voluntary planning, not a clinical intervention. Do not selectively amplify purchase-oriented speech or suppress reasons not to buy.

## Design matrix
| Principle | BitOS intervention | Prohibited shortcut |
|---|---|---|
| Empathy and congruence (S12) | Reflect stated need; invite correction; disclose vendor interest and unknowns | Inventing emotions, simulated intimacy, diagnosis |
| Nonjudgment (S12) | Equal access to information after refusal | Penalizing disagreement or refusal |
| Reciprocity (S13) | Useful audit independent of purchase | Debt or guilt for free audit |
| Authority (S13) | Verifiable credentials, reproducible tests, source and date | Fabricated endorsements, authority instead of proof |
| Social proof (S13) | Relevant consented case studies with limitations | Fake reviews, invented counts, claiming popularity proves suitability |
| Scarcity (S13) | Real availability only when verified, with time/source | Countdown, fake scarcity, urgency inferred from vulnerability |
| Commitment (S13) | Optional summary, editable/revocable | Treating prior choices as commitment to pay |
| Liking and unity (S13) | Respectful language and genuine common task | Pretend friendship, in-group exclusion, sensitive profiling |
| Engaging / focusing (S14) | Ask permission, choose topic | Forced progression |
| Evoking (S14) | Ask for user's own reasons for/against options; accept ambivalence | Selective persuasion toward purchase |
| Planning (S14) | Optional next step, including no action | Automatic outreach or purchase |

## Proposed communication contract
Separate records: stated need, reflected interpretation, confirmation/correction, evidence status (verified / hypothesis / unknown), consent to continue, requested support, decision (unknown / explore / defer / decline / request_discussion).
Flow: permission -> open question -> reflection -> correction/confirmation -> optional evidence -> ask what matters -> optional next action. Can stop at every stage. Unknown remains unknown. Correction invalidates dependent summary; refusal stops current interaction; only an explicit new session resumes. Do not score trust, infer motives, derive readiness from clicks, ethnicity, time spent or learning success. No changes to activation intensity or Learning Engine understanding from communication events. No purchase/payment/LTV event from agreement. No private client identifiers or storage by default. Separate consent from purchase and from analytics.

## Example: Atelier 23 B2B
Ask: Андрей, какие обращения повторяются, а какие возникают только перед событием? Reflect: я правильно понял, что речь о повторных заказах, а не о новых клиентах? Allow correct/skip. Evidence: technical findings dated 24.11.2026, financial effect unknown. Ask whether the fact is relevant, and whether there are reasons not to change anything. Offer repeat test, data review, optional discussion or stop; no obligation. B2C experiment separate.

## Falsifiable product hypotheses (continue H1–H10)
| ID | Intervention vs equivalent control | Primary measure | Disconfirmation/guardrail |
|---|---|---|---|
| H11 S12 | Reflect and let correct vs same open question without explicit reflection | Agreement of summary with participant's independently stated need, assessed by participant | No improvement or increased misrepresentation |
| H12 S13 | Evidence with verified source/date and limitations vs same evidence without prominent source label | Ability to distinguish verified claim from hypothesis in a new example | No improvement, or higher unjustified confidence |
| H13 S14 | Permission + open question + balanced reasons + optional next action vs neutral structured menu with same exit rights | Self-reported autonomy and fit of next step | No improvement or any increased pressure |
| H14 S13/S14 | Editable summary with clear no-obligation statement vs same summary without edit shortcut (both can correct) | Correction success and reported control | More errors, more abandonment or perceived obligation |

Use PEDAGOGICAL-VALIDATION.md: small voluntary qualitative tests first, then preregistered comparison; same facts, equal exit rights, separate B2B/B2C. Measure comprehension, perceived pressure, false confidence, correction rate, completion and refusals separately; no requirement to increase conversion. Commercial outcomes only with separate consent, actual orders, defined cohort/period/currency; no causal claim without a suitable experiment.

## Future QA invariants
- Stop/decline valid from every state; no follow-up or automatic CTA after stop.
- No readiness advancement from reflection, proof viewing, assistance or agreement alone.
- Corrected need invalidates summary and dependent suggestions; preserve unrelated evidence.
- Unknown / contradictory input never becomes a fact or psychological diagnosis.
- Unverified source cannot be labeled verified; scarcity without current verified source is unavailable.
- Duplicate event id + payload is idempotent, conflict rejected; no financial side effects.
- Equal inputs yield same options regardless of ethnicity or other protected traits.
- No automatic message, payment, CRM update, publish or tracking.
No runtime modifications in this mission.
