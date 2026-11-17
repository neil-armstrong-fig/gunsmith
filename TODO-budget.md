# TODO: budget

Model: **Claude**. Follow the startup protocol in [TODO.md](TODO.md); read only relevant dependencies.

## Resume here

Checkout: develop only in this persona's assigned worktree. At startup, record its actual path/branch and last merged committed main revision here; these are not yet assigned by the workflow update. Sync main into the clean worktree before new work and delivery; main is for integration/validation only. Preserve existing unfinished legacy worktrees. See [Operations](docs/agent-reference/Operations.md#development-worktrees-and-the-integration-checkout).

Define the production accounting slice with server and AI when the API consumer exists; retain existing credit prices and budget ceilings.

Current milestone: M4–M5; the project remains on M1. Next failing test/check: Concurrent requests cannot overspend; retries/refunds are idempotent; budget exhaustion stops calls while built-in play continues.

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

2026-11-17 migration: tasks redistributed from the former build/ai/art checklists; no gameplay change. Latest merged validation in HANDOFF.md: root checks, eight property tests and 199 preview acceptance tests passed; fake evals reported 126 passing and eight failing canned-response criteria. This is inherited evidence, not a new run.

At session end, record actual checks, mutation/red evidence where applicable, standards and folder/caller review; update this resume, your TODO.md status row and a concise HANDOFF.md delivery. [Pre-migration snapshot](docs/history/2026-11-17-persona-migration.md).
