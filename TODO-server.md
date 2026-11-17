# TODO: server

Model: **Claude**. Follow the startup protocol in [TODO.md](TODO.md); read only relevant dependencies.

## Resume here

Checkout: develop only in this persona's assigned worktree. At startup, record its actual path/branch and last merged committed main revision here; these are not yet assigned by the workflow update. Sync main into the clean worktree before new work and delivery; main is for integration/validation only. Preserve existing unfinished legacy worktrees. See [Operations](docs/agent-reference/Operations.md#development-worktrees-and-the-integration-checkout).

Prepare the first two-browser authoritative-match acceptance slice after M1 readiness; scaffold the API only when that consumer exists.

Current milestone: M4; the project remains on M1. Next failing test/check: Two browsers complete a match; hidden opponents/effects are absent from snapshots and sound carries direction only.

## Ownership

api/ application/auth/match/persistence domains except budget-owned AI operations; browser networking/prediction, wire contracts and network acceptance tests.

Reserve concrete files in [HANDOFF.md](HANDOFF.md) before overlapping another session. Shared contracts change there first; the domain owner writes the change and consumers review it.

## Dependencies/handoffs

Wait for M1 and engine consumers. Independently review [netcode](docs/match-netcode.md) and identify the first acceptance scenario. Coordinate DB migrations with budget and bindings with ship.

## Current milestone tasks

- [ ] Prepare the first two-browser authoritative-match acceptance slice after M1 readiness; scaffold the API only when that consumer exists.

## Later tasks

- [ ] Scaffold api/ with package instructions and the AI import boundary; add api:dev when implemented. ship owns infra scaffolding; test:properties already exists.
- [ ] One Worker serves assets and `/api/*`; plain runtime edge, `run_worker_first` for API paths. API imports AI in-process.
- [ ] Google OIDC/PKCE, opaque hashed sessions, account/logout/deletion and rate limiting. Public play requires sign-in; guests retain practice/private rooms.
- [ ] D1/Drizzle accounts, sessions, library limits, match history and ratings; Wrangler applies migrations; budget owns atomic credits and supplies its domain schema changes.
- [ ] Match Durable Object: fixed tick, validated input, fog-filtered snapshots, coarse sound directions, reconnect/idle-forfeit and cleanup; client prediction/interpolation (`docs/match-netcode.md`).
- [ ] Private rooms with up to eight delayed spectators; singleton public FIFO matchmaker with a widening rating window.
- [ ] Measure real Durable Object and AI CPU costs before choosing free versus Workers Paid. Add network/privacy, reconnect, spectator and pairing acceptance specs.
- [ ] Implement the [fair-play/privacy handover](docs/art/fair-play-research.md), including bounded recordings, participant reporting, isolated restricted queues, clean-match recovery/human override and retention/erasure checks. Detection starts in observation mode.

## Verification/latest delivery

Record actual checks, red/mutation evidence and the standards/folder review for the current delivery. Update this resume, the shared status row and a concise handoff at session end.
