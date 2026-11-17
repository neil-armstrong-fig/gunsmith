# Persona migration snapshot — 2026-11-17

Historical source text before the seven-persona migration. Links inside fenced blocks retain their original root-relative context. Use the root TODOs for current work.

## TODO-build.md

````markdown
# TODO: build

Follow the startup protocol in `TODO.md`. Current milestone: M1, a fun full-screen game, test-first.
[Full earlier checklist and implementation history](docs/history/2026-11-17-compaction/BuildTodo.md).

## Resume here

Committed through `8acad87`: playable best-of-three, seeded opponent, forward vision, crouch, stairs/height sight and bullets, closing ring, reticle, one pickup per round, and empty-weapon click (M mutes). The user has played the game and heard the click; tune its abrasive/loud character once other sounds are present.

- [ ] Coordinate with the separate stairs/bot build session before touching its work. Finish a levelled duel fixture and browser coverage of climbing, engaging, cover and ring escape; the bot seeking pickups depends on that work. Do not remove its worktree or duplicate its slice.
- [ ] Combat feedback slice 2: local `damageTaken` (bullet/ring), selected crunch with 100 ms burst merging and one voice, one ring-onset cue, coral brackets and 350 ms health trail.
- [ ] Slice 3: `hitLanded` only for visible targets, `sfx-hit` and mint ticks. Slice 4: camera shake/cosmetic recoil, shared pointer/screenshot offsets and reduced motion. Follow [the handover](docs/art/concepts/combat-feedback/Handover.md).
- [ ] Adopt the approved [inventory display](docs/art/concepts/inventory-display/README.md): two icons, selected name, fixed footprint and pointer pass-through. Agree minimum local inventory/name/icon data before changing the hook or manifest.
- [ ] Add art's pickup glow when a key is agreed. Custom/dropped weapons, shot synthesis and weapon variety remain open. Existing pickups equip slot 2, discard its previous weapon and break a simultaneous claim in the opponent's favour; do not reopen these choices implicitly.
- [ ] Merge duplicated pickup/ring route-distance logic after the stairs session's route code lands. Close stair-flank access and validate routes to high ground/ring escape.

Committed art integration now includes player/opponent sprites, crouched player art, dummy styling, sprite fallback/readiness and visual acceptance coverage. Projectile artwork remains unfinished in its source worktree.

Committed stairs work includes deterministic walking routes, flank validation, the terraced duel fixture and browser ring-climbing coverage. Cross-level engagement/cover fixes remain unfinished in the source worktree.

## Research-informed playtests

- [ ] Tune crouch's movement/vision tradeoff; quieter movement and cover protection remain future mechanics. Check reasons to stand and vulnerability while repositioning.
- [ ] Play contested pickups with swapped spawns, compare walking routes through stairs and single-stair camping versus two routes. Strongest-weapon central weighting is an experiment, not the current placement rule.
- [ ] Implement symmetrical arena finalisation/validation from [the fairness handover](docs/art/arena-fairness-research.md): matching spawn pairs, transformed stairs/heights, clearance and built-in quality. Preserve random weapon placement and the user's unchanged random ring centres; escape measurements are diagnostics, not centre filters.
- [ ] Extend visibility fixtures as mechanics land: weapon/stance changes, cone edges/full turns, wall/height occlusion, dim terrain versus revealed entities. Multiplayer must exclude hidden entities and effects from snapshots.
- [ ] Complete the M1 demo/playtest checkpoint and record feedback before expanding menus; the user has already tried the existing duel, crouch and click.

## Phase 2: menus around the game

- [ ] Add overlays only as a spec needs them: pause/settings, pre-round generation/reveal, library, account and rooms. Do not rebuild the abandoned screen map wholesale.
- [ ] Freeze schemas, `AiAdapter`, `CreditLedger` and the asset manifest only with actual consumers and AI/art review (M2). Shared currently holds tool config and consumed state-hook vocabulary, not those planned contracts.

## Phase C: full project standards. Milestone M3

- [x] 2026-11-17: compact instructions, checklists and handoff; preserve full dated snapshots in `docs/history/`.

Shared config, existing package instructions, root checks/dev/preview/acceptance scripts, layering, Zustand stores and the Codex standards pass are delivered. Latest verification belongs in `HANDOFF.md`, not repeated historical test counts here.

- [ ] Scaffold `api/` and `infra/` with their instructions; permit `@gunsmith/ai` in API's import boundary. Add missing `api:dev`, property-test and root eval commands when their implementations exist.
- [ ] Add CI for checks, production-preview acceptance, deployment and live acceptance. Property checks are non-blocking; AI owns its eval workflow. Deployment remains gated on manual setup and authorization.

## Phase D: the engine, hardened. Milestone M3

Movement/collision, projectiles, ammo/reload, health, round/match rules, cone/height visibility, ring and seeded pickups exist. Remaining work:

- [ ] Hitscan and additional weapon behaviors, penetrable cover, full three-level play and seeded spawn placement. Extend existing implementations rather than rebuilding them.
- [ ] Deterministic power rating and hard caps, then coordinate code-owned stat balancing with AI. Preserve deliberate weak weapons; no balancing policy is frozen by these tasks.
- [ ] Arena validity: bounds, open space, spawn/pickup reachability, wall/height limits, legal stairs and ring escape, for built-ins and generated arenas alike.
- [ ] Deterministic output moderation: text length, charset and blocklist.
- [ ] Property tests for arena validity, caps and directional visibility. Use symmetry only for geometry with matching assumptions; prove no leak through indestructible walls.
- [ ] Final weapon/sound and arena schemas in shared when a second consumer exists; keep `docs/schemas.md` and the handoff current.

## Phase E: API and multiplayer. Milestone M4

- [ ] One Worker serves assets and `/api/*`; plain runtime edge, `run_worker_first` for API paths. API imports AI in-process.
- [ ] Google OIDC/PKCE, opaque hashed sessions, account/logout/deletion and rate limiting. Public play requires sign-in; guests retain practice/private rooms.
- [ ] D1/Drizzle accounts, sessions, atomic credits, library limits, match history and ratings; Wrangler applies migrations.
- [ ] Match Durable Object: fixed tick, validated input, fog-filtered snapshots, coarse sound directions, reconnect/idle-forfeit and cleanup; client prediction/interpolation (`docs/match-netcode.md`).
- [ ] Private rooms with up to eight delayed spectators; singleton public FIFO matchmaker with a widening rating window.
- [ ] Measure real Durable Object and AI CPU costs before choosing free versus Workers Paid. Add network/privacy, reconnect, spectator and pairing acceptance specs.
- [ ] Implement the [fair-play/privacy handover](docs/art/fair-play-research.md), including bounded recordings, participant reporting, isolated restricted queues, clean-match recovery/human override and retention/erasure checks. Detection starts in observation mode.

## Phase F: integration and release. Milestones M5 to M8

- [ ] Build the accepted bounded appearance renderer/schema consumer with AI, then wire the real adapter, AI-off/refund/timeout fallbacks and built-in pool. Integrate approved art through agreed manifest keys; resolve production codec/playback QA.
- [ ] Alchemy infrastructure: Worker/assets, D1, Durable Objects and rate limits. Follow `MANUAL-SETUP-STEPS.md` on a throwaway account before production; keep local Wrangler config aligned.
- [ ] Before publication, scrub secrets/history, local settings, personal paths and addresses. No deploy, commit or push without the required authorization.
- [ ] Final tuning and case-study evidence, including the shutdown drill and real measurements (`docs/focused-case-study.md`).

````

## TODO-ai.md

````markdown
# TODO: ai

Follow `TODO.md`'s startup protocol. Committed stats/appearance integration, LangGraph execution and engine balancing are now merged; further reviewed improvements remain in the source worktree.
[Earlier checklist, completed probes and detailed criteria](docs/history/2026-11-17-compaction/AiTodo.md).
The weapon pipeline, separate appearance generator, eval DSL and paid spend guard are merged. Appearance integration, production hosting/credits and calibration remain open. The Haiku probe is complete; kit generation was shelved. Do not restart either from obsolete unchecked rows.

Integration validation: root checks, eight property tests and 199 production-preview acceptance tests pass. Fake evals have 126 passing and eight failing criteria with the canned always-approve responses. Keep that limitation visible; no live model was evaluated.

## AI coding session resume

Read the [accepted integration handoff](docs/ai-visual-generation.md#ai-session-handoff-2026-11-15).

- [x] Committed integration combines separate stats/appearance stages: five calls maximum, one repair per stage, skip appearance when stats fail and disclose a visual stand-in. Three calls is the clean path.
- [ ] Coordinate the renderer consumer and schema move with build; keep schemas local until another package genuinely imports them. Preserve accepted drawings and strict bounds.
- [ ] Before authorized paid validation, reconcile the actual cumulative ledger across checkouts; preserve the $1 total ceiling. Measure combined cost/latency against the recorded estimate, not a fresh/reset balance. No budget or credit-price increase is approved.
- [ ] Mutation-prove integration and report checks/evals. Preserve gameplay under malformed/partial appearance, unknown versions/roles, geometry excess and unsupported identity/mechanics; compare validity with human recognisability.
- [ ] Re-measure real graph CPU and trace flushing on Workers; the proof spike does not establish production limits.

## Research session resume

The current research assignment remains documentation/review only. Coordinate ownership with the active coding/research sessions before reserving files; an old thread ID is not proof that its owner is still active.

- [x] 2026-11-17, Research 2: inspected current source; no integrated preference output/general balancer found. Delivered the [human-review probe brief](docs/ai-stat-preference-probe.md): twelve proposed label rows, three encoding arms, scorecard and paired omitted-stat illustrations; no model call.
- [x] Human labels v1 and AI-chosen unspecified values/trade-offs approved on 2026-11-17. Run interpretation probes only after integration and required authorization.
- [ ] Coordinate AI-owned preference parsing and engine-owned rating/balancing; document a contract before code work.
- [x] Paired policy illustrations reviewed; AI inference selected. Keep explicit and inferred preferences separate. No additional generation call is approved.

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

````

## TODO-art.md

````markdown
# TODO: art

Follow `TODO.md`'s startup protocol. Work under the owned asset/audio/research paths; build owns runtime integration and shared contracts.
[Earlier checklist and detailed delivery evidence](docs/history/2026-11-17-compaction/ArtTodo.md).

## Resume here

The inventory study is delivered and visually approved: two compact icons and only the selected weapon's name. Review new build/AI integration evidence or continue the open production/audio work below; do not repeat the completed desk studies or saved-drawing review.

Committed player/opponent and dummy art is now integrated into main alongside stair routing and the AI pipeline. Research 2 should review concrete renderer/gameplay evidence rather than extend the completed balancing desk study. Unreviewed work remains in the source worktrees.

## Delivered references

- Research 2: [stat-preference probe brief](docs/ai-stat-preference-probe.md) has user-approved v1 labels and AI-chosen unspecified values/trade-offs (2026-11-17). Feeble means overall weakness; bad arena weapons can be tactical. Next: AI/build owner agreement, integration and authorized probes. See `HANDOFF.md` for AI-owned wording follow-ups. Session 1 retains audio QA.
- [Inventory display](docs/art/concepts/inventory-display/README.md): approved layout, icons and build requirements; runtime hook/manifest agreement remains build's.
- [Combat feedback](docs/art/concepts/combat-feedback/Handover.md): punchy/crunch, retained shake and integration criteria. [Empty click](docs/art/concepts/empty-weapon-click/README.md) is integrated as MP3 `sfx-empty-click`; tune the user's abrasive/loud impression alongside other game sounds.
- [Fair arenas](docs/art/arena-fairness-research.md): matching spawn pairs, rotational shared-platform fixture first, unchanged random ring centres; build/AI implementation and paired playtests remain open.
- [Fair play](docs/art/fair-play-research.md), [asset reference](docs/art/asset-reference/README.md), kit 05 and accepted Haiku review 06 remain source material. Kit generation is shelved; use new outputs/renderer evidence for further review.
- Reticle is integrated, including its 2x cursor. Native display/Retina appearance remains a human check.

## Audio production

- [x] Session 1: [browser listening and live-playback handoff](webapp/audio/qa/runtime-playback/README.md) delivered; MP3 confirmed. Removed the completed listening page, seven one-off JSON files and temporary probes at the user's request. Preserve the decision, original audio and existing codec QA; Safari onset/cadence and production mapping remain open.

- [x] Session 1: lock in MP3 and switch the integrated empty click at the user’s request. Approved WAV masters and codec evidence remain unchanged. Production-preview sound acceptance passes in Chromium/WebKit; project checks and full master re-render pass.
- [ ] Follow up Safari onset/content and event cadence during play; this no longer blocks MP3 integration. Preserve existing thresholds.
- [ ] Check fatigue, masking and levels on headphones/speakers with the real weapon-shot synth. General audition approval is not proof of these tests.
- [ ] Map future static cues to approved MP3 as build integrates them; support playback/ducking/volume integration. Weapon-shot synthesis belongs to build/AI; art supplies static cues.

## A2 to A4: production assets after M2 contracts

Concept/reference delivery does not complete final runtime assets. Wait for agreed keys, dimensions, anchors, tint layers and formats.

- [ ] Review the visual-schema proposal with build/AI; validate supported oddities in top-down compositions at 64/32 px using the agreed grammar.
- [ ] Player standing/crouched and held-weapon variants, default rifle and practice dummy.
- [ ] Pickup glow, projectiles/muzzle flashes by supported behavior, hit/death effects.
- [ ] Floor, indestructible wall, penetrable cover, three height levels and paired stairs, spawn/pickup markers, ring edge and fog texture.
- [ ] Runtime HUD/slot assets, health/ammo/credit UI, panels/buttons, prompt styling, power gauge, pipeline progress and reveal frame. Use the approved inventory study rather than treating its standalone artwork as integration.

## A5, A7 and A8: copy, brand and case study

- [ ] Landing/practice/onboarding/prompt copy and example prompts for datasets, including weak, broken and harmless adversarial-looking requests; rejection/errors, AI-off and credit explanations.
- [ ] Privacy/terms copy consistent with `docs/privacy-and-data.md`.
- [ ] Logo, favicons, social preview and README banner.
- [ ] Case-study diagrams: pipeline, cost safeguards and eval loop.

## Always

Preserve approved assets/audio unless a change is requested. No unregistered production keys, gameplay/schema edits or paid calls. Keep current delivery/limitations in `HANDOFF.md` and the shared status board; archive long listening and implementation history.

````

## Task routing audit

Every source checkbox has one primary destination; compound tasks are further separated in the live checklists.

| Source | Owner | Original task |
| --- | --- | --- |
| build | engine | Coordinate with the separate stairs/bot build session before touching its work. Finish a levelled duel fixture and browser coverage of climbing, engaging, cover and ring escape; the bot seeking pickups depends on that work. Do not remove its worktree or duplicate its slice. |
| build | play | Combat feedback slice 2: local `damageTaken` (bullet/ring), selected crunch with 100 ms burst merging and one voice, one ring-onset cue, coral brackets and 350 ms health trail. |
| build | play | Slice 3: `hitLanded` only for visible targets, `sfx-hit` and mint ticks. Slice 4: camera shake/cosmetic recoil, shared pointer/screenshot offsets and reduced motion. Follow [the handover](../../docs/art/concepts/combat-feedback/Handover.md). |
| build | play | Adopt the approved [inventory display](../../docs/art/concepts/inventory-display/README.md): two icons, selected name, fixed footprint and pointer pass-through. Agree minimum local inventory/name/icon data before changing the hook or manifest. |
| build | play | Add art's pickup glow when a key is agreed. Custom/dropped weapons, shot synthesis and weapon variety remain open. Existing pickups equip slot 2, discard its previous weapon and break a simultaneous claim in the opponent's favour; do not reopen these choices implicitly. |
| build | engine | Merge duplicated pickup/ring route-distance logic after the stairs session's route code lands. Close stair-flank access and validate routes to high ground/ring escape. |
| build | play | Tune crouch's movement/vision tradeoff; quieter movement and cover protection remain future mechanics. Check reasons to stand and vulnerability while repositioning. |
| build | play | Play contested pickups with swapped spawns, compare walking routes through stairs and single-stair camping versus two routes. Strongest-weapon central weighting is an experiment, not the current placement rule. |
| build | engine | Implement symmetrical arena finalisation/validation from [the fairness handover](../../docs/art/arena-fairness-research.md): matching spawn pairs, transformed stairs/heights, clearance and built-in quality. Preserve random weapon placement and the user's unchanged random ring centres; escape measurements are diagnostics, not centre filters. |
| build | engine | Extend visibility fixtures as mechanics land: weapon/stance changes, cone edges/full turns, wall/height occlusion, dim terrain versus revealed entities. Multiplayer must exclude hidden entities and effects from snapshots. |
| build | play | Complete the M1 demo/playtest checkpoint and record feedback before expanding menus; the user has already tried the existing duel, crouch and click. |
| build | art | Add overlays only as a spec needs them: pause/settings, pre-round generation/reveal, library, account and rooms. Do not rebuild the abandoned screen map wholesale. |
| build | engine | Freeze schemas, `AiAdapter`, `CreditLedger` and the asset manifest only with actual consumers and AI/art review (M2). Shared currently holds tool config and consumed state-hook vocabulary, not those planned contracts. |
| build | ship | 2026-11-17: compact instructions, checklists and handoff; preserve full dated snapshots in `docs/history/`. |
| build | server | Scaffold `api/` and `infra/` with their instructions; permit `@gunsmith/ai` in API's import boundary. Add missing `api:dev`, property-test and root eval commands when their implementations exist. |
| build | ship | Add CI for checks, production-preview acceptance, deployment and live acceptance. Property checks are non-blocking; AI owns its eval workflow. Deployment remains gated on manual setup and authorization. |
| build | engine | Hitscan and additional weapon behaviors, penetrable cover, full three-level play and seeded spawn placement. Extend existing implementations rather than rebuilding them. |
| build | engine | Deterministic power rating and hard caps, then coordinate code-owned stat balancing with AI. Preserve deliberate weak weapons; no balancing policy is frozen by these tasks. |
| build | engine | Arena validity: bounds, open space, spawn/pickup reachability, wall/height limits, legal stairs and ring escape, for built-ins and generated arenas alike. |
| build | engine | Deterministic output moderation: text length, charset and blocklist. |
| build | engine | Property tests for arena validity, caps and directional visibility. Use symmetry only for geometry with matching assumptions; prove no leak through indestructible walls. |
| build | engine | Final weapon/sound and arena schemas in shared when a second consumer exists; keep `docs/schemas.md` and the handoff current. |
| build | server | One Worker serves assets and `/api/*`; plain runtime edge, `run_worker_first` for API paths. API imports AI in-process. |
| build | server | Google OIDC/PKCE, opaque hashed sessions, account/logout/deletion and rate limiting. Public play requires sign-in; guests retain practice/private rooms. |
| build | server | D1/Drizzle accounts, sessions, atomic credits, library limits, match history and ratings; Wrangler applies migrations. |
| build | server | Match Durable Object: fixed tick, validated input, fog-filtered snapshots, coarse sound directions, reconnect/idle-forfeit and cleanup; client prediction/interpolation (`docs/match-netcode.md`). |
| build | server | Private rooms with up to eight delayed spectators; singleton public FIFO matchmaker with a widening rating window. |
| build | server | Measure real Durable Object and AI CPU costs before choosing free versus Workers Paid. Add network/privacy, reconnect, spectator and pairing acceptance specs. |
| build | server | Implement the [fair-play/privacy handover](../../docs/art/fair-play-research.md), including bounded recordings, participant reporting, isolated restricted queues, clean-match recovery/human override and retention/erasure checks. Detection starts in observation mode. |
| build | ai | Build the accepted bounded appearance renderer/schema consumer with AI, then wire the real adapter, AI-off/refund/timeout fallbacks and built-in pool. Integrate approved art through agreed manifest keys; resolve production codec/playback QA. |
| build | ship | Alchemy infrastructure: Worker/assets, D1, Durable Objects and rate limits. Follow `MANUAL-SETUP-STEPS.md` on a throwaway account before production; keep local Wrangler config aligned. |
| build | ship | Before publication, scrub secrets/history, local settings, personal paths and addresses. No deploy, commit or push without the required authorization. |
| build | ship | Final tuning and case-study evidence, including the shutdown drill and real measurements (`docs/focused-case-study.md`). |
| ai | ai | Committed integration combines separate stats/appearance stages: five calls maximum, one repair per stage, skip appearance when stats fail and disclose a visual stand-in. Three calls is the clean path. |
| ai | ai | Coordinate the renderer consumer and schema move with build; keep schemas local until another package genuinely imports them. Preserve accepted drawings and strict bounds. |
| ai | ai | Before authorized paid validation, reconcile the actual cumulative ledger across checkouts; preserve the $1 total ceiling. Measure combined cost/latency against the recorded estimate, not a fresh/reset balance. No budget or credit-price increase is approved. |
| ai | ai | Mutation-prove integration and report checks/evals. Preserve gameplay under malformed/partial appearance, unknown versions/roles, geometry excess and unsupported identity/mechanics; compare validity with human recognisability. |
| ai | ai | Re-measure real graph CPU and trace flushing on Workers; the proof spike does not establish production limits. |
| ai | ai | 2026-11-17, Research 2: inspected current source; no integrated preference output/general balancer found. Delivered the [human-review probe brief](../../docs/ai-stat-preference-probe.md): twelve proposed label rows, three encoding arms, scorecard and paired omitted-stat illustrations; no model call. |
| ai | ai | Human labels v1 and AI-chosen unspecified values/trade-offs approved on 2026-11-17. Run interpretation probes only after integration and required authorization. |
| ai | ai | Coordinate AI-owned preference parsing and engine-owned rating/balancing; document a contract before code work. |
| ai | ai | Paired policy illustrations reviewed; AI inference selected. Keep explicit and inferred preferences separate. No additional generation call is approved. |
| ai | engine | Code-owned balancing after inference: values plus preferences, a power ceiling rather than a target, deliberate weak weapons preserved, hard caps as the final check. Settle ownership, rating/budget, encoding and omitted-stat policy with build/user before implementing. |
| ai | ai | Probe preferences and add criteria for max-everything, hard/slow and fast/weak requests, promotion of one stat at the expense of another, and independently valid inferred values/preferences. Deterministic/property tests cover caps, budget, reproducibility and monotone promotion. Keep schema repair separate from balancing. |
| ai | ai | Arena generation and prompt comparison: randomised prompt order, structured verdict, ties/one/no submission and the built-in pool. Build owns deterministic geometry/fairness finalisation, stairs, spawn/pickup routes and ring escape. Apply the same quality bar to built-ins. |
| ai | ai | Shared weapon/sound and arena contracts, edit-from-base charged as generation, production model selection/fallback and call/tool middleware backstops when consumers exist. Keep player text delimited as data in every new path. |
| ai | ai | Real `AiAdapter` and coordinated API swap; review schemas, ledger and credit configuration when build requests M2 sign-off. |
| ai | ai | Before open source, replace the source prompt canary with a supplied secret dependency and throwaway eval value (`MANUAL-SETUP-STEPS.md`). |
| ai | ai | Extend token/output limits to new generators; keep pre-checks before calls and sufficient output headroom. Existing weapon pre-check/moderation are not new work. |
| ai | budget | D1 atomic credits with build's ledger: generation/edit prices, half-price rejection, daily reset, free reuse and timeout refund as specified in `docs/cost-and-budget.md`. |
| ai | budget | Provider/AI Gateway wiring, per-user caching/rate/spend limits and burst-overshoot protection through atomic in-app reservations. Extend paid validation estimation/cache safeguards without resetting its existing ledger. |
| ai | budget | Provider hard cap, Gateway limits, global daily/monthly counters and cron kill switch; alerts at 50/80/100 percent of the approved monthly budget. The AI-off game must remain playable. |
| ai | budget | Run a controlled shutdown drill once authorized: exceed a tiny budget, prove calls stop, refunds/banner work and built-in play continues. |
| ai | budget | Production trace flush on every path with `ctx.waitUntil(awaitAllCallbacks())`; validate real-key behavior and avoid streaming until verified. Trace failures/429s must not fail or delay play. |
| ai | budget | Prompt/graph/model versions, tokens, cost and random internal account IDs; redact prompt PII and never trace Google identities/display names. Trace without sampling initially; track the free quota, alert at 80 percent and change sampling only at the user's request. |
| ai | ai | Expand datasets from real failures, fixtures and art prompts; preserve exported results because trace retention is finite. Add arena, sound-boundary/fuzz and swapped-order criteria as those capabilities arrive. |
| ai | ai | Deterministic evaluators first; a model judge stays deferred until a real need, then calibrate with human labels and check position bias. Preserve regression/capability separation and mutation proof. |
| ai | ai | Root eval command and CI regression workflow for AI changes. Fake tier proves the harness; it cannot establish live-model quality. Local/paid scores do not transfer. |
| ai | ai | Review real renderer feedback (duck/cactus silhouettes, lantern evidence, pose/muzzle alignment and contrast) before further visual probes. Kit references remain authored art, not an active generation experiment. |
| ai | ai | Clearly label deferred Plus-only features; optional interrupt review queues, OpenTelemetry and provider bake-offs need a concrete brief/authorization. Gather case-study evidence and shutdown measurements as work lands. |
| art | art | Session 1: [browser listening and live-playback handoff](../../webapp/audio/qa/runtime-playback/README.md) delivered; MP3 confirmed. Removed the completed listening page, seven one-off JSON files and temporary probes at the user's request. Preserve the decision, original audio and existing codec QA; Safari onset/cadence and production mapping remain open. |
| art | art | Session 1: lock in MP3 and switch the integrated empty click at the user’s request. Approved WAV masters and codec evidence remain unchanged. Production-preview sound acceptance passes in Chromium/WebKit; project checks and full master re-render pass. |
| art | art | Follow up Safari onset/content and event cadence during play; this no longer blocks MP3 integration. Preserve existing thresholds. |
| art | art | Check fatigue, masking and levels on headphones/speakers with the real weapon-shot synth. General audition approval is not proof of these tests. |
| art | art | Map future static cues to approved MP3 as build integrates them; support playback/ducking/volume integration. Weapon-shot synthesis belongs to build/AI; art supplies static cues. |
| art | art | Review the visual-schema proposal with build/AI; validate supported oddities in top-down compositions at 64/32 px using the agreed grammar. |
| art | art | Player standing/crouched and held-weapon variants, default rifle and practice dummy. |
| art | art | Pickup glow, projectiles/muzzle flashes by supported behavior, hit/death effects. |
| art | art | Floor, indestructible wall, penetrable cover, three height levels and paired stairs, spawn/pickup markers, ring edge and fog texture. |
| art | art | Runtime HUD/slot assets, health/ammo/credit UI, panels/buttons, prompt styling, power gauge, pipeline progress and reveal frame. Use the approved inventory study rather than treating its standalone artwork as integration. |
| art | art | Landing/practice/onboarding/prompt copy and example prompts for datasets, including weak, broken and harmless adversarial-looking requests; rejection/errors, AI-off and credit explanations. |
| art | art | Privacy/terms copy consistent with `docs/privacy-and-data.md`. |
| art | art | Logo, favicons, social preview and README banner. |
| art | art | Case-study diagrams: pipeline, cost safeguards and eval loop. |
