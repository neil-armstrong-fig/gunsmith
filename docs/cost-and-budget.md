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
| Cost per weapon generation | **Measured, Haiku 5.5: $0.00036** for a created weapon (moderation plus generation, 2 calls, median 2.7 s), $0.00015 for a rejection (1 call), $0.00032 mean over every request that reached a model; see "Measured on Haiku" below. Estimates: Sonnet 5.5 $0.0116 (cached prefix $0.0082); Haiku 5.5 $0.0007 (cached $0.0005) | 2026-11-14 (measured), 2026-11-12 (estimates) |
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

## Measured on Haiku (2026-11-14, the weapon evals on the paid tier)

The weapon specs now run on Haiku 5.5 (`ai/evals/eval-criteria-mapping/weapon/paid/`), and each request's calls are logged with
tokens, stop reason and latency. One baseline: the 21 `when`s at 3 trials, 63 requests, 101 calls; every call ended in
`tool_use`, none was cut off. Cost is computed from the tokens the model reported at the prices above, so the Console's usage
page is the bill and this is the guard's estimate.

| | Measured |
| - | -------- |
| Input and output tokens per call (mean) | 1,104 in, 138 out (the function-calling schema and prompt are most of the input) |
| Calls per request that reached a model | 1.77 (a rejection 1, a created weapon 2, a repaired one 3: 5 of 57 needed the repair) |
| A created weapon, moderation plus generation | $0.00036, median 2.7 s |
| A rejection, moderation only | $0.00015 |
| The whole 70-criterion suite | about $0.006 at 1 trial, about $0.018 at 3 trials |

Against the estimates above: a created weapon is **about half** the $0.0007 estimated (output is far smaller than the guessed
600 tokens, input larger than guessed). **Caveat: the draft weapon is a name and six numbers.** The real weapon adds the `sound`
block and, if wired in, the appearance (about one extra call and $0.0007 each, `docs/ai-visual-generation.md`), so expect the
final figure to be higher than this and re-measure then. At $0.00036 the $1 daily soft cap buys about 2,800 created weapons, so
for weapons the monthly cap, not the daily one, is the limit; arenas are not measured yet. The eval spend so far is $0.32 of
the $1 total ceiling.

## Measured with the drawing wired in (2026-11-15, Haiku 5.5, the weapon specs at 3 trials)

`generateWeapon` now draws every created weapon with a second model call (the user's call budget: five calls at most, three when
nothing needs repairing). One paid run of the five weapon spec files: 72 requests, 165 calls, every one ended `tool_use`, none cut
off; 48 requests reached a drawing and 24 were turned away (a rejection draws nothing). Cost is computed from the reported tokens
at the prices above; the ledger moved $0.570 to $0.623 (about $0.053 for the run).

| Per created and drawn weapon (48) | Measured |
| - | - |
| Stats stage (moderation, generation, any repair) | $0.00044 (a little above the stats-only $0.00036: 3 of the 48 repaired) |
| Drawing stage (the calls after the stats stage's) | $0.00061, 2,596 tokens in, 693 out |
| **Both together** | **$0.00105, or $1.05 per 1,000 weapons** (estimate from separate runs: $1.06) |
| Calls | 3 for 45 of 48, 4 for 3; never 5 |
| End to end, wall clock | median 5.9 s, mean 6.0 s, max 8.3 s (stats alone: median 2.7 s) |

So the drawing roughly **triples the cost of a created weapon** ($0.00036 to about $0.00105) and more than doubles the wait, as
estimated; $1 buys about 950 drawn weapons rather than 2,800 stats-only ones. Not measured here: arenas, the `sound` block, and a
deliberately hard drawing set (this run's requests are the weapon specs', not the twelve drawing requests). The 3-of-48 four-call
weapons are one repair, of the stats or of the drawing (the log does not say which); the per-call log (`paid-weapon-calls-latest.jsonl`) tags the stage with `statsCalls`.
Nothing was raised: the ceiling is still the $1 total, $0.623 spent.

## Cheaper models for the drawing, stats and moderation: the shortlist (researched 2026-11-15, approved by the user)

**Why.** The user asked whether cheap hosted open models (Qwen, GLM, DeepSeek, Kimi, gpt-oss) could replace Haiku, and noted that stats, moderation and the
drawing can each use a different model (they already can: `generator`, `moderator` and `appearanceGenerator` in `weaponPipelineDependencies`).

**The finding that shapes the benchmark.** Haiku 5.5 is $0.10 in and $0.50 out per million tokens, so a drawing (about 2,600 in, 700 out) is $0.00061 measured.
The big open models cost **more**: by estimate Kimi K2.5 about $0.0037, DeepSeek V4.1 Flash about $0.0016, GLM-5.3 Flash about $0.00074. Only the small ones
undercut Haiku, so the best case is a weapon falling from about $0.00105 to roughly $0.0006 to $0.0007 ($1 buys about 1,600 weapons, up from 950). This is a test of whether a small model is
**good enough**, not of whether Chinese models are cheap. Stats and moderation are $0.00044 of the weapon, so their saving is at most about $0.0002 to $0.0004: drawing first.

**Where.** Cloudflare Workers AI (the platform the game deploys to; prompts stay with a US company; no new provider). One API token limited to Workers AI covers every model below,
through the [OpenAI-compatible endpoint](https://developers.cloudflare.com/workers-ai/configuration/open-ai-compatibility/)
(`https://api.cloudflare.com/client/v4/accounts/{account_id}/ai/v1`, the token as the API key). Its docs do **not** say which models support tool calls or `json_schema`
(only one old model is named), so each model gets a one-call smoke test first. **The Workers Free plan includes 10,000 neurons a day (about $0.11) and fails calls beyond it**, so
it cannot overspend; the models below are not among those that need a paid billing method (DeepSeek V4, GLM-5.x, Kimi K2.6 and K2.7 do). A full drawing spec at 3 trials is 36 drawings, so
the benchmark should fit in the free allowance over a few days. Prices from Cloudflare's [pricing table](https://developers.cloudflare.com/workers-ai/platform/pricing/).

| Role | Model (`@cf/...`) | In / out per M | Est. per drawing | Why |
| ---- | ----------------- | -------------- | ---------------- | --- |
| Drawing | Haiku 5.5 (baseline) | $0.10 / $0.50 | $0.00061 measured | what we have |
| Drawing | `google/gemma-4-26b-a4b-it` | $0.10 / $0.30 | about $0.00047 | newest small model, reported to support `json_schema` |
| Drawing | `zai-org/glm-4.7-flash` | $0.06 / $0.40 | about $0.00044 | the small GLM, MIT licence reported |
| Drawing | `qwen/qwen3-30b-a3b-fp8` | $0.051 / $0.335 | about $0.00037 | cheapest credible; older, so the biggest quality risk |
| Drawing | `openai/gpt-oss-120b` | $0.35 / $0.75 | about $0.0014 | the quality reference: if a bigger open model cannot draw, the small ones will not |
| Stats and moderation | `qwen/qwen3-30b-a3b-fp8` | $0.051 / $0.335 | | close to our local Qwen, which passes the weapon specs 81 of 81 |
| Stats and moderation | `google/gemma-4-26b-a4b-it` | $0.10 / $0.30 | | second opinion |
| Stats and moderation | `openai/gpt-oss-20b` | $0.20 / $0.30 | | reported to support `json_schema` |
| Moderation only | `ibm-granite/granite-4.0-h-micro` | $0.017 / $0.112 | | tiny; may not do tool calls |

Reasoning models (`gpt-oss`) can spend many hidden output tokens, which would raise these estimates: measure, do not trust the table.
**Not shortlisted:** Kimi, DeepSeek V4 and GLM-5.x (1.2 to 6 times Haiku's drawing cost by estimate, and they need paid billing), and Groq for round one
(its free tier is 30 requests a minute, 8,000 tokens a minute and 200,000 tokens a day per model, 1,000 requests a day, serving `gpt-oss-20b`, `gpt-oss-120b` and a preview `qwen3.8-27b` at
$0.075/$0.30, $0.15/$0.60 and $0.80/$4.00 after it; the `gpt-oss` models are already on Cloudflare, and the free numbers conflict between sources, so check the console). Groq is a
reasonable later addition as a free, fast iteration tier, with its own free key and a throttle for its 429s. AI Gateway Unified Billing could route Anthropic and Groq through the
Cloudflare token (prepaid credits, a card, a 5% fee on purchases) but is not worth setting up for this.

**Public benchmarks are no guide here** (researched the same day): no independent leaderboard reports schema compliance, tool calling and cost together for open-weight models; the SVG
benchmarks (SVGenius, VectorGym, VGBench) use old models and none enforce our strict geometry (the common failure here is a shape past the 64 by 64 canvas). Our own specs decide.

## What eval-driven development costs on Haiku alone (estimate, 2026-11-12)

Haiku 5.5 at $0.10 in and $0.50 out per million tokens (the pricing page, fetched 2026-11-12), the token assumptions above
(moderation 500 in and 60 out, generation 1,650 and 600, a repair re-sends the prompt plus the bad output, 20% of created weapons
need one), and nine weapon cases (seven reach generation, one is rejected by moderation, one is stopped by the free pre-check):

| | One 9-case run | With a 3-vote judge later | 10 runs a day | 30 runs a day | $1 buys |
| - | -------------- | ------------------------- | ------------- | ------------- | ------- |
| Haiku 5.5 | about $0.005 | about $0.008 | about $1.40 a month | about $4.20 a month | about 216 runs |
| Sonnet 5.5 (for scale) | about $0.09 | about $0.16 | about $28 a month | about $83 a month | about 11 runs |

Findings: Haiku-only is affordable, roughly half a cent a run, so the local model is for speed and an unmetered loop, not
because money forces it. It is not free at volume: 100 runs a day is about $14 a month, inside the $20 only if the game itself
spends nothing, so the eval spend needs its own ceiling (the user's current one is $1 total) and result caching (a re-run with
the same model, prompt and case is free). An arena suite costs about twice as much a case (bigger prompt and output). The
estimates use guessed token counts; replace them with measured usage once a paid run exists.

## Sources

- [Cloudflare budget alerts](https://developers.cloudflare.com/billing/manage/budget-alerts/) (informational, email only)
- [AI Gateway spend limits](https://developers.cloudflare.com/ai-gateway/features/spend-limits/index.md)
- [Workers AI pricing](https://developers.cloudflare.com/workers-ai/platform/pricing/)
- [Durable Objects WebSocket best practices](https://developers.cloudflare.com/durable-objects/best-practices/websockets)
- janggi `api/AGENTS.md` ("Never enable Workers Paid") and `docs/online-play.md` (free-plan figures, re-checked 2026-10-02)
