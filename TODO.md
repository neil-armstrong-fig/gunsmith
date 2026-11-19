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
| play | Claude | [TODO-play.md](TODO-play.md) | Weapon and arena selection concept is integrated. The workshop opens (B), takes a prompt, shows a result card from a stand-in and Try it puts the weapon in slot 2; free refills (on opening, and T with the dummy fan at about 3, 6, 9 and 11 tiles) are integrated; Save and the shelf are next, then the pre-round. Recoil and muzzle flash follow the MVP. | 2026-11-19 |
| engine | Claude | [TODO-engine.md](TODO-engine.md) | Fair starts, bot reactions, the built-in arena pool and bounds, and cover for sight and bullets integrated. Inventory data is ship's (`6795b56`). The arena pick rule and `forfeitRound` now live in engine (Server has adopted the forfeit rule). A mutual knockout is now a draw that scores nobody (integrated). A nearly solid arena is now refused (`tooWalled`, floor under 25%; mazes stay legal). A walking-route search now stops at its goal (terraced simulations about twice as fast). Fair starts for online rooms are built (`fairStart`, a seeded matched-distance pair when an arena is not symmetric; `MatchRoom` uses it; awaiting integration). High-ground playtest, reflection, stair-legality diagnostics and second-seat events and sound remain open. | 2026-11-19 |
| ai | Claude | [TODO-ai.md](TODO-ai.md) | Player arena selection and engine validation integrated. AI uses the engine's arena pool and limits and now allows generated cover. A shapes format for arena generation (code draws rectangles into rows) was tried on a local model and fixed its ragged rows; the Haiku comparison and a deep-research session on other approaches wait for later. Evals slice 3 is integrated with nested Vitest scopes and one request per trial. Slice 4 is done: every spec states its own assertions. Prompt refusal reports character limits of 600 for weapons and 1,000 for arenas. S4-1 contrast, model quality and the production adapter remain open. | 2026-11-19 |
| server | Claude | [TODO-server.md](TODO-server.md) | Room reconnect and forfeit are integrated, rooms use the engine's Duel arena and `forfeitRound`, and both generation routes share credit and spend guards and a 30 s time limit. **Sign-in is built** ([sign-in](docs/sign-in.md)): Google PKCE, D1 sessions, `/api/me`, logout, the Origin check; the credit and generation routes read the session and `X-Account-Id` is gone. The user verified the local Google round-trip. Production OAuth configuration and D1 provisioning are pending. `DELETE /api/account` waits on budget's ledger delete; the library, provider cancellation and production adapters remain open. | 2026-11-19 |
| budget | Claude | [TODO-budget.md](TODO-budget.md) | Credit and spend Durable Objects, 50/80/100% email alerts, both generation spend reservations and the read-only `GET /api/credits` route are integrated. Weapon costs re-measured on Haiku 5.5 (2026-11-19, $0.0780, prices hold). `CreditLedger.erase()` for account deletion is delivered (2026-11-19, awaiting integration). Alert address configuration, measured arena costs (needs `ai`'s paid arena tier and the user's cost review) and real token usage remain open. | 2026-11-19 |
| art | Codex | [TODO-art.md](TODO-art.md) | Workshop weapon result card, including the power meter, is integrated. The workshop previews Duel and Fair duel and reveals the full selected result. The preview is ready for later reuse with Play's generated results. S4-1 re-review awaits AI, and combat listening awaits runtime shot synthesis. | 2026-11-19 |
| ship | Codex | [TODO-ship.md](TODO-ship.md) | Fixed the pickup-marker test setup so the equipped SMG clears the sampled area. Production appearance association, hosted CI profiling and deployment remain open. | 2026-11-19 |

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

## MVP integration priorities

Use **hosted private rooms** as the working MVP scope. A player can sign in, make a weapon and an arena in the workshop, try and save them, reload the shelf, and use the saved items in a best-of-three with a second browser. Guests can play practice and private rooms with built-ins. Public matchmaking, ratings, spectators and replay have their own backlog. M1 remains current until the local first-time-player checkpoint is recorded.

1. **Play owns the workshop and first-time-player experience.** Build on the integrated Try it action with Save and the shelf, then the tutorial, before the pre-round UI. Record the M1 playtest with Engine and prioritize the fixes it identifies. Pass parsed generated arena results to the integrated terrain preview. The built-in Duel and Fair duel previews are already available.
2. **Server owns the production generation path.** Sign-in and the account boundary for credits are built (2026-11-19); next are the saved library and its limits. In parallel, AI supplies validated Worker-safe adapters, cancellation and usage, and Budget supplies spend bounds and settlement rules. Use the integrated timeout and spend reservation on both generation routes. Enable the real adapters only after both routes' spend and timeout paths are proven (verified account identity is in place) and the user authorises paid calls. Play owns the browser swap from the stand-in and the credit, rejection, timeout and AI-off states.
3. **Server owns the authoritative room, and Play owns its player-facing flow.** Start the pre-round against built-ins as soon as the room messages have consumers, then add saved items through the same flow. Lock in weapons and arenas, use Engine's seeded arena pick rule, reveal the loadout and start the match. Carry approved appearance and combat cues through the existing rendering and seat-filtered paths. Prove the selected items reach the match in both browsers, hidden opponents stay off the wire and pre-round makes zero model calls.
4. **Ship owns release verification.** Take binding requirements from Server and Budget, prepare the hosted checks and deployment, and run live private-room acceptance after authorization. Budget owns the shutdown drill and alert verification, with Play covering the AI-off UI. The drill must prove that new generation stops and saved items and guest play still work.

The combined spend reservation, settlement and timeout are integrated. Server owns the shared generation routes and Budget owns the estimates and ledgers. See [MVP ownership and handoffs](HANDOFF.md#mvp-ownership-and-handoffs) for the writers and consumers.

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
