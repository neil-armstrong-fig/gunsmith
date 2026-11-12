# TODO: build (Session 1, game and project, Claude Code)

Your checklist. The shared path is `TODO.md`; read it and `TODO-ai.md` and `TODO-art.md` first, every fresh session
(the sync protocol is at the top of `TODO.md`). Decisions behind every item are in `docs/`.

**The order changed on 2026-11-12, at the user's request: build a fun game first, then build everything else around it.**
Three rules follow:

1. **Test first, from the first spec.** Every mechanic starts as an acceptance spec watched to fail (`AGENTS.md`). The
   fuzzy-frontend method was tried and dropped (`docs/fuzzy-frontend.md`, demo note).
2. **The game is the whole screen.** The canvas fills the window; menus appear over it only when needed. No page of
   menus, no side panels, no step jumper until a spec needs one.
3. **Nothing moves to `shared/` until a second package needs it.** No pre-emptive contracts: schemas, adapters and
   ledgers come back, test-first, when the game and the AI genuinely need the same shape.

**What the others are waiting for from you:** `ai` needs the weapon and arena shapes; `art` needs the asset manifest.
Both are withdrawn until the game is fun (`HANDOFF.md` delivery log, 2026-11-12). Say in `TODO.md` when they return.

## Phase 0: minimal scaffold. Done

- [x] `git init`, `.nvmrc` (26.13.1), `.editorconfig`, `.gitignore`, no LICENSE (private for now).
- [x] pnpm workspace with `webapp/` and `shared/` (tool config only), exact-pinned `catalog:`, 7-day release-age policy,
      TypeScript held at 6.0.3.
- [x] `webapp/`: Vite, React 19, strict TypeScript, Tailwind v4, react-three-fiber; a full-screen orthographic canvas with
      a square moved by WASD (`src/react/arena/`, `DirectionFromKeys` unit-tested and mutation-proved).
- [x] `pnpm start` on port 3000 (verified on 3100 while janggi held 3000; re-confirm when it is free).
- [x] 2026-11-12: a fuzzy frontend (15 menu screens, a fake AI and ledger, schemas in `shared/`) was built, looked at and
      deleted at the user's request. The palette tokens in `src/index.css` survive.

## Phase 1: the game, test first. Milestone M1 (redefined: the game is fun)

Set-up, then one spec per mechanic. Each spec is watched to fail for the right reason, then made to pass, then
mutation-proved (`AGENTS.md`). The simulation lives in `engine/` from the start: deterministic, a fixed timestep, a seeded
RNG, no `Date.now()` or `Math.random()`. The webapp renders it and sends input.

- [x] **`acceptance-tests/`** (janggi's skeleton, three layers for now, `withDslOnly`, desktop only) with its `AGENTS.md`.
      `@playwright/test` 1.64.0 approved.
- [x] **`engine/`** package with its `AGENTS.md`, created by the walking spec. Bring up a seeded RNG, a visibility-polygon
      library and a grid pathfinder when each is needed. Property tests (`fast-check`) are deferred at the user's request.
- [x] **Canvas state hook** for the DSL: `data-ready` on the arena (read-only, tiny, shipped code). More arrive per spec.
- [ ] Specs, in this order (add or reorder as playing it shows what is fun):
  - [x] The practice arena fills the window (`FillingTheWindow.test.ts`, three window sizes; mutation-proved on the
        container and on the canvas; 15 of 15 on repeat).
  - [x] WASD moves the player; walls stop them (`WalkingAround.test.ts`; engine: 33 unit tests, all mutants caught; four
        game mutations each caught by the right spec). Fixed 1/60 s step, circle-vs-grid collision written by hand.
  - [x] Aiming with the mouse; clicking fires a shot (`AimingAtTheMouse.test.ts`, `FiringAShot.test.ts`; first pass: one
        bullet type, a fixed fire rate, bullets die on walls). Engine: 72 unit tests; webapp: 33; 22 acceptance specs.
  - [ ] A practice dummy takes damage and dies.
  - [ ] Reload, magazine and reserve; keys 1 and 2 switch weapon.
  - [ ] Health, and a scripted opponent that wanders and shoots; a hit; a round win.
  - [ ] Best of three.
  - [ ] Dim arena outside a detailed forward cone, set by equipped weapon and standing/crouched stance. Rotate it
        with aim through 360°; reveal terrain detail and players/items only in the unoccluded cone. Three height levels
        and longer-range, substantially slower crouch follow `HANDOFF.md`. Cone ownership is settled.
  - [ ] The closing ring after the round timer.
  - [ ] Pick up and drop a custom weapon; rough Web Audio gunshots.
- [ ] **Demo checkpoint:** when the core is playable, tell the user it is ready for a first look. Agree what to cut or add
      before menus. Record the reaction in `docs/fuzzy-frontend.md`'s demo notes (kept for the history).

### Research-informed playtests (as each mechanic lands)

Source facts, hypotheses and five small setups: `docs/art/gameplay-research.md`. These support Phase 1, not a new
up-front architecture phase; use hand-authored fixtures and keep rule changes as proposals until played/reviewed.

- [ ] Tune the user's intended crouch tradeoff: substantially slower movement in exchange for longer vision,
      quieter movement and cover protection. Verify vulnerability while repositioning and reasons to stand.
- [ ] Play contested pickups with swapped player/spawn assignments; compare legal walking routes through stairs,
      not straight-line distances. Test central weighting for the highest-rated weapon, retaining random placement
      and minimum spacing. Test single-stair camping against a two-route arena.
- [ ] Finalise/validate arenas after player/AI definitions: legal routes, stair connections, spawn/pickup access and
      ring escape time, including blocked/dead-end approaches. Apply the same checks to built-ins and hand-author/
      playtest them as the quality reference. Compare contrasting weapons and oddity skins for explainable deaths.
- [ ] When vision lands, cover weapon/stance changes, cone edges, a full turn/angle wrap, walls and height. Check dim
      terrain outside versus detailed terrain/entities inside the cone; visibility is directional, not globally
      symmetric. Multiplayer checks retain current state/effects and exclude hidden entity/effect data. Preserve
      failures as reproducible fixtures.

## Phase 2: menus around the game (after the user has played it)

Overlays on the full-screen canvas, each added test-first when the game needs it. Likely first: pause and settings,
the round end and match end overlays. Then the pre-round (prompt, generation, reveal), library, account, rooms. The old
screen map is in `docs/fuzzy-frontend.md` for reference only; do not rebuild it wholesale.

- [ ] Contracts for `ai` and `art` (schemas, `AiAdapter`, `CreditLedger`, asset manifest), drafted test-first, only once the
      game needs them. Ask `ai` and `art` to review (M2).

## Phase C: full project standards. Milestone M3

- [ ] Add the remaining packages: `api/`, `infra/`, and an empty `ai/` with the interfaces from `HANDOFF.md` for `ai`
      (`engine/` and `acceptance-tests/` arrive in Phase 1).
- [ ] `shared/config/`: ESLint base with `restrictedImports` (the table in `AGENTS.md`), Prettier, tsconfig base, vitest
      base; copy janggi's and adapt. Pin TypeScript per the gotcha in `AGENTS.md` (check TS 7 and typescript-eslint first).
- [ ] Per-package `AGENTS.md` files and the nested webapp ones (`react/`, `redux/`), copied from janggi and adapted; strip
      what does not apply (language/Messages, Pages, PWA, bot, push).
- [ ] Root scripts from `AGENTS.md`: `checks`, `format`, `lint:fix`, `start`, `start:preview`, `acceptance-tests`,
      `install-browsers`, `api:dev`, `test:properties`.
- [ ] GitHub Actions: `ci.yml` (checks, then acceptance against a production build, then deploy, then acceptance against
      live) and `property-tests.yml`. `evals.yml` is `ai`'s.
- [ ] The layering inside `webapp/src`: `react/` → `redux/` → `game/`, with `audio/` beside `redux/`; per-frame state outside Redux.

## Phase D: the engine, hardened. Milestone M3

The engine is born in Phase 1, test-first. This phase hardens it as the game settles; these rows are what has to be true by
the end, ticked as Phase 1 reaches them.

- [ ] Simulation rules live in `engine/`: fixed timestep, seeded RNG, no wall clock or `Math.random`.
- [ ] Movement and circle-vs-grid collision; projectile and hitscan weapons for each behavior in the enum; damage, health,
      reload, ammo and reserve; round and match logic; the closing ring.
- [ ] **Visibility:** line of sight against walls and three height levels, with crouch, shared by the server (what to send)
      and the client (what to draw). Wall classes: indestructible walls no weapon passes, cover some weapons penetrate.
- [ ] Even-spaced random spawn and pickup placement from a seed.
- [ ] **Power rating** (deterministic, visible on the reveal screen) and **hard caps** per stat, in code; no nerfing inside the caps.
- [ ] **Arena validator:** bounds, spawn reachability by flood fill, minimum open space, wall and height limits.
- [ ] **Output moderation in code:** length and charset limits plus a blocklist for AI-written names and descriptions.
- [ ] `pnpm test:properties`: fast-check properties for the validator, caps and visibility (directional cone/height cases;
      symmetry only for geometric subproblems with matching assumptions; no leaks through indestructible walls).
- [ ] Final zod schemas for weapon (with `sound` block) and arena in `shared/`, replacing the draft; keep `docs/schemas.md`
      in step. Tell `ai` and `art` if anything they use changed.

## Phase E: API and multiplayer. Milestone M4

- [ ] Worker as plain functions with a thin runtime edge (`ApiWorker.ts`, `WorkerEnvironment.ts`), following janggi's
      `api/AGENTS.md`; one Worker with static assets and `run_worker_first: ["/api/*"]`.
- [ ] Google OIDC with PKCE (`oauth4webapi`, `openid` scope only), hashed opaque session tokens, `/api/me`, log out, delete
      account, rate limiters. Guests can play with the built-in pool.
- [ ] D1 + Drizzle: accounts, sessions, credit ledger (atomic decrement), library with per-account slot limits, match history,
      ratings. Wrangler applies migrations; Drizzle only generates them.
- [ ] `Match` Durable Object, one per match: 20 Hz fixed tick, input validation, **fog-filtered snapshots**, coarse
      directional sound events, 30 s reconnect window and idle forfeit, alarm cleanup. Client prediction and interpolation
      in the webapp (`docs/match-netcode.md`).
- [ ] Private rooms with up to 8 spectators on a host-set delay; a **singleton `Matchmaker` Durable Object** for the public
      queue (FIFO with a widening rating window; D1 holds only ratings and history).
- [ ] **Free-plan spike (spike):** measure Durable Object duration, requests and storage for a 1v1 match, record the result in
      `docs/cost-and-budget.md`, and decide free vs Workers Paid with `ai`.
- [ ] Acceptance specs for: join by code; hidden opponent absent from snapshots and revealed by line of sight; hearing
      range; disconnect and forfeit; spectator delay; public-queue pairing.
- [ ] Keep `docs/match-netcode.md` in step with what is built.

## Phase F: wiring the real AI, art, infrastructure and release. Milestones M5 to M7

- [ ] Swap the real `AiAdapter` (from `ai`) in behind the same interface; wire the AI-off banner, refunds and the timeout
      fallback to the built-in pool.
- [ ] Wire `art`'s deliveries through the manifest until no placeholder is left.
- [ ] `infra/` with Alchemy 0.x: Worker with static assets, D1, Durable Object namespaces, rate limiters. Pinned names and
      `adopt: true` as janggi does. `wrangler.jsonc` for local dev only, kept in sync by hand.
- [ ] `MANUAL-SETUP-STEPS.md` followed once on a throwaway Cloudflare account, then the real domain.
- [ ] Pre-publication scrub checklist (the repo is private for now): secrets, git history, `.claude/settings.local.json`,
      personal paths and addresses.
- [ ] Tuning pass on the tunables (`docs/game-design.md`). Milestone M8.
