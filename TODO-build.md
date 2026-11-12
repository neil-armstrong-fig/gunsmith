# TODO: build (Session 1, game and project, Claude Code)

Your checklist. The shared path is `TODO.md`; read it and `TODO-ai.md` and `TODO-art.md` first, every fresh session
(the sync protocol is at the top of `TODO.md`). Decisions behind every item are in `docs/`.

**The order matters.** A **fuzzy frontend** comes first (`docs/fuzzy-frontend.md`, after
https://neilarmstrong.dev/blog/fuzzy-frontend/): every screen and path clickable end to end, fake data, no backend, as
fast as possible, so a rough game can be seen and judged within the first sitting. ATDD follows straight after, area by
area. The fuzzy frontend is **not thrown away**; it becomes the product.

**What the others are waiting for from you:** `ai` needs the contracts in `HANDOFF.md` (schemas, `AiAdapter`,
`CreditLedger`, the power rating and arena validator); `art` needs the asset manifest and `docs/art/` stubs. Produce them
as soon as the fuzzy frontend has shaped them, and say so in `TODO.md`'s status board.

## Phase 0: minimal scaffold (target: well under an hour). Milestone M1

Just enough to run React with react-three-fiber. The full standards work is Phase C.

- [x] `git init` (the user ran it), `.nvmrc` (26.13.1, the current LTS), `.editorconfig`, `.gitignore` (ignore `.dev.vars`,
      `.wrangler/`, `.alchemy/`, `.playwright-mcp/`, `test-results/`, `.claude/settings.local.json`, `.claude/worktrees/`),
      `LICENSE` decision (private for now: no LICENSE file). No commit yet; waiting for the user to ask.
- [x] pnpm workspace with `webapp/` and `shared/` only (more packages arrive in Phase C). Exact-pinned `catalog:` with the
      7-day release-age policy (janggi's policy block). Versions are the newest stable at least 7 days old on 2026-11-12;
      TypeScript held at 6.0.3 (see `AGENTS.md` gotchas). `@react-three/drei` skipped: nothing uses it yet.
- [x] `webapp/`: Vite, React 19, strict TypeScript, Tailwind v4, Redux Toolkit, `three`, `@react-three/fiber`. An
      orthographic top-down canvas that draws a square and moves it with WASD (`src/react/arena/`).
- [x] `pnpm start` works on port 3000. Config is port 3000 with `strictPort`; verified in a browser on 3100 only, because
      janggi's dev server held 3000 (not killed). Re-confirm on 3000 once it is free.

## Phase A: the fuzzy frontend (target: a clickable whole game in the first day or two). Milestone M1

Build it screen by screen from the map in `docs/fuzzy-frontend.md`. Every screen exists and every path works; fake data and
a fake opponent; rough visuals are fine. Keep the ledger in `docs/fuzzy-frontend.md` current.

- [ ] **Step jumper:** a dev hotkey (backtick) opens a menu to jump to any screen or state (rejected prompt, AI off,
      generation timeout, round end, match end, spectator, and the rest listed in the doc).
- [ ] **Fake world, in the browser:** a fake server (in-memory plus `localStorage`) for sign-in, credits, library and rooms,
      and a **fake `AiAdapter`** (fixture weapons and arenas, simulated delay, pipeline-progress events, failure modes).
      Shape them as the real interfaces from the start (`HANDOFF.md`).
- [ ] **Fixture content** in `shared/`: hand-written valid weapons (a mild one, a broken overpowered one, one per behavior)
      and three arenas (flat, two-storey, three-storey), typed by a first draft of the zod schemas (`docs/schemas.md`).
- [ ] **Screens** (all clickable): landing; practice arena; fake Google sign-in; private room (code, waiting, spectators,
      host sets spectator delay); public queue; pre-round prompt entry; generation progress; reveal; match HUD; round end;
      match end; library; spectator view; match history; account and credits; AI-off banner; error states.
- [ ] **Playable core, even if rough:** WASD move, mouse aim, shoot, reload, crouch, keys 1 and 2, pick up and drop a custom
      weapon, health, round and match score, a scripted opponent that wanders and shoots, practice dummies. Fog drawn from a
      visibility polygon with three height levels. The closing ring after the round timer.
- [ ] **Rough sound:** Web Audio gunshots from a weapon's `sound` block; silence elsewhere until `art`'s files arrive.
- [ ] **Asset manifest** (`webapp/src/assets/manifest`): every sprite, tile, icon and sound has a stable key, size, format
      and placeholder (`docs/art/asset-manifest.md`). Tell `art`.
- [ ] **Demo checkpoint:** run the whole flow once, record what felt wrong in `docs/fuzzy-frontend.md`, tell the user it is
      ready for a first look, and agree what to cut or add before Phase B.

## Contracts (Milestone M2)

- [ ] Draft schemas, fixtures, `AiAdapter` and fake, `CreditLedger` and fake, credit config, asset manifest: all in the
      places `HANDOFF.md` names. Tick the first four "What is ready" rows there.
- [ ] Ask `ai` and `art` to review them now; record their sign-off in the delivery log before changing anything again.

## Phase B: ATDD fast follow (starts as soon as the fuzzy frontend has been looked at). Milestone M3

Bring each area into focus **test first**: write the acceptance test, watch it fail for the right reason, make it pass.
One area at a time, keeping the flow clickable. Close each ledger row only when its spec exists and has been watched to fail.

- [ ] `acceptance-tests/` with the four layers and `withDslOnly`, desktop project only, lint-enforced boundaries (copy
      janggi's skeleton: `acceptance-criteria-mapping`, `dsl`, the `*Dsl`/`*Playwright` pairing).
- [ ] The **canvas state hook** for the DSL (read-only, tiny) and a `FakeApi` Playwright route stand-in as in janggi.
- [ ] Specs, in this order: start a practice match; move, aim and shoot; switch weapon with 1 and 2; pick up and drop a
      custom weapon; crouch; a hit and a round win; best of three; the pre-round flow with the fake adapter (including
      rejection, timeout and AI-off); the reveal screen; library save, favourite, rename and slot limit; credits and daily reset.
- [ ] Mutation-prove each new spec (`AGENTS.md`).

## Phase C: full project standards. Milestone M3

- [ ] Add the remaining packages: `engine/`, `acceptance-tests/`, `api/`, `infra/`, and an empty `ai/` with the interfaces from
      `HANDOFF.md` for `ai`.
- [ ] `shared/config/`: ESLint base with `restrictedImports` (the table in `AGENTS.md`), Prettier, tsconfig base, vitest
      base; copy janggi's and adapt. Pin TypeScript per the gotcha in `AGENTS.md` (check TS 7 and typescript-eslint first).
- [ ] Per-package `AGENTS.md` files and the nested webapp ones (`react/`, `redux/`), copied from janggi and adapted; strip
      what does not apply (language/Messages, Pages, PWA, bot, push).
- [ ] Root scripts from `AGENTS.md`: `checks`, `format`, `lint:fix`, `start`, `start:preview`, `acceptance-tests`,
      `install-browsers`, `api:dev`, `test:properties`.
- [ ] GitHub Actions: `ci.yml` (checks, then acceptance against a production build, then deploy, then acceptance against
      live) and `property-tests.yml`. `evals.yml` is `ai`'s.
- [ ] The layering inside `webapp/src`: `react/` → `redux/` → `game/`, with `audio/` beside `redux/`; per-frame state outside Redux.

## Phase D: the engine, properly. Milestone M3

Extract and harden what the fuzzy frontend proved. Never fuzzy: test-first from the start.

- [ ] Simulation rules move from the webapp into `engine/`: fixed timestep, seeded RNG, no wall clock or `Math.random`.
- [ ] Movement and circle-vs-grid collision; projectile and hitscan weapons for each behavior in the enum; damage, health,
      reload, ammo and reserve; round and match logic; the closing ring.
- [ ] **Visibility:** line of sight against walls and three height levels, with crouch, shared by the server (what to send)
      and the client (what to draw). Wall classes: indestructible walls no weapon passes, cover some weapons penetrate.
- [ ] Even-spaced random spawn and pickup placement from a seed.
- [ ] **Power rating** (deterministic, visible on the reveal screen) and **hard caps** per stat, in code; no nerfing inside the caps.
- [ ] **Arena validator:** bounds, spawn reachability by flood fill, minimum open space, wall and height limits.
- [ ] **Output moderation in code:** length and charset limits plus a blocklist for AI-written names and descriptions.
- [ ] `pnpm test:properties`: fast-check properties for the validator, caps and visibility (symmetry; no leaks through
      indestructible walls).
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
