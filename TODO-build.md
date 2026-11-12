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
      a square moved by WASD (now `src/react/components/three/arena-canvas/`, `DirectionFromKeys` unit-tested and mutation-proved).
- [x] `pnpm start` on port 3000 (verified on 3100 while janggi held 3000; re-confirm when it is free).
- [x] 2026-11-12: a fuzzy frontend (15 menu screens, a fake AI and ledger, schemas in `shared/`) was built, looked at and
      deleted at the user's request. The palette tokens in `src/index.css` survive.

## Phase 1: the game, test first. Milestone M1 (redefined: the game is fun)

### Where things stand (end of the 2026-11-12 sessions)

The player walks (WASD, walls stop them), aims with the mouse and clicks to fire bullets that die on walls or on one of
three practice dummies, which are removed at zero health, all in a full-screen arena. **There is now a duel** (`?scenario=duel`,
2026-11-12): a scripted opponent who faces the player and shoots bursts when no wall is between them, a health HUD, and a
round that is won or lost with a "Play again" overlay. `?scenario=sparring` is the same arena with an opponent who cannot
shoot; the practice range (no query) has no opponent, so the old specs are unchanged. The player carries two weapons (keys
1 and 2): a rifle (25 damage, 12 rounds) and a marksman rifle (50 damage, 5 rounds); R reloads, shots spend rounds, and the
ammunition shows in a plain-React HUD (`react/components/dom/ammo-hud/`). Four packages: `webapp/`, `engine/`, `acceptance-tests/`, `shared/` (tool
config plus the state-hook snapshot types). `pnpm checks` is green: engine 284 unit tests, webapp 82, and 55 acceptance
specs (the weapon, HUD, dummy, sparring and duel specs pass at `--repeat-each=10`). Every spec and unit test has been mutation-proved. Read
`engine/AGENTS.md`, `webapp/AGENTS.md`, `webapp/src/react/AGENTS.md` and `acceptance-tests/AGENTS.md` first.

**The webapp's shape (settled with the user, 2026-11-12).** State is Zustand only (`docs/state-management.md`). Layers run
`react/` → `store/` → `game/`, lint-enforced. `store/game/` is the game store: `UseGameStore.ts` at the top (the slice-like
file, state `{world, setWorld}` and nothing else, pinned by a test and a lint allow-list), reads in
`selectors/<name>/` folders (`select-ammo-readout/`, `game-state/`). Components live in `react/components/dom/<name>/` or
`react/components/three/<name>/`; `three/arena-canvas/` hosts the `<Canvas>`, and everything beneath a top-level component
shares its kind, flat. JSX gets a blank line between sibling elements, DOM and r3f alike. The loop writes the world once a
frame; `useFrame` reads it with `gameState()`; the ammo HUD (`dom/ammo-hud/`) reads a selector with `useShallow`. A new
state-bearing feature (health, the round) goes into the engine's `World` first, and the HUD reads it through a new selector.

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
- **zsh and globs:** `grep --include=*.md` fails with "no matches found" because zsh expands the glob. Quote it
  (`--include='*.md'`) or walk the tree in Python. The user also stages changes in their editor, so `git status` shows `A`/`M`
  in the first column for your work: that is theirs, and you still never write to the index.
- **Mutation scripts** live in the scratchpad and are gone with the session; the shape that worked: back the file up, apply
  one replacement that must match exactly once, grep that it landed, run the tests, restore from the backup. One file per
  call; Python, not `sed -i`. **Check that the runner can fail before trusting it:** `vitest --reporter=json` writes to a
  file (`--outputFile=...`), not stdout, so a runner that parsed stdout reported every mutant as a runner error and then
  printed "No survivors". Run one mutant you know is caught, count runner errors in the summary, and write the file
  restore in a `finally` with a compare. For the browser suite use `PLAYWRIGHT_JSON_OUTPUT_NAME` the same way.

**Folder rule (user's, in `AGENTS.md` Code style).** Types go in `<domain>/types/`; a domain's entry points stay at its top;
a helper only one file uses sits in a subject-named subfolder beneath that file; something shared sits at its callers'
nearest common folder and no higher. The 2026-11-12 sweep (every import mapped, single-caller files and types checked)
left only the engine's domain entry points, deliberately, and `dsl/gunsmith/types/Point.ts`. The sweep script was a scratch
file and is not in the repo; recreate it, or turn it into a lint rule, before the codebase is much bigger.

**Known rough, not yet fixed.**
- Tunables are placeholders in one constant each: `PLAYER_SPEED` 6, `PLAYER_RADIUS` 0.4, `TICK_SECONDS` 1/60, the practice
  arena 24 by 14 with four pillars; every weapon number (fire interval, damage, bullet speed, magazine, reload, reserve) sits
  in `engine/src/weapon/weapons/Rifle.ts` and `MarksmanRifle.ts`. Set them by play.
- Colours are placeholders (the floor reads darker than the palette's). The player, barrel, bullets and dummies were
  looked at once in a screenshot (2026-11-12) and read fine. Console noise: a favicon 404 and a three.js `Clock`
  deprecation warning from react-three-fiber.
- `pnpm start` on port 3000 has not been confirmed (janggi held it).
- There is no player health. There is no auto-reload (an empty magazine just stops firing until R), the two weapons share one
  cool-down, and the reserve cannot be refilled (no pickups yet). Dummies (100 health, radius 0.4, three in
  `PracticeDummies.ts`) do not move, do not block the player, and do not come back once shot, so reloading the page is the
  only way to restore them. `Dummies.tsx` (discs fading as they are hurt) has no spec, because the canvas is not in the DOM:
  the specs cover the state it draws from. The ammunition HUD is DOM, so it has its own spec (`AmmoOnTheScreen.test.ts`); only the reload fill animation (CSS) is
  unchecked by a spec.


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
        `alongRay` at 0 the half-chord is already negative, so the result cannot change). The weapon was
        still a constant then (it is a `Weapon` now, below).
  - [x] Reload, magazine, reserve and weapon switching (`ReloadingTheWeapon.test.ts`, `SwitchingWeapons.test.ts`, 10 specs:
        firing on until the magazine is empty stops the bullets; a reload refills it after its time and not before, from
        the reserve; the emptied weapon fires again after reloading; reloading a full magazine does nothing; key 2 puts the
        marksman rifle in hand with its own ammunition, and it takes more health off a dummy than the rifle; the weapon left
        behind keeps its rounds; a switch mid-reload cancels the reload, and the first weapon is never refilled). Engine: a
        real `Weapon` type, `weapon/` (`TriggerPull`, `SpendRound`, `ReloadWeapon`, `weapons/Rifle`, `weapons/MarksmanRifle`)
        and `loadout/` (`SwitchWeapon`, `EquippedWeapon`, `WithEquippedWeapon`, `StartingLoadout`, `types/CarriedWeapon`); a
        `Bullet` carries its own damage and speed, so the loose `BULLET_DAMAGE`, `FIRE_INTERVAL_SECONDS` and `BULLET_SPEED`
        constants are gone. Decisions (stated, not asked, to be set by play): manual reload, no auto-reload; one cool-down
        shared by both weapons; a switch cancels a reload; when R and a switch arrive together the switch lands first and the
        reload is the new weapon's; a reload that finishes in a step lets the weapon fire in that step. Snapshot gained
        `weapon` (`slot`, `rounds`, `reserve`, `reloading`); DSL gained `gunsmith.weapon`, `player.reload()` and
        `player.switchTo(slot)`. Mutation: 45 of 46 engine mutants killed (the survivor, deleting `slot === undefined` in
        `SwitchWeapon`, is equivalent: `undefined - 1` is `NaN`, which the integer check rejects), 16 of 16 webapp unit
        mutants, 17 of 17 browser mutants (each by the right spec). Not covered by a spec, only by engine unit tests: firing
        while reloading, and an empty reserve leaving a reload with nothing to do. The specs were written after the webapp
        wiring, so they were proved by mutation, not watched red first.
  - [x] Health, a scripted opponent and a round win (2026-11-12; slices 1 and 2). `BeatingTheOpponent` (sparring: a hit
        lowers the opponent's health, shooting it to zero wins the round and shows "You won", "Play again" starts a fresh
        round), `FightingBack` (duel: the opponent's shots take the player's health, standing still loses the round, "You
        lost") and `HealthOnTheScreen` (the HUD matches the game's own account). Engine: `health/`, `round/`, `opponent/`
        (`OpponentInput` brain, `burst/`, `sight/HasClearLine`, `DisarmOpponent`), `game-loop/fighter/` (both fighters go
        through `PrepareFighter` and `ShootFighter`), `Bullet.shooter`, damage to each fighter returned by `advanceBullets`.
        Decisions (stated, to be set by play): both start at 100 health and the opponent carries the player's weapons with
        finite ammunition and reloads when dry; its aim is exact (no error yet), bursts are 0.5 s on and 1.5 s off; both
        falling in one step loses; a finished round freezes everything but the clock. Mutation: 28 + 31 engine, 17 webapp
        unit and 11 browser mutants killed by the right tests; survivors were equivalent (`disarmOpponent` twice is
        idempotent), and one real gap (`HasClearLine` with a flipped y direction) was closed with steep-angle tests. Not
        covered by a spec: the opponent disc's drawing and the health bar's width (CSS), like the reload fill.
  - [ ] **Next: give the opponent a simple AI** (slice 3; replaces "it wanders"). The point is a bot that is somewhat
        engaging to test weapons and maps against, not a clever one. **Start in plan mode, and do a web search first** for very
        simple shooter-bot AI (finite state machines in arena shooters, simple bot behaviours for top-down 2D games, cheap
        tricks such as reaction delay, aim error, strafing and retreating to reload), then propose a design as stated defaults
        to confirm, with the sources named. Keep it small. A starting sketch to test against what the search finds:
        - **A handful of states, a finite state machine:** *wander* (walk to a random open floor point, re-pick on arrival or
          after a few seconds), *engage* (it sees the player: turn, close to a good range for the weapon in its hand, strafe
          sideways, fire in bursts), *reload* (break line of sight or back off, then reload). Maybe *search* (go to where it
          last saw the player). Cut anything the search shows is not worth its cost.
        - **Beatable and legible, not perfect:** a reaction delay before it opens fire, aim error that shrinks the closer it
          is or the longer it has seen you, a cap on how often it changes its mind. The exact aim of slice 2 goes.
        - **Weapon- and map-agnostic**, because it exists to test them: it reads range, fire interval and magazine from the
          `Weapon` it holds, and picks waypoints from the arena's open floor with no hand-authored navigation. Steering is
          straight lines that slide along walls; a grid pathfinder (BFS or A\*) only if the search or a playtest shows
          pillars trap it, and then ask before adding any dependency (a hand-written one is a few dozen lines).
        - **Deterministic:** the brain's memory (state, goal, timers, last-seen point) lives in `World`, plain data, and
          randomness comes from a seeded generator whose seed lives in `World` too (a ~10-line mulberry32 in
          `engine/random/`, no dependency; `pure-rand` 8.4.2 was not checked for whether its state is plain data). Same seed and
          inputs, same world, so a match replays and the server and client agree. `Math.random` only in the webapp, to
          pick a seed per page load.
        - **Difficulty is a few named tunables** (reaction seconds, aim error, preferred range, burst length), one constant
          each, so a weapon or a map can be tried against an easier or harder bot.
        - **Tests:** engine unit tests carry exact behaviour per state and the transitions between them (each state entered
          and left for the right reason, mutation-proved). Acceptance specs assert properties only (it moves, it comes at you
          when it sees you, it takes cover to reload, it hurts a player who stands still), because Playwright's timing
          decides how many ticks pass between actions. Sparring stays a still, unarmed target (the win specs aim at where it
          stands); give the duel's "lost" wait a longer timeout.
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
- [ ] Per-package `AGENTS.md` files and the nested webapp ones (`react/`, `store/`), copied from janggi and adapted; strip
      what does not apply (language/Messages, Pages, PWA, bot, push).
- [ ] Root scripts from `AGENTS.md`: `checks`, `format`, `lint:fix`, `start`, `start:preview`, `acceptance-tests`,
      `install-browsers`, `api:dev`, `test:properties`.
- [ ] GitHub Actions: `ci.yml` (checks, then acceptance against a production build, then deploy, then acceptance against
      live) and `property-tests.yml`. `evals.yml` is `ai`'s.
- [x] The layering inside `webapp/src`: `react/` → `store/` → `game/` (Zustand, not Redux; lint-enforced, 2026-11-12), with
      `audio/` beside `store/` when it arrives. The game store holds only the engine's `World`; per-frame values are read with
      `gameState()` and never bound to React. An app store (UI, lobby, library, credits) comes when a screen needs it.

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
