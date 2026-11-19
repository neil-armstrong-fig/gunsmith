# TODO: the north star path

The shared path all seven personas feed. Each persona keeps a `TODO-<persona>.md` checklist; this file says **what the whole project is heading for, in what order, and who is blocking whom.**

## Sync protocol (every fresh session)

1. Check status/branch/worktree: main is integration-only. Development resumes in the assigned persona worktree, synced from committed main when clean; record its path, branch and last merged main commit in your resume (see Operations.md). Read root `AGENTS.md`, `HANDOFF.md`, this status board and the current milestone. Scan blocker/request headings and read those involving your task or its dependencies; future milestones and unrelated requests are references.
2. Read your own checklist's current resume section and the tasks in scope. Read other persona checklists only for dependencies; historical archives are optional task references.
3. Before editing code, explicitly read every applicable package and nested `AGENTS.md` in full. Starting Codex at the repository root does not automatically load package instructions. Never assume a file was loaded; recover any truncated instruction read in smaller sections.
4. Say which milestone is current, what the other personas are doing or waiting on, and what you will do. Use this board for their current status.
5. Finish by updating your checklist resume (current slice, owned files, next failing test/check and next action), your status row and blockers, and adding a concise delivery to `HANDOFF.md`. Keep completed session narratives outside the public documentation; preserve current decisions and unfinished tasks.
6. Report actual verification results. A standards review must name the instruction files and include the folder/caller audit; it is separate from lint and test results.

Start a session with: **"You are engine, continue the TODO."** Substitute any persona from the status board.

## Status board

| Persona | Model | Checklist | Current focus | Updated |
| --- | --- | --- | --- | --- |
| play | Claude | [TODO-play.md](TODO-play.md) | Hit confirmation, camera shake and reduced motion integrated. Ring loop and inventory HUD arrived from ship's worktree and are merged here; play reviews them live. Held weapons are built (art); recoil and muzzle flash are deferred until after the MVP. Play now owns weapon and arena selection: [concept and mock-up](docs/selection-concept/README.md) decided (making in a workshop, the pre-round only chooses); the workshop is the first slice. | 2026-11-18 |
| engine | Claude | [TODO-engine.md](TODO-engine.md) | Fair-duel starts and bot reaction to unseen shots integrated. Built-in arena pool (Duel, Fair duel) and arena size limits built for ai and server to adopt; integrated. Low cover blocks: sight half built (`?scenario=cover`, spec `HidingBehindCover`), bullets next. Inventory data is ship's (`6795b56`). High-ground playtest, wall density/corridor limits and reflection remain open. | 2026-11-18 |
| ai | Claude | [TODO-ai.md](TODO-ai.md) | Player arena selection and engine validation integrated. S4-1 contrast, model quality, and the production adapter remain open. | 2026-11-18 |
| server | Claude | [TODO-server.md](TODO-server.md) | Online best-of-three rounds and seat reconnect integrated. Reconnect window and idle forfeit built (committed, merged with main, integrated (`24e22e4`)); account/storage and the generation route remain open. | 2026-11-18 |
| budget | Claude | [TODO-budget.md](TODO-budget.md) | Credit and spend Durable Objects integrated; account identity and the generation route remain blockers. | 2026-11-17 |
| art | Codex | [TODO-art.md](TODO-art.md) | Stairs and local held and ground weapon artwork are integrated. Room rendering can now use inventory identity. Review of the integrated HUD, ring audio and pickup cue, S4-1 fallback review and audio listening remain open. | 2026-11-18 |
| ship | Codex | [TODO-ship.md](TODO-ship.md) | Function-order and named-helper lint integrated, including tests. Hosted CI profiling and deployment remain open. | 2026-11-18 |

These are persistent workstreams, not permission for simultaneous edits to the same files. Select one current slice; record concrete reservations and contracts in HANDOFF.md. Model assignments are defaults, not application configuration. `build` is retired; current tasks remain in the seven owner checklists.


## The path

M0 is complete; M1 is current. Later milestones proceed when their consumers and dependencies exist; owner checklists hold the implementation tasks.

| # | Milestone | Done when |
| - | --------- | --------- |
| M0 | **Foundation** (this repo's docs) | A fresh session can start from the docs alone. *Done 2026-11-12.* |
| M1 | **A fun, playable game** (replaced the first fuzzy frontend, 2026-11-12; same rough-parts-first intent, applied to the game: [approach](docs/build-approach.md)) | Someone who has never seen it can play a best-of-three against the scripted opponent in a full-screen arena with fog, heights, crouch and the ring, and it is fun. First look by the user. |
| M2 | **Contracts frozen** (un-frozen 2026-11-12: nothing is drafted until the game needs it) | Real consumers have reviewed the required schemas, adapter, ledger and asset manifest; domain owners and affected consumers sign off in HANDOFF.md. |
| M3 | **Focus: ATDD and the real engine** | `pnpm checks` green; acceptance suite green on a production build; engine property tests green; first art files delivered. |
| M4 | **Multiplayer for real** | Two browsers play a match through the real Worker; a hidden opponent is absent from the network snapshot; spike result recorded. |
| M5 | **Real AI behind the adapter** | A player can type a weapon and an arena and play with the result; the shutdown drill passes; rejection and timeout paths work. |
| M6 | **Art and audio wired in** | The game looks and sounds like itself; no manifest key is missing. |
| M7 | **Ship** | Live at `gunsmith.neilarmstrong.dev`; acceptance passes against live; alerts and kill switch armed. |
| M8 | **Case study and polish** | Measured outcomes and lessons are ready for a case study. |

## Blockers and requests

- **engine → play:** local damage/hit events are integrated; play now consumes both. Inventory data was delivered by ship (`6795b56`, integrated `c372d86`). Extend merged bot routing and cross-level engagement/cover.
- **art → play:** approved [inventory](docs/art/concepts/inventory-display/README.md) and [combat feedback](docs/art/concepts/combat-feedback/Handover.md) are ready. Art owns assets/manifests; ship wired the inventory HUD (`c372d86`) and play implements the remaining feedback and HUD behavior.
- **engine ↔ ai:** initial rating/balancing and five-call pipeline are merged. Extend/calibrate rather than restart. Labels v1 and AI-chosen unspecified values are approved; inference probes still need authorization and cumulative spend reconciliation. Preserve deliberate weak weapons.
- **art → ai:** S4 pickup review is complete: lantern passes; fallback body/outline contrast needs a failing acceptance criterion and fix before art re-review. See the S4-1 finding in [HANDOFF.md](HANDOFF.md) and the [approved C2 marker proof](docs/art/concepts/top-down-oddities/pickup-markers/README.md). Redundant review artifacts were removed by user request. Kit generation remains shelved. Fake evals prove the harness only. Reconcile paid spend before any model call; a missing ledger creates no allowance.
- **engine → server:** [arena fairness](docs/art/arena-fairness-research.md), visibility and deterministic contracts support online play. Preserve random ring centres and validate built-ins too. Public-play [fair-play/privacy](docs/art/fair-play-research.md) belongs to server, not the M1 gate.
- **server ↔ budget ↔ ship:** server supplies account/storage/call boundaries; budget owns atomic credit/spend enforcement and tracing; ship provisions approved bindings and deployment automation. No speculative shared contracts or live changes.
- **art → ship:** approved ring-damage WAV wired for local playback; integrated from `worktree-ship` (`c372d86`).
- **art/play:** MP3 is approved and empty click integrated. Safari audio is accepted as good enough by user decision (2026-11-17); its listening follow-up is closed. Combat masking/fatigue and levels await runtime shot synthesis, with existing thresholds and masters preserved.
- Current milestone remains M1. Add menus, shared contracts and future packages only with real consumers. Later workstreams can refine relevant acceptance scenarios while waiting.

## Open questions and tunables

- [ ] Tune movement/vision, health, ring, spawn/arena and power parameters through play; later spectator delay, saved-item limits and rating windows.
- [ ] Choose free versus Workers Paid after real Durable Object and AI CPU measurements.
- [ ] Final name/domain check and case-study publication home.

API imports AI in the Worker; that hosting decision is settled. Keep this queue focused on unfinished work and durable decisions.
