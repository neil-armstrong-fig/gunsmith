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
      a square moved by WASD (now `src/react/arena-canvas/`, `DirectionFromKeys` unit-tested and mutation-proved).
- [x] `pnpm start` on port 3000 (verified on 3100 while janggi held 3000; re-confirm when it is free).
- [x] 2026-11-12: a fuzzy frontend (15 menu screens, a fake AI and ledger, schemas in `shared/`) was built, looked at and
      deleted at the user's request. The palette tokens in `src/index.css` survive.

## Phase 1: the game, test first. Milestone M1 (redefined: the game is fun)

### Where things stand (end of the 2026-11-12 sessions)

The player walks (WASD, walls stop them), aims with the mouse and clicks to fire bullets that die on walls or on one of
three practice dummies, which take 25 damage a hit and are removed at zero health, all in a full-screen arena. Four
packages: `webapp/`, `engine/`, `acceptance-tests/`, `shared/` (tool config plus the state-hook snapshot types).
`pnpm checks` is green: engine 117 unit tests, webapp 40, and 27 acceptance specs (the suite passes 270 of 270 at
`--repeat-each=10`). Every spec and unit test has been mutation-proved. Read `engine/AGENTS.md`, `webapp/AGENTS.md` and
`acceptance-tests/AGENTS.md` first.

**Starting a session.** Run `ps -axo command | grep -c "[p]ermission-prompt-tool"` (macOS `pgrep -a` does not show
arguments) and `lsof -i :3100` before starting a server. Re-read a shared doc right before editing it; other sessions
leave uncommitted edits in `TODO*.md`, `HANDOFF.md` and `docs/`.

**How to run the specs.** Port 3000 may be held by janggi, so use another:
`pnpm --filter @gunsmith/webapp exec vite --port 3100 --strictPort` in the background, then
`WEBAPP_URL=http://localhost:3100 pnpm acceptance-tests`, then `pkill -f "vite.*--port 3100"`. `pnpm install-browsers`
once. Repeat a suite with `pnpm --filter @gunsmith/acceptance-tests exec playwright test --repeat-each=15` to check for flakes.

**Shape of the work, one mechanic at a time:** engine unit tests first (red), then the engine code; the acceptance spec and
DSL next (red, for the right reason); then the webapp; then mutate the real code and confirm the right tests fall.
`engine/` is the rules (deterministic, no clock); the webapp's `useGameLoop` hook feeds it fixed 1/60 s steps; specs read
the game only through the state hook (`window.gunsmithState`, `shared/src/state-hook/`) and never sleep (they wait on
`elapsedSeconds`). Bring up any dependency that would replace code before writing it, with version and release age; the
likely ones are a seeded RNG (`pure-rand`), a visibility-polygon library (for the fog) and a grid pathfinder (for the
scripted opponent). `fast-check` is deferred at the user's request.

**Gotchas learned.**
- **zsh does not word-split an unquoted `$VAR`.** A mutation script that looped over `$FILES` silently failed to back
  anything up and left seven mutations stacked in the source. Use arrays or one file per call, and `cmp` after every
  restore. Never chain a `sed -i` ahead of `&&` on macOS (it needs `-i ''`); use `perl -pi` or Python.
- **A perl replacement string interpolates `@src`** as an empty array. Use Python for import rewrites.
- **A fast click cannot be reproduced by an acceptance spec** (Playwright's down then up spans a frame), so the click
  latch (`use-firing/trigger/FiringLatch.ts`) is covered by unit tests only.
- **A bullet is in the air for only 0.17 to 0.5 s.** `BulletsPlaywright` installs an in-page recorder at load so
  `waitForABullet` cannot miss one. Do the same for any other short-lived thing a spec must see.
- The MCP browser may be held by another session; `pnpm --filter @gunsmith/acceptance-tests exec playwright screenshot
  --viewport-size=1600,900 --wait-for-timeout=1500 <url> <file>` takes a picture with our own install.
- **Read and wait on the game through `BasePage`**: `readGameState()` and `waitForGameState(check)`. The check runs in the
  test (an `expect.poll`), so it can use anything in scope. A function given to `page.waitForFunction` or `evaluate` is
  serialised into the page and cannot see module constants, so reserve those for what must run in the page (the bullet
  recorder, which catches a state that comes and goes between two looks).
- **A wait must not be a spec's only assertion**: a helper that never waited would pass it. Assert the state after the wait
  (`FiringAShot` checks `bullets.count()` is 0 after `waitForNoBullets`). Mutate the helper to prove it.
- **Chained `fire()` clicks inside the 0.2 s cool-down are swallowed**: to shoot repeatedly, `startFiring()` (hold the
  button) and wait on game state, never on a count of clicks.
- **Mutation scripts** live in the scratchpad and are gone with the session; the shape that worked: back the file up, apply
  one replacement that must match exactly once, grep that it landed, run the tests, restore from the backup. One file per
  call; Python, not `sed -i`.

**Folder rule (user's, in `AGENTS.md` Code style).** Types go in `<domain>/types/`; a domain's entry points stay at its top;
a helper only one file uses sits in a subject-named subfolder beneath that file; something shared sits at its callers'
nearest common folder and no higher. The 2026-11-12 sweep (every import mapped, single-caller files and types checked)
left only the engine's domain entry points, deliberately, and `dsl/gunsmith/types/Point.ts`. The sweep script was a scratch
file and is not in the repo; recreate it, or turn it into a lint rule, before the codebase is much bigger.

**Known rough, not yet fixed.**
- Tunables are placeholders in one constant each: `PLAYER_SPEED` 6, `PLAYER_RADIUS` 0.4, `BULLET_SPEED` 20,
  `FIRE_INTERVAL_SECONDS` 0.2, `TICK_SECONDS` 1/60, the practice arena 24 by 14 with four pillars. Set them by play.
- Colours are placeholders (the floor reads darker than the palette's). The player, barrel, bullets and dummies were
  looked at once in a screenshot (2026-11-12) and read fine. Console noise: a favicon 404 and a three.js `Clock`
  deprecation warning from react-three-fiber.
- `pnpm start` on port 3000 has not been confirmed (janggi held it).
- There is one built-in weapon and no player health. Dummies (100 health, 25 a bullet, radius 0.4, three in
  `PracticeDummies.ts`) do not move, do not block the player, and do not come back once shot, so reloading the page is the
  only way to restore them. `Dummies.tsx` (discs fading as they are hurt) has no spec, because the canvas is not in the DOM:
  the specs cover the state it draws from.
- The tunables `BULLET_DAMAGE`, `FIRE_INTERVAL_SECONDS` and `BULLET_SPEED` are loose constants waiting for a `Weapon` type.


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
  - [x] A practice dummy takes damage and dies (`ShootingADummy.test.ts`: one shot lowers its health, firing on removes
        it, the others untouched, a shot where there is no dummy hurts none). Engine: the bullet's flight decides hits
        (nearest of wall and dummy, an exact ray-against-circle test), `dummy/HurtDummies`; `dummies` in `World` and in
        the state-hook snapshot; DSL `gunsmith.dummies` and `player.startFiring`/`stopFiring`. About twenty engine mutants,
        three snapshot mutants and six browser mutants (game, hook and dummy size) were each caught by the right tests
        (one survivor, `alongRay <= 0` in `DistanceToCircle`, is equivalent: with the start outside the circle and
        `alongRay` at 0 the half-chord is already negative, so the result cannot change). The weapon is
        still a constant.
  - [ ] **Next:** reload, magazine and reserve; keys 1 and 2 switch weapon (this is when a real `Weapon` type appears,
        and with it the bullet damage and fire interval move onto it). A starting sketch, to be proposed to the user as
        stated defaults rather than asked about, and to be confirmed or changed at the plan:
        - **Engine, unit tests first.** `weapon/types/Weapon.ts` (fire interval, damage, magazine size, reload seconds, bullet
          speed) and two built-in weapons with visibly different damage, so a spec can tell them apart by how much health a
          dummy loses. The player carries two weapons, which one is equipped, rounds in the magazine, a reserve, and a reload
          timer. `Input` gains `reload` and a slot to switch to. `TriggerPull` takes the weapon's interval; a `Bullet` carries
          its damage and speed, so `AdvanceBullets` stops reading the constants; an empty magazine does not fire; reloading
          moves rounds from the reserve; switching cancels a reload; an empty reserve leaves the reload with nothing to do.
        - **Specs (one criterion each):** firing until the magazine is empty stops the bullets; reload refills it after a
          delay and not before; the empty weapon fires again afterwards; key 2 swaps to a weapon that does different damage to
          a dummy; switching mid-reload cancels the reload. Hold the trigger with `startFiring()`, wait on game state.
        - **State hook and DSL:** a small `weapon` block in the snapshot (slot, rounds in the magazine, reserve, reloading),
          `player.reload()` (the R key) and `player.switchTo(slot)`; add both verbs to the `then` lint regex in
          `acceptance-tests/eslint.config.js`. Draw the ammo somewhere the screenshot can show; no HUD component yet.
        - Then delete the loose `BULLET_DAMAGE`, `FIRE_INTERVAL_SECONDS` and `BULLET_SPEED` constants, and update
          `engine/AGENTS.md`.
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
