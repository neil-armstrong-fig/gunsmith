# Cost, budget and the kill switch

The most important fact: **Cloudflare has no hard billing cap.** Budget alerts are informational and email only; they do not
pause or cap usage, and they exclude recurring plan fees. So automatic shutdown has to be built from layers, and each layer
has a known weakness. Owners: `budget` for production AI spend/tracing, `ai` for eval spending, `server` for runtime measurements and `ship` for infrastructure cost/release evidence.

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

1. **Provider hard cap.** A spend limit on the provider key itself, set a
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

- **Free plan:** an over-limit operation fails until 00:00 UTC rather than billing. A Durable
  Object with a running tick loop does not hibernate, so duration (billed in GB-seconds) accrues for the whole match.
  *Estimate, unverified:* at 128 MB, one match-hour is about 450 GB-seconds against the free daily allowance; the spike measures
  the real numbers.
- **Workers AI** (if used for a bake-off): the free allowance is 10,000 Neurons a day, then $0.011 per 1,000; going over on
  the free plan makes operations fail.
- **Durable Objects:** WebSocket traffic is billed at a reduced ratio of messages to requests `(unverified)`; the spike
  measures requests too.

## Spikes and tasks that produce the numbers

- `server`: the free-plan spike (`TODO-server.md`): duration, requests and storage for a 1v1 match at 20 Hz, with
  spectators. Record results here.
- `ai`: the budget arithmetic (`TODO-ai.md`, O1): cost per generation × credits per day = how many generations the $1 a day
  soft cap buys globally; if that is a handful of users, decide what changes (smaller models, caching, fewer credits).
- `ai`: fixed vs variable spend: LangSmith Plus and Workers Paid are subscriptions on top of the $20 model ceiling.
- `budget`: the **shutdown drill**: set a tiny budget, exceed it, confirm calls stop, the banner shows, and the game still plays.

## Results (fill in)

| Measurement | Value | Date |
| ----------- | ----- | ---- |
| DO duration per 1v1 match-minute | | |
| Requests per match | | |
| Cost per weapon generation | **Measured, Haiku 5.5: $0.00036** for a created weapon (moderation plus generation, 2 calls, median 2.7 s), $0.00015 for a rejection (1 call), $0.00032 mean over every request that reached a model; see "Measured on Haiku" below. Estimates: Sonnet 5.5 $0.0116 (cached prefix $0.0082); Haiku 5.5 $0.0007 (cached $0.0005) | 2026-11-14 (measured), 2026-11-12 (estimates) |
| Cost per arena generation | Sonnet 5.5 $0.0242 (cached $0.0208); Haiku 5.5 $0.0013 (cached $0.0011). Estimate | 2026-11-12 |
| Cost per edit | Sonnet 5.5 $0.0128 (cached $0.0094); Haiku 5.5 $0.0007 (cached $0.0006). Estimate | 2026-11-12 |
| Cost per arena choice | **None: no model chooses the arena, the players pick (2026-11-18).** Screening is a moderation call for each arena prompt, as for a weapon, and none for a built-in arena; the arena's own moderation cost is not yet measured. The $0.00014 estimate of 2026-11-12 was for the AI judge, which was dropped | 2026-11-18 |
| Generations per day the soft cap buys | See "Budget arithmetic" below. The $20 month, not the $1 day, is the binding limit | 2026-11-12 |
| Fixed monthly costs (Plus, Paid) | None added by the chosen option 3. Plus ($39 per seat per month with 10,000 base traces included, option 1; price re-checked on langchain.com/pricing 2026-11-18) declined for now, and the user wants the Plus-only features costed and reconsidered once the game works end to end; Workers Paid ($5) only if the real graph's CPU or `build`'s spike needs it. See `docs/ai-hosting.md` | 2026-11-12 |

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

The weapon specs now run on Haiku 5.5 (`ai/src/evals/eval-criteria-mapping/setups/weapon/paid/run/`), and each request's calls are logged with
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

> **Decision (the user, 2026-11-16): the other models were not good enough, so Haiku 5.5 on the user's own Anthropic key stays the model for the drawing, the stats and moderation, for now.**
> Every Workers AI model on the shortlist was run through the real evals (a `cloudflare` eval tier, `ai/AGENTS.md`) and none replaces Haiku:
> Gemma 4 26B-A4B, GLM-4.7 Flash, Qwen3 30B-A3B and `gpt-oss-120b` draw worse (the user judged each sheet; `gpt-oss-120b` is also twice Haiku's cost);
> for stats and moderation Gemma saves about a tenth of a cent per weapon but wrongly rejects ordinary requests, Qwen rejects most of them, and `gpt-oss-20b` fails on Cloudflare's side.
> Measured results and numbers are in the blocks below. **Not tried, and not needed now:** Granite for moderation only, other model families, Anthropic through Cloudflare AI Gateway (BYOK is free and adds no markup; Unified Billing adds a 5% fee on credit purchases; tool use through the gateway is undocumented), and any change to the prompts to suit a weaker model. Revisit when a cheaper model is released or the spend becomes a problem. **The Cloudflare eval tier and its dependency were removed from the code the same day** (the results, sheets and call logs stay in the git-ignored `ai/src/evals/results/`); how it worked is below, so it can be rebuilt.

> **How the removed Workers AI eval tier worked, to rebuild from (removed 2026-11-16; about 25 files and 1,100 lines, 37 mutants killed when it existed).**
> - **Endpoint and client:** `@langchain/openai` 1.8.0 (the newest whose peer range `@langchain/core ^1.3.1` held for core 1.3.4; a devDependency, lint-fenced out of `src/`) as `ChatOpenAI` with `model: "@cf/<author>/<model>"`, `apiKey` the token, `useResponsesApi: false`, `maxRetries: 0`, `configuration.baseURL: https://api.cloudflare.com/client/v4/accounts/<account id>/ai/v1`.
>   The token and account id were `CLOUDFLARE_WORKER_AI_KEY` and `CLOUDFLARE_ACCOUNT_ID` in the git-ignored `ai/.env.local`, loaded by code and never read by the AI session.
> - **One model named per role, no default:** `EVAL_CLOUDFLARE_STATS_MODEL`, `_MODERATION_MODEL`, `_DRAWING_MODEL` (a weapon spec without a drawing model used the canned drawing). Model names were validated as `author/model` so they could not alter the request path.
> - **A `fetch` wrapper in `configuration.fetch`** recorded, per response, the tokens, Cloudflare's own `usage.neurons` (LangChain's token counts drop it), the finish reason and the first 200 characters of a refusal, never the request (so the token could not reach a message). A run wrapper then **failed the run in words on any non-2xx or `finish_reason: length`**, because the pipeline reads a refused or cut-off call as a stand-in or a rejection, which looks like a weak model. It also logged each request's calls and neurons to a JSON Lines file.
> - **Thinking switch (`EVAL_CLOUDFLARE_THINKING=off|low`):** `off` sent `chat_template_kwargs: {enable_thinking: false}` through `modelKwargs` (undocumented for Gemma on Cloudflare's page, but it worked: 4,000 tokens and 229 neurons became 569 and 65), `low` sent `reasoning_effort: "low"`. The default left the open models thinking.
> - **Results files were labelled by model** (`drawings-cloudflare-<model>-<think>-latest.html`) so one model's sheet did not overwrite the next. The cap was the Workers Free plan's 10,000 neurons a day (a call past it fails, shown as HTTP 429), with no ledger; on Workers Paid a ledger would be needed first.
> - **Facts worth keeping:** a raw tool-calling smoke test passed on all six shortlisted models, yet `gpt-oss-20b` returned HTTP 400 `AiError: Internal Server Error` on every real weapon request, and Qwen3 30B-A3B never returned the `appearance` object, so a smoke test proves the endpoint and not the pipeline.

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
| Drawing | `google/gemma-4-26b-a4b-it` | $0.10 / $0.30 | about $0.00047 | **REJECTED for drawing (the user, 2026-11-16, after judging the sheet): no cheaper than Haiku and far worse, see "Measured 2026-11-16" below.** Newest small model, reported to support `json_schema` |
| Drawing | `zai-org/glm-4.7-flash` | $0.06 / $0.40 | about $0.00044 | **REJECTED for drawing (the user judged the sheet, 2026-11-16: "much worse than Haiku"); measured $0.00061 a drawing, the same as Haiku.** The small GLM, MIT licence reported |
| Drawing | `qwen/qwen3-30b-a3b-fp8` | $0.051 / $0.335 | about $0.00037 | **REJECTED for drawing (the user judged the sheet, 2026-11-16: "much worse than Haiku"; 33 of 33 stand-ins, no `appearance` object in any answer, cause never diagnosed).** Cheapest credible; older, so the biggest quality risk |
| Drawing | `openai/gpt-oss-120b` | $0.35 / $0.75 | about $0.0014 | **REJECTED for drawing (the user judged the sheet, 2026-11-16: "rubbish too"; 11 of 12 its own drawings but twice Haiku's cost, $0.00124).** The quality reference: if a bigger open model cannot draw, the small ones will not |
| Stats and moderation | `qwen/qwen3-30b-a3b-fp8` | $0.051 / $0.335 | | close to our local Qwen, which passes the weapon specs 81 of 81 |
| Stats and moderation | `google/gemma-4-26b-a4b-it` | $0.10 / $0.30 | | second opinion |
| Stats and moderation | `openai/gpt-oss-20b` | $0.20 / $0.30 | | reported to support `json_schema` |
| Moderation only | `ibm-granite/granite-4.0-h-micro` | $0.017 / $0.112 | | tiny; may not do tool calls |

Reasoning models (`gpt-oss`) can spend many hidden output tokens, which would raise these estimates: measure, do not trust the table.

**Measured 2026-11-16: Gemma 4 26B-A4B drawing on Workers AI (first model of the benchmark; the user judges the sheet, `ai/src/evals/results/drawings-cloudflare-gemma-4-26b-a4b-it-think-off-latest.html`).**
Smoke test first (raw requests, six shortlisted models): every one answered a forced tool call (HTTP 200, one tool call, 0.7 to 9.4 neurons for a tiny request), so none was dropped.
**Thinking is the cost.** Left on, Gemma wrote 4,000 completion tokens and was cut off at the cap (229 neurons for one drawing, about $0.0025, four times Haiku's $0.00061); with
`EVAL_CLOUDFLARE_THINKING=off` (`chat_template_kwargs: {enable_thinking: false}`, undocumented on Cloudflare's model page but it works) the same drawing took 569 tokens and 65 neurons. The spec at 3 trials, thinking off:
28 drawings scored (3 requests, the cactus, the jellyfish lantern and the excessive-detail one, ran past the 4,000-token cap and were reported as failed runs, not as stand-ins), **3 valid first time, 8 completed, 6 repaired, 11 stand-ins**
(Haiku: 33 of 36 valid first time, 2 stand-ins), 1.65 calls a drawing (Haiku 1.08), **59.6 neurons a drawing, about $0.00066 (Haiku $0.00061: no cheaper)**, 756 output tokens a call, median 20 s a drawing (Haiku about 6 s end to end), 1,848 neurons for the whole run
of the free 10,000 a day. **The user judged the sheet (2026-11-16): "for sure worse", so Gemma 4 26B-A4B is marked a bad option and not a Haiku replacement for the drawing.** **So Gemma is neither cheaper nor close in quality: the finding above (only the small models undercut Haiku, if good enough) is not met by this one.** Not yet run: `gpt-oss-120b` for the drawing (see the next block), then stats and moderation.

**Measured 2026-11-16, the next two (same spec, thinking off, 3 trials, free plan; each run used about 1,600 to 1,900 neurons of the day's 10,000).**

| Drawing model | Scored | Valid first time | Completed | Repaired | Stand-ins | Calls a drawing | Neurons a drawing | Median per call |
| ------------- | ------ | ---------------- | --------- | -------- | --------- | --------------- | ----------------- | --------------- |
| Haiku 5.5 (baseline) | 36 | 33 | 1 | | 2 | 1.08 | about $0.00061 | about 6 s end to end |
| Gemma 4 26B-A4B | 28 | 3 | 8 | 6 | 11 | 1.65 | 59.6, about $0.00066 | 11.8 s, 39 tokens/s |
| GLM-4.7 Flash | 33 | 14 | 2 | 7 | 10 | 1.53 | 55.5, about $0.00061 | 14.9 s, 33 tokens/s |
| Qwen3 30B-A3B | 33 | 0 | 0 | 0 | **33** | 2.00 | 46.5, about $0.00051 | 3.1 s, 136 tokens/s |

**GLM-4.7 Flash** is the best of the open models and still not a replacement: 14 of 33 valid first time against Haiku's 33 of 36, 10 stand-ins against 2, and **the same cost as Haiku** ($0.00061), so no saving for a worse drawing. One answer was cut off at the cap and failed its run in words.
**Qwen3 30B-A3B's 33 of 33 stand-ins is one systematic fault, not a verdict on its drawing:** every first answer and every repair fails with `appearance: Invalid input: expected object, received undefined`, so the model never returned the `appearance` object the tool asks for (a tool-call format or schema mismatch through the endpoint, or the model ignoring the schema). It looks fast (3 s a call, 136 tokens/s) because its answers are short and wrong, which is also why its cost per drawing is lowest. **Do not read its numbers as a quality or speed result until a raw answer has been looked at** (a few neurons; not done). `gpt-oss-120b` is not run: it costs about three times as much a token, so a full spec will not fit in what is left of today's free neurons; run it after the next 00:00 UTC (it was then run at 1 trial the same evening, below).

**Measured 2026-11-16, the quality reference: `gpt-oss-120b` (reasoning effort low, 1 trial, so noisy).** 12 drawings scored: **0 valid first time, 8 completed (code filled what the model left out), 3 repaired, 1 stand-in**, so 11 of 12 are the model's own drawing, far better than Gemma, GLM or Qwen. 1.33 calls a drawing, median 6.0 s a call, 651 output tokens a call, **112.6 neurons a drawing, about $0.00124: twice Haiku's $0.00061**. Nothing was cut off or refused. Its sheet is `ai/src/evals/results/drawings-cloudflare-gpt-oss-120b-think-low-latest.html`; **the user judged it "rubbish too" (2026-11-16)**, so no open model on the shortlist replaces Haiku for the drawing and that comparison is closed.

**Measured 2026-11-16: stats and moderation on Workers AI (the weapon specs, 81 criteria, 1 trial, the drawing stubbed with the canned one; each model plays both roles).** Compared with Haiku's 80 of 81 (the one red is the open "big magazine" finding) at about $0.00029 a request (the 2026-11-14 baseline: $0.018 for 63 requests).

| Model (both roles) | Criteria passed | Neurons a request | About a request | Median per call | What went wrong |
| ------------------ | --------------- | ----------------- | --------------- | --------------- | --------------- |
| Gemma 4 26B-A4B (thinking off) | 75 of 81 | 15.6 (24 requests, 54 calls) | $0.00017 | 1.8 s | two legitimate requests rejected (French, a single word); one off-topic request with weapon words accepted (4 calls); two balancing criteria (one is Haiku's own "big magazine" finding) |
| Qwen3 30B-A3B (thinking off) | 67 of 81 | 3.5 | $0.00004 | 0.5 s | **11 legitimate requests rejected and 14 criteria red**; the same fault as its drawings (a malformed reply makes moderation fail closed), so its low cost is the cost of answering nothing useful |
| `gpt-oss-20b` | not scored (8 of 81 ran) | | | | **Cloudflare answered every weapon request with HTTP 400 `AiError: Internal Server Error`**, with thinking low and with the default; its raw smoke test (a tiny forced tool call) had passed. Not fixable from our side; treat as unsupported for this request on this endpoint |

**What it means.** Gemma is about 40% cheaper a request than Haiku on stats and moderation, which is about $0.0001 saved on a weapon whose all-in cost is $0.00105 (roughly 10%), and the price is a moderation that wrongly turns away ordinary requests (a French one, a one-word one) and lets one trick through. A rejected legitimate request costs the player half a credit and their trust, and the saving is a tenth of a cent per thousand weapons, so **it is not worth switching: stats and moderation stay on Haiku.** Not run: Granite 4.0 H Micro for moderation only (the cheapest of all, $0.017 / $0.112 per million), `gpt-oss-120b` for stats, and 3 trials of Gemma; none is likely to change the answer, because moderation is where the open models fail and it is the smaller part of the cost.
 **So the one open model that can draw costs about twice Haiku, and the cheap ones cannot draw: on Cloudflare there is no cheaper replacement for Haiku's drawing in this shortlist.** Not run: stats and moderation on the open models (their saving is at most about $0.0002 to $0.0004 of a weapon, so they matter less), and `gpt-oss-120b` at 3 trials.
 The 3,000 Haiku drawing cap and Cloudflare's 4,000 differ; the three over-long requests are the ones whose geometry runs long on any model.
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

## Acceptance scenarios (working draft, `budget`, 2026-11-17)

**Working scenarios, not a frozen M2 contract.** No credit, ledger or kill-switch code exists yet, and `api/` does not; the numbers below are
the targets table above, not code. They are written in `given` / `when` / `then` nesting so they port into the acceptance mapping once `api/`
exists; freezing them waits for `server` and `ai` to review them. Each names the rule it comes from. A scenario that needs a model call runs
against the fake AI adapter, never a paid one.

- **given a player with 1 credit**
  - **when two generation requests arrive at the same moment** then exactly one reserves its credit and runs; the other is refused with no model call and the balance never goes below 0 (layer 4, atomic decrement).
  - **when a request times out after reserving** then the credit is refunded exactly once; **when the refund is retried** then it is a no-op (layer 4, refund on timeout).
  - **when a generation request, weapon or arena, runs past the pipeline time limit** then the player is answered 504 `generation-timed-out`, the credit is refunded exactly once, and the global spend reservation is **settled at its whole worst case, not refunded and not settled at zero** (the model call is not cancelled, so its calls may still be billed; the reservation already covers the worst case, so the caps cannot be overshot); **when the call then finishes late** then nothing more is settled or refunded (layer 3, layer 4, layer 6).
- **given a player with 10 credits**
  - **when a weapon, an arena or an edit is created** then 1 credit is taken; **when a prompt is rejected** then 0.5 is taken; **when a saved item is reused** then nothing is taken (credit prices).
  - **when a prompt is over the limit (weapon 150 tokens, arena 250)** then it is rejected before any model call and charges nothing (prompt limits, layer 6).
  - **when 00:00 UTC passes** then the balance is 10 again, whatever was spent the day before (credits per player).
- **given today's global spend is just under $1**
  - **when a request's estimated cost would cross it** then AI is off until 00:00 UTC and the banner says so (daily soft cap).
- **given this month's global spend is just under $20**
  - **when a request's estimated cost would cross it** then AI is off until the first of the next month, 00:00 UTC, and the banner says that, not the daily time (monthly hard cap; the early stop is accepted).
  - **when many requests arrive at once** then the total reserved never exceeds the ceiling: each reserves its estimated cost before its call and is reconciled to the provider's reported usage after (layer 3; this is what covers the Gateway's eventual consistency, layer 2).
- **given AI is off, for either cap**
  - **when the API and the UI each ask whether AI is on** then both read the one kill-switch function and agree (layer 3).
  - **when a player or a guest starts a match** then built-in weapons and arenas, the saved library and guest play all work as before, and no model call is made (AI off, game stays up).
- **given tracing is failing or returning 429**
  - **when a generation runs** then it neither fails nor waits on the trace, and play is not delayed (tracing, `TODO-budget.md`).
- **given the month's spend rises past 50, 80 and 100 percent** then each threshold's alert is emailed once (layer 5, `SpendLedger.alarm()`); an alert whose email fails is retried and stays due until it is delivered. The 100 percent alert is due as soon as a request is refused for crossing the monthly cap, because that request is never reserved and the spend stops a little short of $20.

**Decided (the user, 2026-11-17): the credit ledger and the spend counters live in Durable Objects, not D1.** A `CreditLedger` object per
account (named by the internal account id) holds the balance and reservations; one `SpendLedger` singleton holds the daily and monthly
counters, the kill-switch flag and the alert thresholds. D1 stays for accounts, sessions, library, ratings and history.
- **Why:** an object runs one request at a time, so a synchronous reserve with no `await` between its read and its write cannot interleave
  (D1 has no `BEGIN`/`COMMIT`, so each rule would have to be one conditional statement); the 00:00 UTC and first-of-month resets happen when
  the next call arrives, so no cron Worker is needed (an `alarm()` pushes the alerts out, below); and it needs no new
  dependency or provisioning (same pattern as `MATCHES`). The free-plan SQL
  quotas are the same for both (100,000 rows written and 5,000,000 read a day), so they do not decide it.
- **The cost:** the ledger is split from the account tables, so account deletion and export must also call the account's object, and a
  report across all users needs a fan-out or a summary kept elsewhere.
- **Not proved by the unit tests:** the ledger classes (`api/src/durable-objects/credit-ledger/account/CreditAccount.ts`, `api/src/durable-objects/spend-ledger/meter/SpendMeter.ts`) are plain
  and synchronous and run in node; atomicity is the Durable Object's own serial guarantee. It was checked once, on 2026-11-17, by running
  the real `CreditLedger` and `SpendLedger` under `wrangler dev` behind a throwaway probe Worker (not in the repo, so not repeatable from
  it) and firing concurrent requests: 50 parallel reserves on a fresh account gave exactly 10 reserved; two requests for the last credit
  gave one; 30 parallel retries of one key charged once; 30 parallel refunds of one request refunded once; 30 parallel $0.10 spend
  reserves gave 10 reserved and then AI off until 00:00 UTC. A repeatable version needs the generation route (`server`).

**Alert delivery (budget, 2026-11-18).** `SpendMeter.alertsDue()` lists the 50/80/100 percent alerts the month has reached and not had marked
sent; `markAlertSent` records one. **100 percent is reached when a request is refused for crossing the monthly cap**, not only when spend
equals the cap: a refused request is never reserved, so spend stops short of the cap and would otherwise never send the one alert that says
AI is off (its email then says "used the monthly budget", not "reached 100%"). A spend that makes an alert due schedules the object's
`alarm()` after its own change is saved; the alarm emails each due alert in turn through the `ALERT_MAIL` `send_email` binding (Email
Routing, as the personal site's contact Worker does: sender `ALERT_FROM_ADDRESS`, recipient the `ALERT_TO_ADDRESS` secret) and marks it sent
only after its email has gone (`sendDueAlerts`). A failed send throws, the runtime retries the alarm, and the alert stays due, so delivery
is at least once. **Known gap:** if the runtime gives up retrying after AI is already off, the alert is sent only when a later `reserve` or
`settle` schedules the alarm again (`status()` does not), which may be a while; the next month's first spend starts afresh. Unset
`ALERT_TO_ADDRESS` and nothing is scheduled or sent. Checked under `wrangler dev` in local mode, which writes each email to a file and sends
nothing, with the monthly cap temporarily $1 behind a throwaway probe Worker (not in the repo): the first run sent the 50, 80 and 100 percent
emails once each as spend reached exactly $1.00; the second, after the review below, spent $0.80 and then had a $0.30 request refused, and
sent 50, 80 and the 100 percent email (spend $0.80) once each. The retry path and a real delivery are not checked: a real send needs the
deploy and the secret (manual step 20).

**Global spend on the weapon route (budget, 2026-11-19).** The route reserves `WEAPON_SPEND.reservedMicrodollars` (3,000 µ$, about three times the measured $0.00105 for a drawn weapon and above five calls at the per-call price) after the credit and before the pipeline; a `paused` answer refunds the credit and returns 503 `ai-off` with the time AI returns. It settles at `modelCalls` times `perCallMicrodollars` (400 µ$: measured about $0.00034 a call on Haiku 5.5, rounded up), or the whole reservation if the pipeline threw. Both numbers are tunables in `api/src/durable-objects/spend-ledger/estimate/weapon/WeaponSpend.ts`. **Known limit:** `WeaponOutcome` carries `modelCalls` but not the stats stage's tokens (only the drawing's `usage`), so the settled figure is an estimate and the Console is the bill; the fix is for `ai` to sum real `usage` onto `WeaponOutcome` (asked in HANDOFF), after which settle should use it. Repeatable now (node, fake ledgers around the real `CreditAccount` and `SpendMeter`): five requests arriving together with room under the daily cap for two let exactly two run and refund the other three; properties hold the spend at what the requests that ran came to, never over the cap, with no reservation held. Atomicity itself is still the Durable Object's guarantee (the one-off `wrangler dev` probe above).

**The balance and price read (budget, 2026-11-19).** `GET /api/credits` with `X-Account-Id` answers `{balance, dailyAllowance, prices: {weapon, rejected}, aiOn, returnsAt?}` for the selection panel ("7 of 10 today", "1 credit", the AI-off banner). The numbers come from `CREDIT_PRICES` and `DAILY_CREDITS`, so they cannot drift from what the routes charge; a new UTC day shows the full allowance. Only a read: it reserves, settles and refunds nothing and calls no model. 405 `Allow: GET`, 401 `account-required`; the account id is the same unauthenticated stand-in as the generation routes, so it shows anyone's balance until sign-in lands. Code: `api/src/router/routes/credits/`.

**Global spend on the arena route (budget, 2026-11-19).** The route now does what the weapon route does: it reserves `ARENA_SPEND.reservedMicrodollars` (2,500 µ$) after the credit and before the pipeline (`paused` refunds the credit and answers 503 `ai-off` with `returnsAt`), then settles at the calls the outcome made, or at the whole reservation if the pipeline threw. An arena's calls are not alike, so each is priced by its place in `ArenaOutcome.modelCalls`: the first is moderation at 150 µ$ (the measured Haiku weapon rejection, whose prompt is the same shape), the second the generation at 1,000 µ$ (**an estimate, not measured:** 2,250 in and 1,500 out at Haiku 5.5 is about $0.00098) and the third the one repair at 1,150 µ$ (an estimate: it re-sends the generation and about 300 tokens of faults, about 4,000 in and 1,500 out). A rejection settles at 150, an arena at 1,150, a repaired one or a built-in arena after a failed repair at 2,300; the reserve covers that worst case with margin, and a test settles `mostCalls` through `settledArenaSpend` itself so the two cannot drift apart. **A built-in arena settles its spend though its credit goes back:** the model was billed for the calls that failed. Tunables in `api/src/durable-objects/spend-ledger/estimate/arena/ArenaSpend.ts`. **Known limits:** no model call was made to measure arenas (that needs your authorisation), so the generation and repair prices are the cost doc's assumptions, and all three must be re-tuned if the arena bake-off picks Sonnet (about twenty times dearer); and `ArenaOutcome` reports calls, not tokens, so settle is an estimate as for weapons. Repeatable now, as for weapons: five requests arriving together with room for two let exactly two run and refund the other three, and the properties hold spend at what the requests that ran came to (calls varied: an arena in two or, after a repair, three; a built-in arena in two or three), never over the cap. Code: `api/src/router/routes/arenas/`.

**A timeout settles like a throw (budget, 2026-11-19).** Server's pipeline time limit (`routes/shared/time-limit/`, 30 s) stops the route waiting, not the model call (`@gunsmith/ai` takes no abort signal), so the calls of a request that ran out of time may still be billed. Both routes therefore treat a timeout as a throw: the credit is refunded, the whole spend reservation (`WEAPON_SPEND` or `ARENA_SPEND.reservedMicrodollars`) is settled as spent, and only the answer differs (504 `generation-timed-out`, not 502 `generation-failed`). Server's first version of the time limit was written before the arena route reserved spend; when the two meet, the arena's catch must do all three steps, which a timeout test per route pins (a hanging pipeline: credit back once, spend equal to the reservation, 504). Until `ai` takes an abort signal the worst case is a late bill on a request the player already saw fail, which the caps absorb.

**Still open:** server's time limit is built but not yet integrated, so the timeout test per route waits on it; real token usage in the settle for both routes (`ai`); measuring an arena's real cost once a paid run is authorised.
`ai`'s eval `paidSpendGuard` and its $1 total ledger are separate and untouched.

## Sources

- [Cloudflare budget alerts](https://developers.cloudflare.com/billing/manage/budget-alerts/) (informational, email only)
- [AI Gateway spend limits](https://developers.cloudflare.com/ai-gateway/features/spend-limits/index.md)
- [Workers AI pricing](https://developers.cloudflare.com/workers-ai/platform/pricing/)
- [Durable Objects WebSocket best practices](https://developers.cloudflare.com/durable-objects/best-practices/websockets)
