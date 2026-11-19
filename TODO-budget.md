# TODO: budget

Model: **Claude**. Follow the startup protocol in [TODO.md](TODO.md); read only relevant dependencies.

## Resume here

Checkout: worktree `.claude/worktrees/budget`, branch `worktree-budget`, created 2026-11-17 from main `6f6b028` (last merged main: `afc2092`, 2026-11-18, nothing to merge). Sync main into the clean worktree at the start of every turn; main is for integration/validation only. See [Operations](docs/agent-reference/Operations.md#development-worktrees-and-the-integration-checkout).

Checked 2026-11-17 (later turn): main unmoved (`9484ad0`), nothing to merge; ledgers committed (`cb18fdb`) and integrated at `4fa67d7`. Still blocked on server's generation route and account id (server prediction/interpolation is integrated, but has no account/generation route). The user chose to wait on 2026-11-17; on 2026-11-18 they chose alert delivery (below). The other unblocked option stays available: the cost estimator in `api/src/durable-objects/spend-ledger/` (ai's `ModelUsage` tokens at the Haiku prices in cost-and-budget.md).

Decided 2026-11-17 (the user): credits and spend counters live in Durable Objects (`CreditLedger` per account, `SpendLedger` singleton). **Built and committed (`cb18fdb`):** `api/src/durable-objects/credit-ledger/` (`CreditAccount`, prices, daily reset, idempotent reserve/settle/refund), `api/src/durable-objects/spend-ledger/` (`SpendMeter`: $1 a day and $20 a month caps, estimate-then-settle, stop return times, 50/80/100 alerts), thin `CreditLedger`/`SpendLedger` Durable Objects, bindings `CREDITS`/`SPEND` and migration `v2` in `api/wrangler.jsonc`. 44 new unit tests, mutation-proved; the real objects were also checked under `wrangler dev` with concurrent requests (see cost-and-budget.md). server informed and agreed (no collision with its prediction slice; it owns the generation route and the account id).

**Not built, waits on server:** the generation route that wraps the ai pipeline with reserve/settle/refund; the token pre-check, AI-off banner/guest play and trace-failure scenarios; a repeatable concurrency spec in the repo; the cost estimator's home and prices; Gateway, tracing, provider hard cap and the shutdown drill (needs your authorization and ship's bindings).

**Integrated from `b61ca46`: spend alerts are emailed.** The user chose Cloudflare's Email Routing `send_email`, as the personal site's contact Worker does it (sender var `ALERT_FROM_ADDRESS`, recipient secret `ALERT_TO_ADDRESS`, binding `ALERT_MAIL`). `SpendMeter.takeAlerts` became `alertsDue`/`markAlertSent`/`spentThisMonth`; `SpendLedger.alarm()` sends each due alert through `spend-ledger/alerts/SendDueAlerts` and marks it sent only after its email has gone, so a failure is retried (at least once); with no secret set nothing is scheduled. New: `spend-ledger/alerts/` (`SendDueAlerts`, `DeliverAlertEmail` untested edge, `email/BuildAlertEmail`), `spend-ledger/types/AlertEmail.ts`, `SendDueAlertsRequest.ts`. Additive edits to server's files: `ApiEnvironment` (three fields), `wrangler.jsonc` (`send_email`, `vars`), one fake in `HandleApiRequest.test.ts`. The 100 percent alert is due when a request is refused for crossing the monthly cap (spend stops short of the cap; found in review, red test first). Evidence: tests red first; fifteen mutants across the alert code, two survived (daily total read as the month's; any alert due when the cap stops AI), each got a strengthened test and was killed; two local `wrangler dev` runs (spend landing exactly on a $1 test cap, and spend at $0.80 with a refused $0.30 request) sent the 50, 80 and 100 percent emails once each. Not checked: the retry path and a real send (needs the deploy and the secret: `MANUAL-SETUP-STEPS.md` step 20; ship declares the binding in `infra/`).

Done 2026-11-17: the concurrency/failure scenarios are written as a working draft in [cost-and-budget.md](docs/cost-and-budget.md#acceptance-scenarios-working-draft-budget-2026-11-17); not frozen, awaiting `server` and `ai` review. Still open: define the production accounting slice with server and AI when the API consumer exists; retain existing credit prices and budget ceilings.

Current milestone: M4–M5; the project remains on M1. Next failing test/check: waits on server's generation route (or the cost estimator, if the user wants it before then); then a repeatable spec through it (two concurrent requests, one credit: exactly one reserves; budget exhausted: calls stop, built-in play continues), written red first. Open questions (D1 vs Durable Object counters, where the cost estimator lives) are listed with the scenarios.

## Ownership

Production credits/reservations/refunds, Gateway, kill switch and tracing under api/src/durable-objects/credit-ledger/ and spend-ledger/ and their storage/tests; docs/cost-and-budget.md. AI retains eval-run spend guard ownership.

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
