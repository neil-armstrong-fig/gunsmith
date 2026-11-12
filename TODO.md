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
| `build` | `TODO-build.md` | Phase 0 scaffold done (square moves with WASD). Next: Phase A, the fuzzy frontend, starting with the step jumper and fake world | 2026-11-12 |
| `ai` | `TODO-ai.md` | O1 desk research done, recommendation provisional (option 1). Owed: one-node proof and the user's Plus decision. Waiting for the contracts (M2) | 2026-11-12 |
| `art` | `TODO-art.md` | Not started. The palette and brief (A1) can start now | 2026-11-12 |

## The path

Milestones in order. A milestone is done when every persona row that applies is ticked and the "done when" holds.
Rows can overlap when nothing blocks them.

| # | Milestone | `build` | `ai` | `art` | Done when |
| - | --------- | ------- | ---- | ----- | --------- |
| M0 | **Foundation** (this repo's docs) | Docs, AGENTS.md, TODO set | | | A fresh session can start from the docs alone. *Done 2026-11-12.* |
| M1 | **Fuzzy frontend**: the whole game clickable | Phase 0 scaffold, then Phase A (all screens, fake world, rough play) | O1 hosting comparison (no code needed from `build`) | A1 palette and brief; early concept sheets | Someone who has never seen it can play a best-of-three against the scripted opponent, run the pre-round with the fake AI, and save a weapon. First look by the user. |
| M2 | **Contracts frozen** | Draft schemas, fixtures, `AiAdapter`, `CreditLedger`, asset manifest in `shared/` and `webapp/`; `HANDOFF.md` current | Reviews the schemas and adapter; asks for changes now, not later | Reviews the manifest; asks for changes now | `HANDOFF.md` "What is ready" rows 1 to 4 are ticked and `ai` and `art` have signed off in the delivery log. |
| M3 | **Focus: ATDD and the real engine** | Phase B (specs test-first, area by area) and Phase C (standards, packages, CI) and D (engine, caps, validator) | O2 pipeline against the fake graph inputs; datasets started from fixtures | A2 to A4: sprites, tiles, UI to the manifest | `pnpm checks` green; acceptance suite green on a production build; engine property tests green; first art files delivered. |
| M4 | **Multiplayer for real** | Phase E (API, auth, D1, `Match` DO, fog filtering, rooms, matchmaker) and the free-plan spike | O3 credit spend against the real ledger; the kill-switch flag | A5 copy; A6 static sounds | Two browsers play a match through the real Worker; a hidden opponent is absent from the network snapshot; spike result recorded. |
| M5 | **Real AI behind the adapter** | Swaps the real adapter in; wires the AI-off banner and refunds | O2 and O3 finished; O4 tracing and first evals | Wires nothing; supports with example prompts for datasets | A player can type a weapon and an arena and play with the result; the shutdown drill passes; rejection and timeout paths work. |
| M6 | **Art and audio wired in** | Wires deliveries through the manifest; no placeholder left | Weapon sound-block fuzz tests | Finishes A7 and A8 | The game looks and sounds like itself; no manifest key is missing. |
| M7 | **Ship** | Phase F: infra, throwaway deploy, real domain, post-deploy acceptance, scrub checklist | Evals gate on in CI; budget alerts live | Logo, social image, legal copy final | Live at `gunsmith.neilarmstrong.dev`; acceptance passes against live; alerts and kill switch armed. |
| M8 | **Case study and polish** | Tuning pass on the tunables; known bugs | O4 finished; case-study material; model bake-off | Case-study illustrations | The case study can be written from `docs/focused-case-study.md` and real numbers. |

## Blockers and requests (newest first)

One line each: who is asking whom for what, and since when. Delete the line when it is answered.

- 2026-11-12, `ai` to the user and `build`: **Cloudflare Containers need Workers Paid** (Free shows N/A), and a self-hosted
  LangGraph server also needs an external Postgres and Redis and an unverified licence. So hosting option 2 forces Paid; the
  recommended option 1 does not (it costs LangSmith Plus, $39 a month, on top of the $20 model ceiling). `ai` needs the
  user's decision on Plus before any real deploy (`docs/ai-hosting.md`). No action for `build` yet.
- 2026-11-12, `ai` to the user: the $1 a day soft cap exceeds the $20 month ($30), so the monthly counter is the real limit;
  pick a daily number (about $0.65) when you next look at `docs/cost-and-budget.md`. Credit prices in `shared/` may need a
  change if Sonnet stays the generator (not if Haiku does).

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
