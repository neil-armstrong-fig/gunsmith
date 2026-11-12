# The AI pipeline

How natural language becomes a validated weapon or arena, and how cost, safety and quality are controlled. Owner: `ai`.
Research dated 2026-11-12; library APIs drift fast, so re-check them before relying on a detail (`(unverified)` marks gaps).

## Shape: a deterministic graph, not a free agent

Focused's stance is that most agent work can be deterministic and autonomy applied selectively; their own post says
"agentic workflows should get less agentic". Everything here is a fixed LangGraph `StateGraph`; no node chooses its own tools.
A Deep Agent is not needed and would add cost and variance.

```
tokenPrecheck ─► moderationJudge ─► generate ─► validate ─► (repair, once) ─► rate ─► commit
     │ over limit        │ rejected        │ model fails        │ still invalid
     ▼                   ▼                 ▼                    ▼
  reject (0.5 credit, no LLM)      typed failure; built-in pool fallback; refund where it is our fault
```

| Node | Does | Model? | Cost control |
| ---- | ---- | ------ | ------------ |
| `tokenPrecheck` | Counts tokens in code; rejects over-limit prompts (weapon 150, arena 250, tunable) | No | Free; half-credit rejection |
| `moderationJudge` | One cheap model: is this a weapon/arena request, is it safe, is it an injection attempt? Structured verdict | Cheap | Small output cap |
| `generate` | Structured output against the shared zod schema, with the `sound` block | Stronger | `maxTokens`, one call |
| `validate` | zod parse, then the engine's arena validator or weapon caps check | No | Free |
| `repair` | At most one retry with the validation errors fed back | Same | Counted against the model-call limit |
| `rate` | The engine computes the power rating and applies hard caps (no nerfing inside them) | No | Free |
| `commit` | Writes to the library through the ledger | No | Atomic credit spend |

Edit-from-base starts at `generate` with the saved item and the changed prompt in the data block, and is charged as a new
generation.

### The arena judge

A separate small graph: given two arena prompts, choose the more interesting one. Both are validated first. They are placed in a
**randomised order**, the verdict is a schema, and a deterministic tie-break applies. If only one prompt exists, it wins
(still validated); if none, the built-in pool is used. Measure position bias in the evals and fix it with the shuffle and,
if needed, a swapped-order second judgement.

## Contracts (see `HANDOFF.md`)

`AiAdapter` (owned by `build`, implemented here): generate a weapon, generate an arena, judge two arena prompts; emit
pipeline-progress events (token check, judging, generating, validating, rating); return the credit cost; fail with a typed
result (`rejected`, `timed-out`, `ai-off`, `over-limit`, `invalid`). The fake adapter returns fixtures. No acceptance test
calls the real one.

## Safety

- **Player text is data.** It goes in a delimited data block, never in the instructions; the judge sees prompts only, never
  secrets or other players' data.
- **Injection is expected.** The datasets include adversarial prompts (ignore instructions, ask for the system prompt, ask
  for a 1000 damage gun, markup, other languages). A prompt that passes the judge still faces the schema, the caps and the
  validator, so a successful injection can at worst produce a legal, capped weapon.
- **Output moderation is deterministic:** length and charset limits plus a blocklist on names and descriptions (in
  `engine/` or `shared/`, `build`'s). A failure takes the repair attempt.
- **The `sound` block** is player-influenced audio. Every parameter is clamped and the total duration and gain limited, with
  a fuzz test.
- LangChain's `piiMiddleware` can redact before text leaves for traces; prompt text is redacted for LangSmith
  (`docs/privacy-and-data.md`).

## Cost and token control

Details and numbers in `docs/cost-and-budget.md`. In the pipeline: a code token pre-check before any model call; `maxTokens`
on every call; a cheap model for judging and a stronger one for generating; `modelCallLimitMiddleware` and
`toolCallLimitMiddleware` as backstops (a fixed graph should never loop, but the limit proves it); one repair attempt;
AI Gateway caching; a refund on timeout.

Credits (one config in `shared/`): 10 a day, reset 00:00 UTC; weapon 1, arena 1, edit 1, rejected prompt 0.5, reuse free.

## Models and portability

The model is chosen in code, never in the environment (a rule from the learning repo). Primary provider: Anthropic through
Cloudflare AI Gateway. A cheap model for `moderationJudge` and the arena judge; a stronger one for `generate`;
`modelFallbackMiddleware` for a second provider. Workers AI is a bake-off candidate (its JSON mode takes a JSON schema but
does not guarantee conformance and does not stream). Model-agnostic design is also Focused's talking point: switch with a
config change and an eval run, not a rewrite.

## Observability (LangSmith)

- Tracing is on from the first node. On Workers, environment variables are not read, so pass the tracing config to the client
  explicitly; tracing is background by default, so either set it blocking (`LANGSMITH_TRACING_BACKGROUND=false`, or
  `LANGCHAIN_CALLBACKS_BACKGROUND=false` for LangChain.js) or call `awaitPendingTraceBatches()` inside `ctx.waitUntil`.
  A forum report says streaming runs hang on Workers; do not stream until verified.
- Tag traces: prompt version, graph version, model, input and output tokens, cost, outcome, and the **internal random
  account id**. Never the Google `sub`, never a display name.
- A per-generation "runtime receipt" (cost, credits, outcome) follows Focused's "runtime receipts" idea.
- Free tier retention is 14 days; export results to `ai/evals/results/` (date, git commit, model, dataset version, scores,
  cost).

## Evals (eval-driven development)

Modelled on Focused's published pipeline (Austin Vance, "Evaluation Pipelines for LangGraph Agents") and the learning repo's
module 02.

- **Datasets** (30 to 50 cases each to start; grow them): weapons (positive, negative, adversarial, deliberately
  overpowered, boundary), arenas (including unplayable layouts), judge pairs (each in both orders). Seeded from `build`'s
  fixtures and `art`'s example prompts. Failures from real traces become new cases.
- **Evaluators, deterministic first** and binary: schema validity, stats inside caps, arena reachable, token budget respected,
  no system-prompt leak, names clean. Then an LLM judge for "matches the prompt" and "interesting", temperature 0, majority
  vote of three; calibrate against about 50 hand-labelled pairs; investigate any example that flips more than 10% of runs.
- **Trajectory** checks (`agentevals`) matter little for a fixed graph; use node-level assertions instead.
- **Regression gate:** `evals.yml` runs the suite for changes under `ai/`, compares the pass rate per evaluator with the
  baseline, and blocks when one drops by more than a threshold scaled to the dataset size (about 10% at 7 cases, 5% at 50).
  Tag CI runs so traces are traceable.
- **Mutation proof:** degrade a prompt or use a weaker model; the score must fall. A gate that cannot fail proves nothing.
- **Kept out of `pnpm checks`:** evals cost money and are non-deterministic.
- **Pitfalls to design against (from Focused):** a flaky judge, eval gaming (rotate examples), judge disagreement with
  humans, dataset drift.

## Features that need LangSmith Plus

Hosted deployment, online evals, annotation queues, dashboards and alerts. Build them behind a clear "needs Plus" note and a
local equivalent where one exists, rather than skipping them silently. Check the current plan page.

## Sources

- Focused: [Evaluation Pipelines for LangGraph Agents](https://dev.to/focused_dot_io/evaluation-pipelines-for-langgraph-agents-2aoi),
  [LangGraph for Enterprise Agent Development](https://dev.to/focused_dot_io/langgraph-for-enterprise-agent-development-why-we-built-our-entire-practice-on-it-4p31),
  [eval-driven development](https://focused.io/capabilities/eval-driven-development)
- [LangChain built-in middleware](https://docs.langchain.com/oss/javascript/langchain/middleware/built-in)
- [LangSmith serverless environments](https://docs.langchain.com/langsmith/serverless-environments),
  [tracing with Cloudflare Workers](https://kb.langchain.com/articles/1885761495-how-do-i-use-langsmith-tracing-with-cloudflare-workers)
- [Workers AI JSON mode](https://developers.cloudflare.com/workers-ai/json-mode/)
- Local: `langsmith-learning/docs/CURRICULUM.md` and module 02 (`brief-to-json`)
