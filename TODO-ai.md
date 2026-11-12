# TODO: ai (Session 2, the AI, Claude Code with LangChain, LangGraph and LangSmith)

Your checklist. The shared path is `TODO.md`; read it and `TODO-build.md` and `TODO-art.md` first, every fresh session
(the sync protocol is at the top of `TODO.md`). Decisions behind every item are in `docs/ai-pipeline.md`,
`docs/ai-hosting.md`, `docs/cost-and-budget.md` and `docs/privacy-and-data.md`.

**What you are waiting for from `build`:** the contracts in `HANDOFF.md` (weapon and arena schemas, `AiAdapter`,
`CreditLedger`, the power rating and arena validator). The fake adapter means you never block the game and the game never
waits on you. **O1 needs nothing from `build` and can start immediately.**

**What the others need from you:** a decision on where the pipeline runs (it decides whether `api/` imports `ai/`), the
kill-switch flag's shape, and a review of the contracts before they freeze (Milestone M2).

## O1: decide where the pipeline runs, costed and validated. Milestone M1

- [ ] Compare, with a tiny proof of one node graph for (1) and (2): (1) a LangGraph server on LangSmith Deployment,
      (2) a self-hosted LangGraph server on Cloudflare Containers, (3) inside the Worker with LangChain.js. The user favours
      (1) and (2) and expects (3) not to work in practice. Criteria: monthly cost, free-tier fit, licensing (unverified for a
      self-hosted server), cold starts, CPU and time limits, checkpointer, tracing flush, Studio, local dev, and how the
      Worker gateway calls it. Write the decision in `docs/ai-hosting.md`.
      *Desk comparison written (provisional, option 1). The local one-node proof waits until `build`'s initial work is done and
      the user has committed it; the user has approved installing the proof's dependencies then, here or in a worktree. Real
      deploys of options 1 and 2 still need the user's approval of Plus and Workers Paid.*
- [x] **Fixed vs variable spend:** the $20 a month ceiling is model spend; LangSmith Plus (if hosted needs it) and Workers Paid
      are fixed subscriptions on top. Check current prices. *Done 2026-11-12: Plus $39 a seat, Paid $5; `docs/ai-hosting.md`.*
- [x] **Containers vs the free plan:** do Cloudflare Containers need Workers Paid? If so, option 2 forces Workers Paid; tell
      the user and `build`. *Done: yes, it does; blocker line in `TODO.md`.*
- [x] **Budget arithmetic:** cost per generation × credits per day = how many generations the $1 a day soft cap buys globally.
      If that is a handful of users, decide the response (smaller models, caching, a lower credit price) before building.
      *Done as estimates: Sonnet buys a handful of heavy users, so Haiku 5.5 is the proposed default generator; see
      `docs/cost-and-budget.md`. Re-run with measured tokens once evals exist.*
- [ ] Settle whether `api/` imports `ai/` or calls it over HTTP; update the table in `AGENTS.md` and `HANDOFF.md`.
      *Provisional: HTTP under option 1, recorded in both; the table itself waits for the user's approval.*

## Review the contracts. Milestone M2

- [ ] When `build` marks the first four rows of "What is ready" in `HANDOFF.md`, review the schemas, `AiAdapter`,
      `CreditLedger` and credit config. Ask for changes now; record your sign-off in the delivery log.

## O2: the pipeline (a deterministic LangGraph `StateGraph`, not a free agent). Milestones M3 to M5

- [ ] Nodes: `tokenPrecheck` → `moderationJudge` (cheap model) → `generate` (structured output) → `validate` (zod) →
      `repair` (one attempt) → `rate` (the engine's power rating and caps) → `commit`. See `docs/ai-pipeline.md`.
- [ ] Weapon and arena generators against the shared schemas (`withStructuredOutput` or `responseFormat`); model output is
      `unknown` until parsed. Include the `sound` block with hard limits.
- [ ] Arena judge: picks between two prompts, randomised order, structured verdict, tie-break rule; handles one or zero
      submissions; the built-in arena pool.
- [ ] Edit-from-base: a saved weapon or arena plus a changed prompt, charged as a new generation.
- [ ] Injection hardening: player text in delimited data blocks, never instructions; the judge sees prompts only.
- [ ] Model choice in code (not in the environment): a cheap model for judging, a stronger one for generating, a fallback
      (`modelFallbackMiddleware`). Provider: Anthropic through Cloudflare AI Gateway; Workers AI as a bake-off candidate.
- [ ] `modelCallLimitMiddleware` and `toolCallLimitMiddleware` as backstops even though the graph is fixed.
- [ ] The real `AiAdapter` implementation behind the same interface the fake uses; tell `build` it is ready to swap in.

## O3: cost and token control. Milestones M4 and M5

- [ ] Token pre-check before any model call (weapons 150 tokens, arena 250, tunable); output capped with `maxTokens`. A
      rejection costs half a credit.
- [ ] Credits in D1 with an atomic decrement (with `build`'s ledger): weapon 1, arena 1, edit 1, rejection 0.5, reuse free,
      10 a day, reset at 00:00 UTC. Refund on a generation timeout.
- [ ] AI Gateway in front of the provider: caching, rate limit, **spend limit split by user id** (eventually consistent, so
      bursts can overshoot; returns 429).
- [ ] **Automatic shutdown, three layers** (`docs/cost-and-budget.md`): a provider-side hard cap; Gateway spend limits; an
      in-app global daily and monthly counter checked before every call, with a cron Worker that flips the kill switch.
      Alerts at 50%, 80% and 100% of $20 a month. When off: the AI is off and the game stays up.
- [ ] **Shutdown drill:** set a tiny budget, exceed it, confirm AI calls stop, the banner shows, and the game still plays.

## O4: observability and evals (the Focused showcase). Milestones M5 to M8

- [ ] LangSmith tracing on Workers with explicit client config and a flush that survives the isolate ending
      (`LANGSMITH_TRACING_BACKGROUND=false`, or `awaitPendingTraceBatches()` in `ctx.waitUntil`); check the reported
      streaming hang and avoid streaming until verified.
- [ ] Tag every trace with prompt version, graph version, model, token counts, cost and an internal random account id (never
      the Google `sub`, never a display name). Prompt text goes through PII redaction first (`docs/privacy-and-data.md`).
- [ ] Datasets (start at 30 to 50 cases each; positive, negative, adversarial, overpowered, unplayable arena, swapped-order
      judge pairs) in `ai/evals/`, results exported to `ai/evals/results/` because free-tier traces expire after 14 days.
      Seed them from `build`'s fixtures and `art`'s example prompts.
- [ ] Evaluators, deterministic first: schema validity, in-caps stats, arena reachability, token budget respected, no leaked
      system prompt; then a calibrated LLM judge for "matches the prompt" and "interesting", majority vote at temperature 0;
      calibrate against about 50 hand-labelled pairs and measure position bias.
- [ ] `pnpm evals` (a separate vitest config; outside `pnpm checks`) and `evals.yml` as the regression gate for changes under
      `ai/`, with a threshold scaled to dataset size; failures from traces become dataset examples.
- [ ] Mutation proof for evals: degrade a prompt or swap in a weaker model, and the score must fall.
- [ ] Fuzz test of the weapon `sound` block (every parameter at its limits; nothing can produce harmful audio).
- [ ] Features needing LangSmith Plus (hosted deployment, online evals, annotation queues, dashboards, alerts) are built
      behind a clear "needs Plus" note, not skipped silently.
- [ ] Optional: a human-review queue for flagged prompts with LangGraph `interrupt`; OpenTelemetry spans to Honeycomb for
      latency; a model bake-off (Workers AI vs Claude) on cost, latency and accuracy.
- [ ] Case-study material gathered as you go (`docs/focused-case-study.md`): numbers, trace screenshots, the shutdown drill,
      what surprised you.
