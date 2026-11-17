# TODO: budget

Model: **Claude**. Follow the startup protocol in [TODO.md](TODO.md); read only relevant dependencies.

## Resume here

Checkout: worktree `.claude/worktrees/budget`, branch `worktree-budget`, created 2026-11-17 from main `6f6b028` (last merged main: `6f6b028`). Sync main into the clean worktree at the start of every turn; main is for integration/validation only. See [Operations](docs/agent-reference/Operations.md#development-worktrees-and-the-integration-checkout).

Done 2026-11-17: the concurrency/failure scenarios are written as a working draft in [cost-and-budget.md](docs/cost-and-budget.md#acceptance-scenarios-working-draft-budget-2026-11-17); not frozen, awaiting `server` and `ai` review. Still open: define the production accounting slice with server and AI when the API consumer exists; retain existing credit prices and budget ceilings.

Current milestone: M4–M5; the project remains on M1. Next failing test/check: waits on server's `api/` scaffold. Then port the first scenario (two concurrent requests, one credit: exactly one reserves) into an executable spec and watch it fail. Open questions (D1 vs Durable Object counters, where the cost estimator lives) are listed with the scenarios.

## Ownership

Production credits/reservations/refunds, Gateway, kill switch and tracing under api/src/ai/ and their storage/tests; docs/cost-and-budget.md. AI retains eval-run spend guard ownership.

Reserve concrete files in [HANDOFF.md](HANDOFF.md) before overlapping another session. Shared contracts change there first; the domain owner writes the change and consumers review it.

## Dependencies/handoffs

Wait for server account/storage and AI call boundaries. Independently turn [cost requirements](docs/cost-and-budget.md) into concurrency/failure acceptance scenarios. Server integrates common DB migration configuration; ship provisions approved bindings.

## Current milestone tasks

- [ ] Define the production accounting slice with server and AI when the API consumer exists; retain existing credit prices and budget ceilings.

## Later tasks

- [ ] D1 atomic credits through the budget-owned ledger and server storage boundary: generation/edit prices, half-price rejection, daily reset, free reuse and timeout refund as specified in `docs/cost-and-budget.md`.
- [ ] Provider/AI Gateway wiring, per-user caching/rate/spend limits and burst-overshoot protection through atomic in-app reservations. Extend paid validation estimation/cache safeguards without resetting its existing ledger.
- [ ] Provider hard cap, Gateway limits, global daily/monthly counters and cron kill switch; alerts at 50/80/100 percent of the approved monthly budget. The AI-off game must remain playable.
- [ ] Run a controlled shutdown drill once authorized: exceed a tiny budget, prove calls stop, refunds/banner work and built-in play continues.
- [ ] Production trace flush on every path with `ctx.waitUntil(awaitAllCallbacks())`; validate real-key behavior and avoid streaming until verified. Trace failures/429s must not fail or delay play.
- [ ] Prompt/graph/model versions, tokens, cost and random internal account IDs; redact prompt PII and never trace Google identities/display names. Trace without sampling initially; track the free quota, alert at 80 percent and change sampling only at the user's request.
- [ ] Implement CreditLedger and its contract/fake with server and freeze credit configuration only with real consumers; coordinate D1 schema/migration wiring.

## Verification/latest delivery

Record actual checks, red/mutation evidence and the standards/folder review for the current delivery. Update this resume, the shared status row and a concise handoff at session end.
