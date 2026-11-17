# TODO: ai

Model: **Claude**. Follow the startup protocol in [TODO.md](TODO.md); read only relevant dependencies.

## Resume here

Checkout: worktree `.claude/worktrees/ai` (branch `worktree-ai`, created 2026-11-17 from main `6f6b028`; last merged main `2d7c568`, 2026-11-17). Sync main into the clean worktree before new work and delivery; main is for integration/validation only. See [Operations](docs/agent-reference/Operations.md#development-worktrees-and-the-integration-checkout).

The eight fake-eval canned-response failures are resolved and integrated. Five-call integration, LangGraph, initial balancing, the `weaponSmith` registration and per-stat clamping (`9830023`) are merged; do not rebuild them.

Current milestone: M3–M5; the project remains on M1. Never infer live-model quality from fake scores.

**Renderer, design approved 2026-11-17 (slices S0–S4; stop for review after each; leave uncommitted).** First proof is the ground pickup (not the held weapon) drawing the jellyfish lantern from a named fixture chosen by a scenario query parameter; no engine change, no anchors, no schema field added. The appearance schema, limits and vocabularies move unchanged to `shared/` (the webapp is the second consumer; proposal in [HANDOFF.md](HANDOFF.md)). Webapp side: pure helpers (parts to SVG, role to colour) beneath `weapon-drawing/`, a texture cache beside `sprites/` feeding `data-sprites-ready`, the code-owned stand-in for anything the schema refuses. S0 and S1 done (uncommitted): `acceptance-tests/src/tests/pickup/DrawingAGeneratedWeapon.test.ts` is red on a production build (5 of 6 fail, the fog one passes vacuously until the drawing exists). S2 done: the schema, limits, vocabularies and stand-in moved unchanged to `shared/src/appearance/`, `zod` added to `shared/` with the user's approval, `ai/` re-imports. S3 done (uncommitted): the pickup renderer, 6 of 6 criteria green on a production build and mutation-proved; see the HANDOFF delivery. Next: S4 review, then the held-weapon overlay (needs anchors and art's hand position), the engine/library link from a weapon to its drawing, and art's pickup diamond. Deferred: held-weapon overlay and anchors, overshoot tolerance, projectile/impact/animation presets, the real adapter. The design and reservation are in HANDOFF.md.

**Arena generation, plan approved 2026-11-17 (slices A0 to A4, fake tier and unit tests only, no model call, no spend; stop for review after each; leave uncommitted).** The model writes the engine's own drawing rows (`arenaFrom` input), code checks them, one repair, then an injected built-in pool and a refund flag; no `shared/` file. **Engine owns the validator** (`engine/src/arena-validation/ValidateArena.ts`, planned, not in main), spawn pairs (which will change the `Arena` shape), the built-in pool and the limits constant; `ai` writes nothing under `engine/` and uses an interim check behind one function (`ArenaProblems`, A3) that swaps to engine's. A0 done (main merged as `280d481`, root checks, 240 preview acceptance tests green; the proof Worker dry run is 2790.17 KiB, the real `weaponSmith` bundle not re-measured). A1 done (requests in HANDOFF.md, engine answered). **A2 done (uncommitted):** `ai/evals/dsl/arena/` (DSL, pipeline, six evaluators with 37 unit tests, each mutation-proved), `ai/evals/eval-criteria-mapping/arena/` (driver, fake and local models, built-in fixtures), two specs `ai/evals/tests/arena/` (`AskingForAnArena`, `NotAnArenaRequest`, both `given.inProgress`), arena types and a stub `generateArena` in `ai/src/pipeline/arena/`. The specs were red for the right reason first. **A3 done (uncommitted):** the arena pipeline `ai/src/pipeline/arena/` (`GenerateArena`, `arena-graph/`: precheck at 250 tokens, moderation, generate, validate, one repair, then a built-in arena and a refund; `arena-drafting/`, `check/validate/`, `prompt-screening/`, interim `limits/`), mutation-proved (14 mutants, each killed by named unit tests; two survive the eval layer by design, the prompt canary and, until a case was added, the token limit). Fake tier: `evals:fake` 170 of 170 (134 existing plus 36 arena), root `pnpm checks` exit 0 (ai 676 tests). The fake generator is a canned table (`ArenaGenerationFakeModel`) that draws one unplayable arena on request, so the evals guard the fallback and refund path too. **Not run on any real model.** Next A4: the arena judge (two prompts validated, randomised order from an injected seeded random, structured verdict, tie rule, lone prompt wins, none gives a built-in), then a free local run (`pnpm --filter @gunsmith/ai evals:local`, needs Ollama) to tune the generation prompt, and only then, after the user reviews the cost, a one-trial Haiku smoke (the arena paid tier is not wired: `createArenaEvalModels("paid")` throws on purpose).

## Ownership

ai/ runtime/evals, generated-appearance renderer in the webapp, inference contracts and AI-specific eval workflow. The existing paid eval guard stays here; budget owns production spend enforcement.

Reserve concrete files in [HANDOFF.md](HANDOFF.md) before overlapping another session. Shared contracts change there first; the domain owner writes the change and consumers review it.

## Dependencies/handoffs

engine owns balancing/rating; server owns production adapter routing; budget supplies spend/tracing boundaries; art reviews readability. Agree real consumers before schema moves.

## Current milestone tasks

- [ ] Build the accepted bounded appearance renderer/schema consumer with engine, server and budget, then wire the real adapter, AI-off/refund/timeout fallbacks and built-in pool. art owns approved asset/manifest production and play owns runtime feedback integration.

- [ ] **Tech debt (the user's unease, 2026-11-17): arena evaluators judge with engine code.** `ai/eslint.config.js` lets `evals/dsl/**/pipeline/**` import `@gunsmith/engine`, and `PlayableArena` calls `arenaFrom` and `route/TilesReachableFrom`, so the evaluator and the pipeline's check share a source of truth and an engine bug would pass both. Kept for now because engine owns arena validity and the root import table already lets `ai/` import it. Revisit when engine's `validateArena` lands: decide whether the evaluator should keep its own small oracle (a hand-written flood fill, independent of engine), use `validateArena`, or whether a shared arena contract in `shared/` is warranted (only if a second package exchanges the drawing rows). Do not move engine rules into `shared/` (it may import nothing else in the workspace).
- [ ] Renderer consumer: the appearance schema move is done (S2, 2026-11-17); keep other schemas local until another package genuinely imports them. Preserve accepted drawings and strict bounds.
- [ ] **Paid-spend ledger (decided by the user, 2026-11-17): left as it is.** `ai/evals/results/paid-spend-latest.json` is git-ignored and no longer exists in any checkout (the old worktrees were removed), so `SpendLedger.total()` reads 0 and the $1 ceiling no longer protects anything; the user judged a file-based ledger brittle, knows the cost well and has about $20 on the account, and accepts that. **Before any paid call, tell the user and let them review the cost first; never run one unprompted.** No budget or credit-price increase is approved. Last recorded cumulative spend: $0.6241 (2026-11-17, after one Haiku smoke trial of about $0.001). Production spend enforcement is budget's.
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
