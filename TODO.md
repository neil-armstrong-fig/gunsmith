# TODO: the north star path

**FOCUS ON MVP TASKS FIRST**

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
| play | Claude | [TODO-play.md](TODO-play.md) | The workshop (prompt, stand-in Make, result card, Try it, refills, dummy fan, Save and the weapon shelf) is built, and the way into a match now exists locally: **Fight the bot** opens the duel behind a pre-round where a player chooses a weapon for each slot from the built-ins and the shelf, locks in, sees both fighters' weapons and starts; the picks carry into every round, and a weapon taken from the floor replaces the one in hand. Next: the arena choice and pick, then the room's pre-round once server's messages exist (proposal in HANDOFF), then the real generation swap. Recoil and muzzle flash follow the MVP. | 2026-11-20 |
| engine | Claude | [TODO-engine.md](TODO-engine.md) | Fair starts, bot reactions, the built-in arena pool and bounds, and cover for sight and bullets integrated. Inventory data is ship's (`6795b56`). The arena pick rule and `forfeitRound` now live in engine (Server has adopted the forfeit rule). A mutual knockout is now a draw that scores nobody (integrated). A nearly solid arena is now refused (`tooWalled`, floor under 25%; mazes stay legal). A walking-route search now stops at its goal (terraced simulations about twice as fast). Fair starts for online rooms are built (`fairStart`, a seeded matched-distance pair when an arena is not symmetric; `MatchRoom` uses it; committed on `worktree-engine`). High-ground playtest, reflection, stair-legality diagnostics and second-seat events and sound remain open. | 2026-11-19 |
| ai | Claude | [TODO-ai.md](TODO-ai.md) | Player arena selection and engine validation integrated. AI uses the engine's arena pool and limits and now allows generated cover. A shapes format for arena generation (code draws rectangles into rows) was tried on a local model and fixed its ragged rows; on Haiku (3 trials) shapes fell back in 0 of 12 real arena trials against 2 of 12 for rows, so **shapes is the default arena format now** (the user, 2026-11-20); the structured-output study is written and its probe done (`docs/ai-arena-research.md`: Haiku accepts a strict 40 by 30 rows schema and gets every width right, but design faults remain). A research turn that tests a few approaches on Haiku is next. Evals slice 3 is integrated with nested Vitest scopes and one request per trial. Slice 4 is done: every spec states its own assertions. Prompt refusal reports character limits of 600 for weapons and 1,000 for arenas. The paid tier now covers arenas and screening with a staged per-call log and no hidden retries; the first paid arena run measured generation about 5 times cheaper than budget assumed (HANDOFF); the largest arena (40 by 30) costs within budget's worst case but 3 of 4 requests fell back. **2026-11-20 (uncommitted):** a request takes an abort signal, outcomes carry token `usage`, the production adapter is built in `ai/src/adapter/` (not wired into `api/`; server swaps it in on the user's go) and the Haiku drawing failure is fixed by one prompt sentence. S4-1 contrast and large-arena quality remain open. | 2026-11-20 |
| server | Claude | [TODO-server.md](TODO-server.md) | The room's pre-round now chooses weapons and the arena on one step-based wire (built-ins; play's screen and saved items follow). Room reconnect and forfeit are integrated, rooms use the engine's Duel arena and `forfeitRound`, and both generation routes share credit and spend guards and a 30 s time limit. **Sign-in is built** ([sign-in](docs/sign-in.md)): Google PKCE, D1 sessions, `/api/me`, logout, the Origin check; the credit and generation routes read the session and `X-Account-Id` is gone. The user verified the local Google round-trip. **The account library is built:** every created weapon and arena is kept by id and answered with it; `GET/POST /api/library` and `DELETE /api/library/<id>` shelve by id under limits of 8 weapons and 3 arenas (409 `shelf-full`). Production OAuth configuration and D1 provisioning are pending. `DELETE /api/account` is built and keeps a keyed digest and the ledger id for 90 days so deleting does not reset the daily allowance (new secret `ACCOUNT_DIGEST_KEY`; a scheduled sweep is ship's). Provider cancellation and production adapters remain open. **The room pre-round's arena step is built on built-ins** (chosen by id, zero model calls, a lone player has no time limit, 60 s once both have sat, defaults on timeout; transport in `OnlineMatch`); **play builds its screen**, and the weapon steps wait for engine's per-seat loadout and built-in weapon list and for one owner of the parsed weapon and arena shape (HANDOFF). | 2026-11-20 |
| budget | Claude | [TODO-budget.md](TODO-budget.md) | Credit and spend Durable Objects, 50/80/100% email alerts, both generation spend reservations and the read-only `GET /api/credits` route are integrated. Weapon costs re-measured on Haiku 5.5 (2026-11-19, $0.0780, prices hold). `CreditLedger.erase()` for account deletion is on main (`75c2a09`). Alert address configuration, measured arena costs (needs `ai`'s paid arena tier and the user's cost review) and real token usage remain open. | 2026-11-19 |
| art | Codex | [TODO-art.md](TODO-art.md) | MVP audio checklist complete. Damped upright footfalls, reload and fallback shots are wired. Pickup acceptance distinguishes the player's cue from the nearby opponent's spatial cue. Combat mix review follows weapon-specific synthesis. References placement is post-MVP. | 2026-11-20 |
| ship | Codex | [TODO-ship.md](TODO-ship.md) | Simplified the CI stages and kept per-shard reports. The hosted preview timeouts and APT cache timings await verification. The split release is published and locally verified. Live rollout is deferred. | 2026-11-20 |

Select one slice from an active workstream and record concrete reservations and contracts in HANDOFF.md. Each shared file has one writer per slice. The model column records session defaults. The Art checklist records its deliveries and handoffs.


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

1. **Play owns the workshop and first-time-player experience.** Build on the integrated Try it action with the weapon shelf (Save, Iterate, Delete), then the making states and the tutorial, before the pre-round UI. Record the M1 playtest with Engine and prioritize the fixes it identifies. Pass parsed generated arena results to the integrated terrain preview. The built-in Duel and Fair duel previews are already available.
2. **Server owns the production generation path.** Sign-in and the account boundary for credits are built (2026-11-19); next are the saved library and its limits. In parallel, AI supplies validated Worker-safe adapters, cancellation and usage, and Budget supplies spend bounds and settlement rules. Use the integrated timeout and spend reservation on both generation routes. Enable the real adapters only after both routes' spend and timeout paths are proven (verified account identity is in place) and the user authorises paid calls. Play owns the browser swap from the stand-in and the credit, rejection, timeout and AI-off states.
3. **Server owns the authoritative room, and Play owns its player-facing flow.** Start the pre-round against built-ins as soon as the room messages have consumers, then add saved items through the same flow. Lock in weapons and arenas, use Engine's seeded arena pick rule, reveal the loadout and start the match. Carry approved appearance and combat cues through the existing rendering and seat-filtered paths. Prove the selected items reach the match in both browsers, hidden opponents stay off the wire and pre-round makes zero model calls.
4. **Ship owns release verification.** Take binding requirements from Server and Budget, prepare the hosted checks and deployment, and run live private-room acceptance after authorization. Budget owns the shutdown drill and alert verification, with Play covering the AI-off UI. The drill must prove that new generation stops and saved items and guest play still work.

The combined spend reservation, settlement and timeout are integrated. Server owns the shared generation routes and Budget owns the estimates and ledgers. See [MVP ownership and handoffs](HANDOFF.md#mvp-ownership-and-handoffs) for the writers and consumers.

## Blockers and requests

- **engine → play:** local damage/hit events are integrated; play now consumes both. Inventory data was delivered by ship (`6795b56`, integrated `c372d86`). Extend merged bot routing and cross-level engagement/cover.
- **play:** owns authored gameplay assets, manifests, presentation and the remaining combat feedback. Ship wired the inventory HUD (`c372d86`). [Approved inventory](docs/art/concepts/inventory-display/README.md) and [combat feedback](docs/art/concepts/combat-feedback/Handover.md).
- **engine ↔ ai:** initial rating/balancing and five-call pipeline are merged. Extend/calibrate rather than restart. Labels v1 and AI-chosen unspecified values are approved; inference probes still need authorization and cumulative spend reconciliation. Preserve deliberate weak weapons.
- **ai:** the lantern passed the S4 pickup review. AI owns the failing criterion, fix and re-review for fallback body and outline contrast at 64 and 32 px per tile. Kit generation remains shelved. Reconcile paid spend before any model call. [S4-1 finding](HANDOFF.md) and [approved C2 marker proof](docs/art/concepts/top-down-oddities/pickup-markers/README.md).
- **engine → server:** [arena fairness](docs/art/arena-fairness-research.md), visibility and deterministic contracts support online play. Preserve random ring centres and validate built-ins too. Public-play [fair-play/privacy](docs/art/fair-play-research.md) belongs to server, not the M1 gate.
- **server ↔ budget ↔ ship:** server supplies account/storage/call boundaries; budget owns atomic credit/spend enforcement and tracing; ship provisions approved bindings and deployment automation. No speculative shared contracts or live changes.
- **play → ai:** Ship wired the approved ring-damage WAV for local playback (`c372d86`). The approved empty click is integrated and the user accepted Safari audio on 2026-11-17. Play owns combat masking, fatigue and level checks after AI's runtime shot synthesis lands. Keep the existing thresholds and masters.
- Current milestone remains M1. Add menus, shared contracts and future packages only with real consumers. Later workstreams can refine relevant acceptance scenarios while waiting.

## Open questions and tunables

- [ ] Tune movement/vision, health, ring, spawn/arena and power parameters through play; later spectator delay, saved-item limits and rating windows.
- [ ] Choose free versus Workers Paid after real Durable Object and AI CPU measurements.
- [ ] Final name/domain check and case-study publication home.

API imports AI in the Worker; that hosting decision is settled. Keep this queue focused on unfinished work and durable decisions.
