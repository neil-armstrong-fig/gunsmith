# TODO: ai

Model: **Claude**. Follow the startup protocol in [TODO.md](TODO.md); read only relevant dependencies.

## Resume here

Checkout: develop only in this persona's assigned worktree. At startup, record its actual path/branch and last merged committed main revision here; these are not yet assigned by the workflow update. Sync main into the clean worktree before new work and delivery; main is for integration/validation only. Preserve existing unfinished legacy worktrees. See [Operations](docs/agent-reference/Operations.md#development-worktrees-and-the-integration-checkout).

Resolve the eight reported fake-eval canned-response failures and review remaining source-worktree improvements. Five-call integration, LangGraph and initial balancing are merged; do not rebuild them.

Current milestone: M3–M5; the project remains on M1. Next failing test/check: Reproduce the eight fake-eval failures before changing canned responses; add renderer/integration criteria before new behavior. Never infer live-model quality from fake scores.

## Ownership

ai/ runtime/evals, generated-appearance renderer in the webapp, inference contracts and AI-specific eval workflow. The existing paid eval guard stays here; budget owns production spend enforcement.

Reserve concrete files in [HANDOFF.md](HANDOFF.md) before overlapping another session. Shared contracts change there first; the domain owner writes the change and consumers review it.

## Dependencies/handoffs

engine owns balancing/rating; server owns production adapter routing; budget supplies spend/tracing boundaries; art reviews readability. Agree real consumers before schema moves.

## Current milestone tasks

- [ ] Build the accepted bounded appearance renderer/schema consumer with engine, server and budget, then wire the real adapter, AI-off/refund/timeout fallbacks and built-in pool. art owns approved asset/manifest production and play owns runtime feedback integration.

- [ ] Coordinate the renderer consumer and schema move with the relevant owner in HANDOFF.md; keep schemas local until another package genuinely imports them. Preserve accepted drawings and strict bounds.
- [ ] Before authorized paid validation, reconcile the actual cumulative ledger across checkouts; preserve the $1 total ceiling. Measure combined cost/latency against the recorded estimate, not a fresh/reset balance. No budget or credit-price increase is approved.
- [ ] Mutation-prove integration and report checks/evals. Preserve gameplay under malformed/partial appearance, unknown versions/roles, geometry excess and unsupported identity/mechanics; compare validity with human recognisability.
- [ ] Re-measure real graph CPU and trace flushing on Workers; the proof spike does not establish production limits.
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

- [x] Committed integration combines separate stats/appearance stages: five calls maximum, one repair per stage, skip appearance when stats fail and disclose a visual stand-in. Three calls is the clean path.
- [x] 2026-11-17, Research 2: inspected the then-current source before the later integration merge; no integrated preference output/general balancer existed at that checkpoint. Delivered the [human-review probe brief](docs/ai-stat-preference-probe.md): twelve proposed label rows, three encoding arms, scorecard and paired omitted-stat illustrations; no model call.
- [x] Human labels v1 and AI-chosen unspecified values/trade-offs approved on 2026-11-17. Run interpretation probes only after integration and required authorization.
- [x] Paired policy illustrations reviewed; AI inference selected. Keep explicit and inferred preferences separate. No additional generation call is approved.

2026-11-17 migration: tasks redistributed from the former build/ai/art checklists; no gameplay change. Latest merged validation in HANDOFF.md: root checks, eight property tests and 199 preview acceptance tests passed; fake evals reported 126 passing and eight failing canned-response criteria. This is inherited evidence, not a new run.

At session end, record actual checks, mutation/red evidence where applicable, standards and folder/caller review; update this resume, your TODO.md status row and a concise HANDOFF.md delivery. [Pre-migration snapshot](docs/history/2026-11-17-persona-migration.md).
