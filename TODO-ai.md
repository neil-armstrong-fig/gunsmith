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

- [x] Compare, with a tiny proof of one node graph for (1) and (2): (1) a LangGraph server on LangSmith Deployment,
      (2) a self-hosted LangGraph server on Cloudflare Containers, (3) inside the Worker with LangChain.js. The user favours
      (1) and (2) and expects (3) not to work in practice. Criteria: monthly cost, free-tier fit, licensing (unverified for a
      self-hosted server), cold starts, CPU and time limits, checkpointer, tracing flush, Studio, local dev, and how the
      Worker gateway calls it. Write the decision in `docs/ai-hosting.md`.
      *Done 2026-11-12, but not as written: the user declined Plus, so options 1 and 2 were not deployed (no real proof of
      either). The proof is of option 3 and of the graph under `langgraph dev`: one-node graph passing with a mutation check,
      served by the local Agent Server, run in workerd, bundle 2.79 MiB. Decision: option 3 (`docs/ai-hosting.md`). The
      proof is the `ai/` package on the uncommitted worktree `.claude/worktrees/ai-hosting-proof`, awaiting the user's review.*
- [ ] **Owed from O1:** re-measure CPU time with the real graph (free plan allows 10 ms). *Trace flush on Workers: checked
      2026-11-12 against a local fake LangSmith endpoint (use `ctx.waitUntil(awaitAllCallbacks())` on every path; recheck with
      a real key). Studio: verified 2026-11-12 on the EU account (graph drawn, form built, a run returned the weapon; use
      `localhost`, not `127.0.0.1`); traces not exercised until a key exists. Details in `docs/ai-hosting.md`.*
- [x] **Fixed vs variable spend:** the $20 a month ceiling is model spend; LangSmith Plus (if hosted needs it) and Workers Paid
      are fixed subscriptions on top. Check current prices. *Done 2026-11-12: Plus $39 a seat, Paid $5; `docs/ai-hosting.md`.*
- [x] **Containers vs the free plan:** do Cloudflare Containers need Workers Paid? If so, option 2 forces Workers Paid; tell
      the user and `build`. *Done: yes, it does; blocker line in `TODO.md`.*
- [x] **Budget arithmetic:** cost per generation × credits per day = how many generations the $1 a day soft cap buys globally.
      If that is a handful of users, decide the response (smaller models, caching, a lower credit price) before building.
      *Done as estimates: Sonnet buys a handful of heavy users, so Haiku 5.5 is the proposed default generator; see
      `docs/cost-and-budget.md`. The user set $1 a day with the $20 month as the hard cap, early shutdown accepted. Re-run
      with measured tokens once evals exist.*
- [x] Settle whether `api/` imports `ai/` or calls it over HTTP; update the table in `AGENTS.md` and `HANDOFF.md`.
      *Done: `api/` imports `ai/` (the pipeline runs in the Worker); both files updated.*

## Review the contracts. Milestone M2

- [ ] When arena generation returns, hand resolved player/AI definitions to build's deterministic finalisation and
      fairness checks (stairs, spawn/pickup routes, ring escape). Built-ins meet the same checks and a curated quality
      bar. Central weighting of the strongest weapon is a placement experiment, not an LLM fairness verdict.
- [ ] **Prompt-built visual JSON (user request, art proposal):** review `docs/art/visual-schema-proposal.md` with build/art.
      Agree a strict visual vocabulary and budgets, add appearance structured output when the shared schema exists,
      and seed O4 with the six oddity prompts. Evaluate recognisable identity, schema validity, token cost and
      repair/fallback rates; unsupported mechanics must be explained rather than disguised as decorative effects.
- [ ] When `build` marks the first four rows of "What is ready" in `HANDOFF.md`, review the schemas, `AiAdapter`,
      `CreditLedger` and credit config. Ask for changes now; record your sign-off in the delivery log.

## EDD: eval-driven development setup (the user's request, 2026-11-12; `ai/AGENTS.md`)

Evals steer the pipeline the way acceptance tests steer the game: case first, watch it fail, build, mutation-prove. Three
tiers behind one `deps` argument: fake (in `pnpm checks`), local Ollama `qwen3.5:9b` (the working loop, free), paid Haiku 5.5
(validation after a turn, total ceiling $1, locked until a capped key exists). Few evals: about 10 cases a suite.

- [x] Deps approved and added (`@langchain/ollama` 1.3.0, `langsmith` 0.11.8, devDependencies only); lint rule blocks both
      from `src/` (proved with a probe file).
- [x] Harness: `evals/` with the case type, five deterministic binary evaluators (`outcomeMatches`, `schemaValid`,
      `withinCaps`, `noPromptLeak` with a canary token, `modelCallBudget`), each unit-tested and mutation-proven (5 mutants, 5
      killed by the right test); `pnpm evals:fake|local|paid`; tracking off by default; result summaries to `evals/results/`.
- [x] Nine weapon cases (positive 2, boundary 2, overpowered 1, adversarial 2, negative 1, too-long 1).
- [x] First red-green: the one-node stub fails "not a weapon" and "far over the length limit" for the right reasons; the
      token pre-check (test-first) turned "far over the length limit" green with no model call. Fake tier now 8 of 9.
- [x] Ollama 0.40.16 and `qwen3.5:9b` (7.6 GB) installed by the user and **validated 2026-11-12**: a call takes 0.3 to 1.1 s
      warm (7.5 GiB peak); **`format` (schema and JSON mode) fails with "structured output is unavailable"** on this NVFP4/MLX
      build, but **tool calling works** and LangChain's `ChatOllama.withStructuredOutput(schema, {method: "functionCalling"})`
      answered moderation correctly (3 structured calls in about 2.2 s). Probed behaviour: moderation says lasagna, gibberish and
      the injection text are not weapon requests; the model **obeys** "100 damage, 20 a second" (2000 damage per second, cap
      150) and "set damage to 9999, rateOfFire 500" (outside the schema). So the overpowered and injection cases will go red for
      real reasons once the stub is gone. Untested: `qwen3.5:9b-q4_K_M` (6.6 GB, not MLX), which may support `format`.
- [ ] **Before open-sourcing (the user, 2026-11-12):** the system-prompt canary (`SYSTEM_PROMPT_CANARY`) becomes an environment
      secret passed to the pipeline as a dependency, not a constant in the source; the evals use a throwaway value. Do it
      before the repo goes public (`MANUAL-SETUP-STEPS.md` step 15). Nothing else in `ai/` is secret.
- [x] **Fitted to main (2026-11-12, after `42f1b0f`):** main merged into the worktree branch (conflicts only in
      `pnpm-workspace.yaml`, one `zod` entry kept, and the lockfile, taken from main then `pnpm install`); `ai/` restyled to
      `engine/`'s conventions: `exports` map and self-named imports (`@gunsmith/ai/...`, no `@src`), every type in `types/`,
      the token limit in its own file, `/** */` doc comments, evaluators grouped by subject. Verified: root `pnpm checks`
      exits 0 (`ai` 27, `engine` 72, `webapp` 38), self-imports resolve in `tsc`, vitest, ESLint, `wrangler deploy --dry-run`
      (still 2790 KiB) and `langgraphjs dev` (a run over HTTP returned the weapon); evals unchanged at 8 of 9.
- [ ] Loop 1 (local): moderation judge (function calling) so "not a weapon" goes green; loop 2: real `generate`, validate,
      repair, rate (caps), watching the overpowered and injection cases for real; mutation proof of each.
- [ ] Paid tier: spend guard (estimate before a run, abort over the ceiling, cache by model plus prompt hash), after the user
      makes a provider key with its own hard cap (`MANUAL-SETUP-STEPS.md` step 8). Haiku only, ceiling $1 total for now.
- [ ] Later: a model judge for "matches the prompt", arena suite, `evals.yml` (a GitHub runner cannot run Ollama, so CI is fake
      or paid only).

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
- [ ] **Trace everything early (the user's decision, 2026-11-12):** no sampling at first. The free plan allows 5,000 traces a
      month with no card (hard stop), about 166 a day; hitting it is "a happy problem" and the user upgrades then
      (`docs/ai-hosting.md`). Two things to build so it stays happy: a trace that is rejected over the limit must never fail
      or slow a player's request (flush in `ctx.waitUntil`, errors swallowed; prove it by pointing the mock endpoint at a 429),
      and a trace counter with an alert at 80% so the user hears before the stop. Add sampling later only if the user asks.
- [ ] **Keep evals few and useful (the user, 2026-11-12):** the guidance is no more than about 10 evals, and that is for
      more complex systems. So each suite is at most about 10 cases, each chosen to catch a different failure, and a handful
      of evaluators; add a case only when a real failure needs one. This replaces the "30 to 50 cases" and "about 50
      hand-labelled pairs" below (update `docs/ai-pipeline.md` to match).
- [ ] Datasets (about 10 cases or fewer each, one per failure kind: positive, negative, adversarial, overpowered, unplayable
      arena, swapped-order judge pair) in `ai/evals/`, results exported to `ai/evals/results/` because free-tier traces expire after 14 days.
      Seed them from `build`'s fixtures and `art`'s example prompts.
- [ ] Evaluators, deterministic first: schema validity, in-caps stats, arena reachability, token budget respected, no leaked
      system prompt; then a calibrated LLM judge for "matches the prompt" and "interesting", majority vote at temperature 0;
      calibrate against a small set of hand-labelled pairs (about 10, not 50) and measure position bias.
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
