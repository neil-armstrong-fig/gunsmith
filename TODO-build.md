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
