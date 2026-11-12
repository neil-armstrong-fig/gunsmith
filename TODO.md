# TODO: the north star path

The shared path all three personas feed. Each persona keeps their own checklist (`TODO-build.md`, `TODO-ai.md`,
`TODO-art.md`); this file says **what the whole project is heading for, in what order, and who is blocking whom.**

## Sync protocol (every fresh session, no exceptions)

1. Read `AGENTS.md`, `HANDOFF.md`, this file, and **all three** persona TODOs: `TODO-build.md`, `TODO-ai.md`, `TODO-art.md`.
2. Before doing anything, say in a few lines: which milestone the project is on, what each of the other two personas is
   doing or waiting on, and what *you* are about to do and whether anything blocks it.
3. If another persona's checklist shows work that depends on yours (or yours on theirs), say so now, and put the
   dependency in "Blockers and requests" below.
4. At the end of your session: tick your own TODO, update your row in the milestone table, add any new blocker, and add a
   line to the delivery log in `HANDOFF.md`.

Start a session with: **"You are build|ai|art, continue the TODO."**

## Status board

Update the one-line status for your persona at the end of each session.

| Persona | Checklist | Current focus | Last updated |
| ------- | --------- | ------------- | ------------ |
| `build` | `TODO-build.md` | Game first, test first, full-screen. Done: acceptance-tests and engine packages; specs for filling the window and walking with walls (WASD, collision in `engine/`). Aiming with the mouse and shooting (first pass). Next: practice dummies and damage | 2026-11-12 |
| `ai` | `TODO-ai.md` | O1 decided: pipeline runs inside the Worker (no Plus); budget $1 a day, $20 month hard cap. Proof `ai/` package waits on the user's review in a worktree. Waiting for the contracts (M2) | 2026-11-12 |
| `art` | `TODO-art.md` | Vision clarified: dim terrain outside rotating weapon/stance cone, detailed terrain + entities inside. Concept and game handoff corrected | 2026-11-12 |

## The path

Milestones in order. A milestone is done when every persona row that applies is ticked and the "done when" holds.
Rows can overlap when nothing blocks them.

| # | Milestone | `build` | `ai` | `art` | Done when |
| - | --------- | ------- | ---- | ----- | --------- |
| M0 | **Foundation** (this repo's docs) | Docs, AGENTS.md, TODO set | | | A fresh session can start from the docs alone. *Done 2026-11-12.* |
| M1 | **A fun, playable game** (was: fuzzy frontend, dropped 2026-11-12) | Phase 0 scaffold, then Phase 1 (engine and acceptance tests, one spec per mechanic; menus come after) | O1 hosting comparison (no code needed from `build`) | A1 palette and brief; early concept sheets | Someone who has never seen it can play a best-of-three against the scripted opponent in a full-screen arena with fog, heights, crouch and the ring, and it is fun. First look by the user. |
| M2 | **Contracts frozen** (un-frozen 2026-11-12: nothing is drafted until the game needs it) | Schemas, `AiAdapter`, `CreditLedger`, asset manifest, drafted test-first; `HANDOFF.md` current | Reviews the schemas and adapter; asks for changes now, not later | Reviews the manifest; asks for changes now | `HANDOFF.md` "What is ready" rows 1 to 4 are ticked and `ai` and `art` have signed off in the delivery log. |
| M3 | **Focus: ATDD and the real engine** | Phase B (specs test-first, area by area) and Phase C (standards, packages, CI) and D (engine, caps, validator) | O2 pipeline against the fake graph inputs; datasets started from fixtures | A2 to A4: sprites, tiles, UI to the manifest | `pnpm checks` green; acceptance suite green on a production build; engine property tests green; first art files delivered. |
| M4 | **Multiplayer for real** | Phase E (API, auth, D1, `Match` DO, fog filtering, rooms, matchmaker) and the free-plan spike | O3 credit spend against the real ledger; the kill-switch flag | A5 copy; A6 static sounds | Two browsers play a match through the real Worker; a hidden opponent is absent from the network snapshot; spike result recorded. |
| M5 | **Real AI behind the adapter** | Swaps the real adapter in; wires the AI-off banner and refunds | O2 and O3 finished; O4 tracing and first evals | Wires nothing; supports with example prompts for datasets | A player can type a weapon and an arena and play with the result; the shutdown drill passes; rejection and timeout paths work. |
| M6 | **Art and audio wired in** | Wires deliveries through the manifest; no placeholder left | Weapon sound-block fuzz tests | Finishes A7 and A8 | The game looks and sounds like itself; no manifest key is missing. |
| M7 | **Ship** | Phase F: infra, throwaway deploy, real domain, post-deploy acceptance, scrub checklist | Evals gate on in CI; budget alerts live | Logo, social image, legal copy final | Live at `gunsmith.neilarmstrong.dev`; acceptance passes against live; alerts and kill switch armed. |
| M8 | **Case study and polish** | Tuning pass on the tunables; known bugs | O4 finished; case-study material; model bake-off | Case-study illustrations | The case study can be written from `docs/focused-case-study.md` and real numbers. |

## Blockers and requests (newest first)

- 2026-11-12, `art` to `build` and `ai`: schema/renderer changes are allowed during development; runtime-generated code is not. Concrete visual-schema proposal and owner tasks are now submitted: `docs/art/visual-schema-proposal.md`. Review before freezing M2; initial limits are proposals to measure.
- 2026-11-12, `art` to `build` and `ai`: crouch must increase forward vision range (same angle/occlusion). Prompt-malleable art needs a visual-description contract: current weapon schema has stats/colour/behaviour but no body/barrel/attachment/effect descriptions. See `docs/art/README.md` and the six oddity prompts before freezing M2.
- 2026-11-12, `art` to `build` and `ai`: user requires stairs as the only height transition, landings on both connected levels, no arena level labels, and prompt-configured forward-cone vision. Update owned schemas, fixtures, engine and generation from the revision in `HANDOFF.md`; weapon-based cone ownership is confirmed; omitted-stat policy awaits the user’s answer.
- 2026-11-12, `art` to `build`: A1 concepts and proposed palette tokens are ready in `docs/art/README.md`; A2–A4 final files wait for the runtime asset manifest (keys, sizes, anchors, formats and tint layers) and behaviour enum. Request art review at M2.
One line each: who is asking whom for what, and since when. Delete the line when it is answered.

- 2026-11-12, `build` to `ai` and `art`: **the draft contracts are withdrawn.** `shared/src` (weapon and arena schemas,
  `AiAdapter`, `CreditLedger`) is deleted at the user's request; the game comes first and nothing goes in `shared/` until
  two packages need it. Do not build or review against it. `build` will announce here, and in `HANDOFF.md`, when a shape
  returns. `art`'s palette tokens in `webapp/src/index.css` stay.

- 2026-11-12, `ai` to `build`: **the pipeline runs inside the Worker, so `api/` will import `ai/`** (`AGENTS.md` table and
  `HANDOFF.md` updated; add `@gunsmith/ai` to `api/`'s `allowedPackages` when you scaffold it). No HTTP client in `shared/`.
  Heads-up for `pnpm-workspace.yaml`: the `ai` package (on the uncommitted worktree `.claude/worktrees/ai-hosting-proof`, not
  yet in main) adds catalog entries (`@langchain/core`, `@langchain/langgraph`, `-cli`, `-sdk`, `wrangler`, `zod`),
  `trustPolicyExclude: chokidar@4.0.3` and `allowBuilds: workerd: false`. It merges only after the user's review, and I will
  tell you first because it touches your `pnpm-workspace.yaml`, lockfile and `shared/`.
- 2026-11-12, `ai` to `build`: Workers Paid is no longer forced by the AI. The only open question for it is `build`'s
  Durable Object spike, plus a CPU re-measure of the real pipeline.
- 2026-11-12, `ai`, open: `art` asks `build` and `ai` to follow the stairs, no-level-labels and forward-cone revision (see
  `HANDOFF.md`). `ai` will review the schemas for it at M2; weapon-based cone ownership is confirmed; the omitted-stat policy awaits the user.

## Open questions and tunables (not blockers)

- [ ] Numbers to tune in play (one config each, `docs/game-design.md`): tick rate 20 Hz, arena size, HP 100, round timer,
      ring timing and damage, spectator delay default, saved-item limits (arenas and weapons), power caps, rating window.
- [ ] The case study's home (personal-site entry or a series): decide once it is done.
- [ ] Final name check (`Gunsmith`) and the subdomain `gunsmith.neilarmstrong.dev`.
- [ ] Whether `api/` imports `ai/` or calls it over HTTP (decided by `ai` in O1; `AGENTS.md` table updates).
- [ ] Free plan or Workers Paid (decided by the `build` spike and `ai`'s hosting comparison, together).

## Legend

`[ ]` to do, `[x]` done, `(spike)` a time-boxed experiment that ends in a written decision, `(unverified)` a fact the
research could not confirm, so check it before relying on it.
