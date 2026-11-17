# TODO: ai

Follow `TODO.md`'s startup protocol. Integration is next; stat balancing follows it.
[Earlier checklist, completed probes and detailed criteria](docs/history/2026-11-17-compaction/AiTodo.md).
The weapon pipeline, separate appearance generator, eval DSL and paid spend guard are merged. Appearance integration, production hosting/credits and calibration remain open. The Haiku probe is complete; kit generation was shelved. Do not restart either from obsolete unchecked rows.

## AI coding session resume

Read the [accepted integration handoff](docs/ai-visual-generation.md#ai-session-handoff-2026-11-15).

- [ ] Write failing integration evals, then combine separate stats/appearance stages: five calls maximum, one repair per stage, skip appearance when stats fail and disclose a visual stand-in. Three calls is the clean path.
- [ ] Coordinate the renderer consumer and schema move with build; keep schemas local until another package genuinely imports them. Preserve accepted drawings and strict bounds.
- [ ] Before authorized paid validation, reconcile the actual cumulative ledger across checkouts; preserve the $1 total ceiling. Measure combined cost/latency against the recorded estimate, not a fresh/reset balance. No budget or credit-price increase is approved.
- [ ] Mutation-prove integration and report checks/evals. Preserve gameplay under malformed/partial appearance, unknown versions/roles, geometry excess and unsupported identity/mechanics; compare validity with human recognisability.
- [ ] Re-measure real graph CPU and trace flushing on Workers; the proof spike does not establish production limits.

## Research session resume

The current research assignment remains documentation/review only. Coordinate ownership with the active coding/research sessions before reserving files; an old thread ID is not proof that its owner is still active.

- [ ] Review new integration/rating evidence against [the stat-balancing study](docs/ai-stat-balancing.md). If none exists, prepare a human-labelable preference-probe brief; no model call is required.
- [ ] Coordinate AI-owned preference parsing and engine-owned rating/balancing; document a contract before code work.
- [ ] Bring paired modest-default versus AI-chosen-weakness examples to the user before choosing omitted-stat policy. Keep explicit and inferred preferences separate. No additional generation call is approved.

## O2: the pipeline (a deterministic LangGraph `StateGraph`, not a free agent). Milestones M3 to M5

- [ ] Code-owned balancing after inference: values plus preferences, a power ceiling rather than a target, deliberate weak weapons preserved, hard caps as the final check. Settle ownership, rating/budget, encoding and omitted-stat policy with build/user before implementing.
- [ ] Probe preferences and add criteria for max-everything, hard/slow and fast/weak requests, promotion of one stat at the expense of another, and independently valid inferred values/preferences. Deterministic/property tests cover caps, budget, reproducibility and monotone promotion. Keep schema repair separate from balancing.
- [ ] Arena generation and prompt comparison: randomised prompt order, structured verdict, ties/one/no submission and the built-in pool. Build owns deterministic geometry/fairness finalisation, stairs, spawn/pickup routes and ring escape. Apply the same quality bar to built-ins.
- [ ] Shared weapon/sound and arena contracts, edit-from-base charged as generation, production model selection/fallback and call/tool middleware backstops when consumers exist. Keep player text delimited as data in every new path.
- [ ] Real `AiAdapter` and coordinated API swap; review schemas, ledger and credit configuration when build requests M2 sign-off.
- [ ] Before open source, replace the source prompt canary with a supplied secret dependency and throwaway eval value (`MANUAL-SETUP-STEPS.md`).

## O3: cost and token control. Milestones M4 and M5

- [ ] Extend token/output limits to new generators; keep pre-checks before calls and sufficient output headroom. Existing weapon pre-check/moderation are not new work.
- [ ] D1 atomic credits with build's ledger: generation/edit prices, half-price rejection, daily reset, free reuse and timeout refund as specified in `docs/cost-and-budget.md`.
- [ ] Provider/AI Gateway wiring, per-user caching/rate/spend limits and burst-overshoot protection through atomic in-app reservations. Extend paid validation estimation/cache safeguards without resetting its existing ledger.
- [ ] Provider hard cap, Gateway limits, global daily/monthly counters and cron kill switch; alerts at 50/80/100 percent of the approved monthly budget. The AI-off game must remain playable.
- [ ] Run a controlled shutdown drill once authorized: exceed a tiny budget, prove calls stop, refunds/banner work and built-in play continues.

## O4: observability and evals. Milestones M5 to M8

- [ ] Production trace flush on every path with `ctx.waitUntil(awaitAllCallbacks())`; validate real-key behavior and avoid streaming until verified. Trace failures/429s must not fail or delay play.
- [ ] Prompt/graph/model versions, tokens, cost and random internal account IDs; redact prompt PII and never trace Google identities/display names. Trace without sampling initially; track the free quota, alert at 80 percent and change sampling only at the user's request.
- [ ] Expand datasets from real failures, fixtures and art prompts; preserve exported results because trace retention is finite. Add arena, sound-boundary/fuzz and swapped-order criteria as those capabilities arrive.
- [ ] Deterministic evaluators first; a model judge stays deferred until a real need, then calibrate with human labels and check position bias. Preserve regression/capability separation and mutation proof.
- [ ] Root eval command and CI regression workflow for AI changes. Fake tier proves the harness; it cannot establish live-model quality. Local/paid scores do not transfer.
- [ ] Review real renderer feedback (duck/cactus silhouettes, lantern evidence, pose/muzzle alignment and contrast) before further visual probes. Kit references remain authored art, not an active generation experiment.
- [ ] Clearly label deferred Plus-only features; optional interrupt review queues, OpenTelemetry and provider bake-offs need a concrete brief/authorization. Gather case-study evidence and shutdown measurements as work lands.
