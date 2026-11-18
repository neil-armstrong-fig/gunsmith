# TODO: server

Model: **Claude**. Follow the startup protocol in [TODO.md](TODO.md); read only relevant dependencies.

## Resume here

Checkout: `.claude/worktrees/server`, branch `worktree-server`, created 2026-11-17 from main `6f6b028` (nothing to merge at start). Sync main into the clean worktree before new work and delivery; main is for integration/validation only. See [Operations](docs/agent-reference/Operations.md#development-worktrees-and-the-integration-checkout). My ports: webapp preview 3450 (3400 is the engine worktree's), Worker 8790 (`API_PORT=8790 pnpm api:dev`), `API_URL=http://localhost:8790` for the preview's `/api` proxy. Main merged in 2026-11-17 (merge commit `a543dd1`, main `2d7c568`); Step.ts stays the thin call, main's damage events ported into `engine/src/game-loop/PlayStep.ts`.

**Current slice: online smoothness is built on top of the first online match, whose spec is green.** `TwoBrowsersHidingFromEachOther` (3 criteria, in `acceptance-tests/src/tests/online/`) reads the WebSocket frames each browser was *sent*, so a client that hides a player the server sent would still fail; with the fog filter broken on the live server, only the privacy criterion fails (mutation-proved), and 15 of 15 runs pass. What exists:

- **engine (approved by the engine session):** `stepFighters` (two humans, one shared core `PlayStep`), `seat/` (`VisibleToSeat`, `ViewOfSeat` = the fog filter for a snapshot, `WorldOfSeatView`, `MirrorSeats`).
- **`api/` (new package):** `POST /api/rooms`, `/api/rooms/<code>/socket` to a `Match` Durable Object (`MatchRoom` is its plain state; a clock 30 times a second, playing the 60 Hz steps real time owes), input parsing. See `api/AGENTS.md`. Dependency added with the user's approval: `@cloudflare/workers-types` 5.20260921.1.
- **webapp:** `?room=<code>` (scenario `room`), `online/` (`OnlineMatch`, `ParseServerMessage`, `RoomSocketUrl`), `use-online-match`, and one branch in `UseGameLoop` (play owns that file): it sends the input and shows the server's newest world instead of stepping. `vite.config.ts` proxies `/api` with WebSockets for dev and preview (`API_URL` overrides).
- **acceptance-tests:** `gunsmith.room`, `gunsmith.end()`.

**Wire shape (server's proposal; frame types are written out in `api/` and `webapp/src/online/types/` because `shared/` cannot name the engine's types):** `{kind: "joined", seat, arena}` once, then `{kind: "snapshot", ...SeatView}`; the client sends `{kind: "input", seq, ...Input}`; snapshots also carry `ack {seq, held}`. A hidden fighter is an absent field.

**Online smoothness is integrated (2026-11-17, `6c50101` via `ca5e19a`).** The server now sends 30 snapshots a second (`MATCH_TICK`); the browser predicts its own fighter and blends the other. Wire: each input carries `seq` (the browser's own fixed-step count when it began to hold); each snapshot carries `ack {seq, held}` (`@gunsmith/shared/online/types/InputAck`, moved to `shared/` because `api/` and `webapp/` both use it; the frames themselves stay written out on both sides). The browser sends an input only when it changes (plus a heartbeat about ten times a second), plays it at once (`webapp/src/online/prediction/`), and on each snapshot replays the inputs the server has not reached on top of its word: a disagreement under a tile is eased out over about a fifth of a second, one over a tile is put right at once. The other fighter is drawn about 100 ms behind on a render clock that holds when snapshots are late (`interpolation/`). Shots are not predicted. `?lag=<ms>` holds every frame up each way so the user can feel it on localhost. A click pressed and released between two server ticks is now latched until a step plays it (`MatchRoom`), and a one-shot ask is no longer lost on a tick that owed no step.

**Not built, on purpose:** sign-in, D1/Drizzle, the matchmaker, reconnect and idle forfeit (a seat left after the match begins is lost), spectators, round/match flow in a room (a decided round freezes), rate limiting, recordings, the sound domain (engine). The arena is a copy of the webapp's duel arena. Mutual knockout scores as a loss for the first seat (also in `TODO-engine.md`).

**Next action:** sync newer main when clean. Then, in order: round/match flow in a room (a decided round still freezes), reconnect and idle forfeit, then sign-in/storage for budget, and the generation route that wraps budget's reserve/refund (`env.CREDITS.getByName(accountId)`, `env.SPEND.getByName("spend")`; credits and spend are Durable Objects, not D1, decided by the user 2026-11-17, see the budget session's `HANDOFF.md`). **Known limits:** a disagreement over a tile (a late input at a pillar's corner: one fighter sticks, the other slides) is a visible snap by design; at round end the browser, which does not predict shots, snaps back a latency's worth of walking; the Durable Object CPU measurement for free versus paid needs a real deploy (ship plus the user's authorisation).

Current milestone: M4; the project remains on M1. Next failing test/check: two browsers finish a match through the Worker; sound carries direction only.

## Ownership

api/ application/auth/match/persistence domains except budget-owned AI operations; browser networking/prediction, wire contracts and network acceptance tests.

Reserve concrete files in [HANDOFF.md](HANDOFF.md) before overlapping another session. Shared contracts change there first; the domain owner writes the change and consumers review it.

## Dependencies/handoffs

**Tell the user when these land on main, so they can restart budget** (request from the budget session, 2026-11-17; scenarios in `docs/cost-and-budget.md` on branch `worktree-budget`): (1) an `api/` package on main with its `AGENTS.md`, `@gunsmith/ai` in `allowedPackages` and a test setup; (2) the storage choice for credit/spend counters recorded and bound (D1/Drizzle with migration config, or a Durable Object); (3) a stable internal account id (a stub is enough) and the route/handler that calls the ai pipeline, where budget's reserve/refund wraps it. A minimal `api/` with just these unblocks budget before the full auth and match slices; consider scaffolding it in that order.

Wait for M1 and engine consumers. Independently review [netcode](docs/match-netcode.md) and identify the first acceptance scenario. Coordinate DB migrations with budget and bindings with ship.

## Current milestone tasks

- [x] Review [netcode](docs/match-netcode.md) against the engine and choose the first scenario: done 2026-11-17 (review notes in that doc), spec written red.
- [x] Make `TwoBrowsersHidingFromEachOther` green: engine's two-fighter `step`/per-seat view, the minimal `api/` and the webapp's online client. Done 2026-11-17.
- [x] Online smoothness: prediction, reconciliation, interpolation, input on change, 30 Hz. Done 2026-11-17: specs `MovingWithoutWaitingForTheServer`, `NoJumpsWhenTheServerCorrectsThePlayer`, `TheOtherPlayerMovingSmoothly` (`tests/online/`), unit tests, and fast-check property tests (`webapp/src/online/property-tests/`, `api/src/match/property-tests/`; `pnpm test:properties`). Still open: measure Durable Object CPU and duration for the free-versus-paid choice (needs a deploy).
- [ ] Online has no combat feedback: the online path never steps the engine, so no `World.events` reach play's feedback store (`recordFeedbackCues`, `store/feedback/`) or `sounds.afterTick`, and no damage marks or hit crunch show. When online needs it, the server must send the events (to the seat they happened to) and the online branch must feed them to both, as the local loop does. Agreed with play 2026-11-17: play adds one `recordFeedbackCues` line to the local loop only, and messages me before touching `UseGameLoop.ts` again; expect a small merge of that file when play's slice 2b and main (20 commits ahead) land.
- [ ] Next criteria: two browsers finish a round and agree on the score (round/match flow in a room); reconnect and idle forfeit; sound direction only (needs engine).

## Later tasks

- [x] Scaffold api/ with package instructions and the AI import boundary; api:dev exists (2026-11-17). Still open: ship owns infra scaffolding.
- [ ] One Worker serves assets and `/api/*`; plain runtime edge, `run_worker_first` for API paths. API imports AI in-process.
- [ ] Google OIDC/PKCE, opaque hashed sessions, account/logout/deletion and rate limiting. Public play requires sign-in; guests retain practice/private rooms.
- [ ] D1/Drizzle accounts, sessions, library limits, match history and ratings; Wrangler applies migrations; budget owns atomic credits and supplies its domain schema changes.
- [ ] Match Durable Object: fixed tick, validated input, fog-filtered snapshots, coarse sound directions, reconnect/idle-forfeit and cleanup; client prediction/interpolation (`docs/match-netcode.md`).
- [ ] Private rooms with up to eight delayed spectators; singleton public FIFO matchmaker with a widening rating window.
- [ ] Measure real Durable Object and AI CPU costs before choosing free versus Workers Paid. Add network/privacy, reconnect, spectator and pairing acceptance specs.
- [ ] Implement the [fair-play/privacy handover](docs/art/fair-play-research.md), including bounded recordings, participant reporting, isolated restricted queues, clean-match recovery/human override and retention/erasure checks. Detection starts in observation mode.

## Verification/latest delivery

Record actual checks, red/mutation evidence and the standards/folder review for the current delivery. Update this resume, the shared status row and a concise handoff at session end.
