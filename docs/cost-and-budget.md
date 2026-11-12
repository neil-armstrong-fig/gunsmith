# Cost, budget and the kill switch

The most important fact: **Cloudflare has no hard billing cap.** Budget alerts are informational and email only; they do not
pause or cap usage, and they exclude recurring plan fees. So automatic shutdown has to be built from layers, and each layer
has a known weakness. Owners: `ai` for the AI spend, `build` for the Durable Object and Worker spend (the spike).

## Targets (all in one config, tunable)

| Item | Value |
| ---- | ----- |
| Global AI ceiling | **$20 a month** |
| Global daily soft cap | **$1 a day** (paused until 00:00 UTC). The $20 month is the hard cap, so the AI may stop early in a month; accepted, tune after launch |
| Alerts | 50%, 80%, 100% of the month |
| Credits per player | 10 a day, reset 00:00 UTC |
| Credit prices | weapon 1, arena 1, edit 1, rejected prompt 0.5, reuse free |
| Prompt limits | weapon 150 tokens, arena 250 (rejected before any model call) |
| Cost posture | Try the **free plan** first; accept **Workers Paid** with budgets and the kill switch if the spike says so |

When the budget is exhausted: **AI off, game stays up.** New generation stops; the banner appears; the game runs on the saved
library and the built-in weapon and arena pool; guests are unaffected.

## The layers

1. **Provider hard cap.** A spend limit on the provider key itself (as the learning repo does with its OpenRouter key), set a
   little above the global ceiling. The only layer that truly cannot be exceeded by our bugs.
2. **AI Gateway spend limits.** Dollar budgets on the gateway: up to 20 rules, rolling or fixed window, scoped by provider,
   model or custom metadata, **split by `user_id`** for a per-user budget. Exceeding returns HTTP 429. *Weakness:* limits are
   eventually consistent (cost is recorded after each request), so a burst can overshoot; costs are best-effort
   estimates, and only models with known pricing are covered. Also use its rate limits and response caching.
3. **In-app kill switch.** A global daily and monthly counter in D1 (or a Durable Object) checked **before every call**,
   incremented with the estimated cost, and a cron Worker that flips a kill-switch flag when a threshold is crossed. The flag
   is read through one function by the API and the UI. *Weakness:* it relies on our estimate; reconcile it against the
   provider's reported usage.
4. **Per-user credits.** The ledger caps what one account can spend (atomic decrement, refund on timeout).
5. **Cloudflare budget alerts.** Email at the thresholds above, as the last line, because they cannot stop anything.
6. **Per-call limits:** `maxTokens`, the token pre-check, `modelCallLimitMiddleware`, one repair attempt, a timeout.

## Cloudflare costs to understand

- **Free plan:** an over-limit operation fails until 00:00 UTC rather than billing (janggi's reason to stay on it). A Durable
  Object with a running tick loop does not hibernate, so duration (billed in GB-seconds) accrues for the whole match.
  *Estimate, unverified:* at 128 MB, one match-hour is about 450 GB-seconds against the free daily allowance; the spike measures
  the real numbers.
- **Workers AI** (if used for a bake-off): the free allowance is 10,000 Neurons a day, then $0.011 per 1,000; going over on
  the free plan makes operations fail.
- **Durable Objects:** WebSocket traffic is billed at a reduced ratio of messages to requests `(unverified)`; the spike
  measures requests too.

## Spikes and tasks that produce the numbers

- `build`: the free-plan spike (`TODO-build.md`, Phase E): duration, requests and storage for a 1v1 match at 20 Hz, with
  spectators. Record results here.
- `ai`: the budget arithmetic (`TODO-ai.md`, O1): cost per generation × credits per day = how many generations the $1 a day
  soft cap buys globally; if that is a handful of users, decide what changes (smaller models, caching, fewer credits).
- `ai`: fixed vs variable spend: LangSmith Plus and Workers Paid are subscriptions on top of the $20 model ceiling.
- `ai`: the **shutdown drill**: set a tiny budget, exceed it, confirm calls stop, the banner shows, and the game still plays.

## Results (fill in)

| Measurement | Value | Date |
| ----------- | ----- | ---- |
| DO duration per 1v1 match-minute | | |
| Requests per match | | |
| Cost per weapon generation | Sonnet 5.5 $0.0116 (cached prefix $0.0082); Haiku 5.5 $0.0007 (cached $0.0005). Estimate | 2026-11-12 |
| Cost per arena generation | Sonnet 5.5 $0.0242 (cached $0.0208); Haiku 5.5 $0.0013 (cached $0.0011). Estimate | 2026-11-12 |
| Cost per edit | Sonnet 5.5 $0.0128 (cached $0.0094); Haiku 5.5 $0.0007 (cached $0.0006). Estimate | 2026-11-12 |
| Cost per arena judgement | Haiku 5.5 $0.00014. Estimate | 2026-11-12 |
| Generations per day the soft cap buys | See "Budget arithmetic" below. The $20 month, not the $1 day, is the binding limit | 2026-11-12 |
| Fixed monthly costs (Plus, Paid) | None added by the chosen option 3. Plus ($39 per seat, option 1) declined for now; Workers Paid ($5) only if the real graph's CPU or `build`'s spike needs it. See `docs/ai-hosting.md` | 2026-11-12 |

## Budget arithmetic (2026-11-12, estimates until the evals measure real tokens)

Prices per million tokens, from the [Anthropic pricing page](https://platform.claude.com/docs/en/about-claude/pricing):
Sonnet 5.5 $2 in and $10 out, cache hit $0.10; Haiku 5.5 $0.10 in and $0.50 out, cache hit $0.01.

Assumptions: a `moderationJudge` call on Haiku 5.5 (500 in, 60 out) before every generation. Weapon: 1,650 in (a 1,500 token
cached prefix of system prompt and schema, plus 150 for the prompt), 600 out. Arena: 2,250 in, 1,500 out. Edit: 2,150 in, 600
out. 20% of generations need the one repair attempt (it re-sends the previous output and about 300 tokens of errors). A "full
player" spends all 10 credits as 5 weapons, 3 arenas and 2 edits. "Cached" assumes every call hits the prompt cache, which is
a best case: the cache lasts 5 minutes, so a quiet game will often miss.

| Generator | Full player a day | Average per credit | Credits a day the $20 month sustains | Full players a day | Casual players (3 credits) |
| --------- | ----------------- | ------------------ | ------------------------------------ | ------------------ | -------------------------- |
| Sonnet 5.5 | $0.156 | $0.0156 | 43 | 4.3 | 14 |
| Sonnet 5.5, cached | $0.122 | $0.0122 | 55 | 5.5 | 18 |
| Haiku 5.5 | $0.009 | $0.0009 | 778 | 78 | 259 |
| Haiku 5.5, cached | $0.007 | $0.0007 | 959 | 96 | 320 |

Findings:

- **Decided by the user, 2026-11-12: keep $1 a day, with the $20 month as a hard cap.** $1 a day for 30 days is $30, so a
  busy month will hit the monthly cap before it ends, and **the AI shuts off early for the rest of the month. That is accepted**;
  tune both numbers after launch. Consequence for the build: the monthly counter and the provider hard cap are the real
  ceiling, the daily counter only paces spend, and the AI-off banner must say when it will return (the first of the month,
  00:00 UTC, for a monthly stop; 00:00 UTC for a daily one).
- **On Sonnet 5.5 the budget buys "a handful" of heavy users (about 4 to 5 a day) or about 14 to 18 casual ones.** That
  triggers the "decide the response before building" clause in `TODO-ai.md`.
- **Response (proposed, `ai`'s call on models):** make **Haiku 5.5 the default generator**, which is about 17 times cheaper per
  credit, and let the bake-off evals (O4) show whether Sonnet 5.5 is worth the difference for arenas only (the harder output).
  Keep the cheap judge. Neither change touches the credit prices.
- **A request for `build`, not an edit:** the credit prices and limits live in `shared/`. If Sonnet stays in the mix, lower
  daily credits or raise prices there. Not needed if Haiku holds up.

## Sources

- [Cloudflare budget alerts](https://developers.cloudflare.com/billing/manage/budget-alerts/) (informational, email only)
- [AI Gateway spend limits](https://developers.cloudflare.com/ai-gateway/features/spend-limits/index.md)
- [Workers AI pricing](https://developers.cloudflare.com/workers-ai/platform/pricing/)
- [Durable Objects WebSocket best practices](https://developers.cloudflare.com/durable-objects/best-practices/websockets)
- janggi `api/AGENTS.md` ("Never enable Workers Paid") and `docs/online-play.md` (free-plan figures, re-checked 2026-10-02)
