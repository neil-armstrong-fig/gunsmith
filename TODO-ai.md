# TODO: ai

Model: **Claude**. Follow the startup protocol in [TODO.md](TODO.md); read only relevant dependencies.

## Resume here

Checkout: worktree `.claude/worktrees/ai` (branch `worktree-ai`, created 2026-11-17 from main `6f6b028`; last merged main `6f6b028`). Sync main into the clean worktree before new work and delivery; main is for integration/validation only. See [Operations](docs/agent-reference/Operations.md#development-worktrees-and-the-integration-checkout).

The eight fake-eval canned-response failures are resolved and integrated. Five-call integration, LangGraph, initial balancing, the `weaponSmith` registration and per-stat clamping (`9830023`) are merged; do not rebuild them.

Current milestone: M3–M5; the project remains on M1. Next failing test/check: add renderer/integration criteria before new behavior; reconcile the cumulative paid ledger before any authorized probe. Never infer live-model quality from fake scores.

## Ownership

ai/ runtime/evals, generated-appearance renderer in the webapp, inference contracts and AI-specific eval workflow. The existing paid eval guard stays here; budget owns production spend enforcement.

Reserve concrete files in [HANDOFF.md](HANDOFF.md) before overlapping another session. Shared contracts change there first; the domain owner writes the change and consumers review it.

## Dependencies/handoffs

engine owns balancing/rating; server owns production adapter routing; budget supplies spend/tracing boundaries; art reviews readability. Agree real consumers before schema moves.

## Current milestone tasks

- [ ] Build the accepted bounded appearance renderer/schema consumer with engine, server and budget, then wire the real adapter, AI-off/refund/timeout fallbacks and built-in pool. art owns approved asset/manifest production and play owns runtime feedback integration.

- [ ] Coordinate the renderer consumer and schema move with the relevant owner in HANDOFF.md; keep schemas local until another package genuinely imports them. Preserve accepted drawings and strict bounds.
- [ ] Before authorized paid validation, reconcile the actual cumulative ledger across checkouts; preserve the $1 total ceiling. Measure combined cost/latency against the recorded estimate, not a fresh/reset balance. No budget or credit-price increase is approved. Last recorded cumulative spend: $0.6241 of the $1 (2026-11-17, after one Haiku smoke trial of about $0.001).
- [ ] Mutation-prove integration and report checks/evals. Preserve gameplay under malformed/partial appearance, unknown versions/roles, geometry excess and unsupported identity/mechanics; compare validity with human recognisability.
- [ ] Re-measure real graph CPU and trace flushing on Workers. Measured so far (wall time only, not CPU): the real graph bundles to 2908.92 KiB (541.20 KiB gzipped) and answered in workerd in 75 ms cold, then 10 and 9 ms; see `docs/ai-hosting.md`.
- [ ] Shield: a bare shield (damage 0) is now clamped to damage 1 and created with no repair, a stand-in. The shield specs stay `given.inProgress` until the user, engine and play decide the real shield behaviour; the omitted-stat policy also waits on them.
- [ ] Optional: an eval for a schema fault the balancer cannot fix (a `NaN`, a fractional magazine), so the "repair skipped" mutant stops surviving; it needs a new DSL method.
- [ ] Coordinate AI-owned preference parsing and engine-owned rating/balancing; document a contract before code work.
- [ ] Probe preferences and add criteria for max-everything, hard/slow and fast/weak requests, promotion of one stat at the expense of another, and independently valid inferred values/preferences. Deterministic/property tests cover caps, budget, reproducibility and monotone promotion. Keep schema repair separate from balancing.

## Later tasks

- [ ] Arena generation and prompt comparison: randomised prompt order, structured verdict, ties/one/no submission and the built-in pool. engine owns deterministic geometry/fairness finalisation, stairs, spawn/pickup routes and ring escape. Apply the same quality bar to built-ins.
- [ ] Shared weapon/sound and arena contracts, edit-from-base charged as generation, production model selection/fallback and call/tool middleware backstops when consumers exist. Keep player text delimited as data in every new path.
- [ ] Real `AiAdapter` and coordinated API swap; review schemas, ledger and credit configuration when the contract owner requests M2 sign-off.
- [ ] Before open source, replace the source prompt canary with a supplied secret dependency and throwaway eval value (`MANUAL-SETUP-STEPS.md`).
- [ ] Extend token/output limits to new generators; keep pre-checks before calls and sufficient output headroom. Existing weapon pre-check/moderation are not new work.
- [ ] Expand datasets from real failures, fixtures and art prompts; preserve exported results because trace retention is finite. Add arena, sound-boundary/fuzz and swapped-order criteria as those capabilities arrive.
- [ ] Deterministic evaluators first; a model judge stays deferred until a real need, then calibrate with human labels and check position bias. Preserve regression/capability separation and mutation proof.
- [ ] Add the root eval command with ship and own the AI regression workflow for AI changes. Fake tier proves the harness, never live-model quality; scores do not transfer.
- [ ] Review real renderer feedback (duck/cactus silhouettes, lantern evidence, pose/muzzle alignment and contrast) before further visual probes. Kit references remain authored art, not an active generation experiment.
- [ ] Clearly label deferred Plus-only features; optional interrupt review queues, OpenTelemetry and provider bake-offs need a concrete brief/authorization. Gather case-study evidence and shutdown measurements as work lands.

## Verification/latest delivery

Record actual checks, red/mutation evidence and the standards/folder review for the current delivery. Update this resume, the shared status row and a concise handoff at session end.
