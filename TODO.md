# TODO: the north star path

The shared path all seven personas feed. Each persona keeps a `TODO-<persona>.md` checklist; this file says **what the whole project is heading for, in what order, and who is blocking whom.**

## Sync protocol (every fresh session)

1. Check status/branch/worktree: main is integration-only. Development resumes in the assigned persona worktree, synced from committed main when clean; record its path, branch and last merged main commit in your resume (see Operations.md). Read root `AGENTS.md`, `HANDOFF.md`, this status board and the current milestone. Scan blocker/request headings and read those involving your task or its dependencies; future milestones and unrelated requests are references.
2. Read your own checklist's current resume section and the tasks in scope. Read other persona checklists only for dependencies; historical archives are optional task references.
3. Before editing code, explicitly read every applicable package and nested `AGENTS.md` in full. Starting Codex at the repository root does not automatically load package instructions. Never assume a file was loaded; recover any truncated instruction read in smaller sections.
4. Say which milestone is current, what the other personas are doing or waiting on, and what you will do. Use this board for their current status.
5. Finish by updating your checklist resume (current slice, owned files, next failing test/check and next action), your status row and blockers, and adding a concise delivery to `HANDOFF.md`. Move detailed historical narratives to `docs/history/`; keep current decisions and unfinished tasks visible.
6. Report actual verification results. A standards review must name the instruction files and include the folder/caller audit; it is separate from lint and test results.

Start a session with: **"You are engine, continue the TODO."** Substitute any persona from the status board.

## Status board

| Persona | Model | Checklist | Current focus | Updated |
| --- | --- | --- | --- | --- |
| play | Claude | [TODO-play.md](TODO-play.md) | Combat feedback, HUD/inventory, camera and runtime audio; close M1 playtest. | 2026-11-17 |
| engine | Claude | [TODO-engine.md](TODO-engine.md) | Bot pickup-seeking; extend merged routing, cross-level engagement/cover, validators and balancing. | 2026-11-17 |
| ai | Claude | [TODO-ai.md](TODO-ai.md) | Fix eight reported canned-response fake-eval failures; renderer, calibration and arena generation. | 2026-11-17 |
| server | Claude | [TODO-server.md](TODO-server.md) | First authoritative two-browser slice after M1; auth, persistence and online privacy. | 2026-11-17 |
| budget | Claude | [TODO-budget.md](TODO-budget.md) | Production ledger/spend boundaries with server/AI; credits, refunds, tracing and kill switch. | 2026-11-17 |
| art | Codex | [TODO-art.md](TODO-art.md) | Production assets/presentation, Safari timing and combat masking; current sprites/MP3 are integrated. | 2026-11-17 |
| ship | Codex | [TODO-ship.md](TODO-ship.md) | Four-shard preview CI with combined reporting; hosted timing/validation next, infra/release awaits bindings and authorization. | 2026-11-17 |

These are persistent workstreams, not permission for simultaneous edits to the same files. Select one current slice; record concrete reservations and contracts in HANDOFF.md. Model assignments are defaults, not application configuration. `build` is retired; [migration history](docs/history/2026-11-17-persona-migration.md) preserves its tasks.

Earlier status, requests and measurements: [snapshot](docs/history/2026-11-17-compaction/SharedTodo.md).

## The path

M0 is complete; M1 is current. Later milestones proceed when their consumers and dependencies exist; owner checklists hold the implementation tasks.

| # | Milestone | Done when |
| - | --------- | --------- |
| M0 | **Foundation** (this repo's docs) | A fresh session can start from the docs alone. *Done 2026-11-12.* |
| M1 | **A fun, playable game** (was: fuzzy frontend, dropped 2026-11-12) | Someone who has never seen it can play a best-of-three against the scripted opponent in a full-screen arena with fog, heights, crouch and the ring, and it is fun. First look by the user. |
| M2 | **Contracts frozen** (un-frozen 2026-11-12: nothing is drafted until the game needs it) | Real consumers have reviewed the required schemas, adapter, ledger and asset manifest; domain owners and affected consumers sign off in HANDOFF.md. |
| M3 | **Focus: ATDD and the real engine** | `pnpm checks` green; acceptance suite green on a production build; engine property tests green; first art files delivered. |
| M4 | **Multiplayer for real** | Two browsers play a match through the real Worker; a hidden opponent is absent from the network snapshot; spike result recorded. |
| M5 | **Real AI behind the adapter** | A player can type a weapon and an arena and play with the result; the shutdown drill passes; rejection and timeout paths work. |
| M6 | **Art and audio wired in** | The game looks and sounds like itself; no manifest key is missing. |
| M7 | **Ship** | Live at `gunsmith.neilarmstrong.dev`; acceptance passes against live; alerts and kill switch armed. |
| M8 | **Case study and polish** | The case study can be written from `docs/focused-case-study.md` and real numbers. |

## Blockers and requests

- **engine → play:** agree local damage/hit events and inventory data; engine writes simulation changes, play consumes them. Cross-level bot engagement and cover are merged; extend them rather than restart.
- **art → play:** approved [inventory](docs/art/concepts/inventory-display/README.md) and [combat feedback](docs/art/concepts/combat-feedback/Handover.md) are ready. Art owns assets/manifests; play implements feedback and HUD behavior.
- **engine ↔ ai:** initial rating/balancing and five-call pipeline are merged. Extend/calibrate rather than restart. Labels v1 and AI-chosen unspecified values are approved; inference probes still need authorization and cumulative spend reconciliation. Preserve deliberate weak weapons.
- **ai → art:** generated-appearance renderer and readability evidence precede further visual review; kit generation remains shelved. Eight canned-response fake-eval failures remain reported, not evidence of live-model quality.
- **engine → server:** [arena fairness](docs/art/arena-fairness-research.md), visibility and deterministic contracts support online play. Preserve random ring centres and validate built-ins too. Public-play [fair-play/privacy](docs/art/fair-play-research.md) belongs to server, not the M1 gate.
- **server ↔ budget ↔ ship:** server supplies account/storage/call boundaries; budget owns atomic credit/spend enforcement and tracing; ship provisions approved bindings and deployment automation. No speculative shared contracts or live changes.
- **art/play:** MP3 is approved and empty click integrated. Safari timing, masking/fatigue and levels remain follow-up QA, with existing thresholds and masters preserved.
- Current milestone remains M1. Add menus, shared contracts and future packages only with real consumers. Later workstreams can refine relevant acceptance scenarios while waiting.

## Open questions and tunables

- [ ] Tune movement/vision, health, ring, spawn/arena and power parameters through play; later spectator delay, saved-item limits and rating windows.
- [ ] Choose free versus Workers Paid after real Durable Object and AI CPU measurements.
- [ ] Final name/domain check and case-study publication home.

API imports AI in the Worker; that hosting decision is settled. Completed work and superseded requests belong in linked history, not this queue.
