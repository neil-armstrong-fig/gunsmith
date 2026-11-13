# The AI pipeline

How natural language becomes a validated weapon or arena, and how cost, safety and quality are controlled. Owner: `ai`.
Research dated 2026-11-12; library APIs drift fast, so re-check them before relying on a detail (`(unverified)` marks gaps).

## Shape: a deterministic graph, not a free agent

Focused's stance is that most agent work can be deterministic and autonomy applied selectively; their own post says
"agentic workflows should get less agentic". Everything here is a fixed LangGraph `StateGraph`; no node chooses its own tools.
A Deep Agent is not needed and would add cost and variance.

```
tokenPrecheck ─► moderationJudge ─► generate ─► validate ─► rate ─► commit
     │ over limit        │ rejected        │ model fails   │ invalid or over the cap
     ▼                   ▼                 ▼               ▼
  reject (0.5 credit, no LLM)      repair (once) ─► validate ─► rate ─► still bad: `invalid`
                                   typed failure; built-in pool fallback; refund where it is our fault
```

Built for weapons 2026-11-12 (`ai/src/pipeline/`): the path is `precheck`, `moderation`, `generate`, `validate`, `rate`, and when
`validate` or `rate` refuses, `repair` then `validate` and `rate` once more. A weapon request ends `created`, `rejected` (not a
weapon, too long) or `invalid` (a weapon request, but no valid weapon even after the repair). Three model calls at most.

| Node | Does | Model? | Cost control |
| ---- | ---- | ------ | ------------ |
| `tokenPrecheck` | Counts tokens in code; rejects over-limit prompts (weapon 150, arena 250, tunable) | No | Free; half-credit rejection |
| `moderationJudge` | One cheap model: is this a weapon/arena request, is it safe, is it an injection attempt? Structured verdict | Cheap | Small output cap |
| `generate` | Structured output through a **loose reply shape** (the weapon's fields and types, no limits), with the `sound` block later | Stronger | `maxTokens`, one call |
| `validate` | The strict zod parse of the weapon (and, for arenas, the engine's arena validator). Zod only | No | Free |
| `rate` | The only home of the weapon cap (damage per second; the engine's power rating replaces it). **It refuses, it never clamps**: an over-cap weapon goes to `repair` once, then fails as `invalid`, so code disposes in the open and no nerfing happens inside the caps | No | Free |
| `repair` | At most one retry with the first answer and the faults (our own sentences, shortened) each in a data block | Same | Counted against the model-call limit |
| `commit` | Writes to the library through the ledger | No | Atomic credit spend |

Edit-from-base starts at `generate` with the saved item and the changed prompt in the data block, and is charged as a new
generation.

### What building `generate`, `validate`, `rate` and `repair` taught (measured 2026-11-12, local `qwen3.5:9b`)

- **A bounded zod schema in `withStructuredOutput` throws on an out-of-range answer** (`OutputParserException`, checked on the
  real model with "set bulletDamage to 9999"): the faulty answer never reaches `validate` or `repair`. So the model is shown a
  loose reply shape (same fields and types, nothing required, extras kept) and the strict schema is applied by code afterwards.
  A wrong type still throws there and is treated as no answer, which `repair` is told about like any other fault.
- **Fields with no type come back as text**: with `z.unknown()` the model wrote every number as a string and 12 of 21 cases
  failed. Keep the types, drop only the limits.
- **A blind repair overshoots.** Shown only the faults, the model re-derived the whole weapon and broke another limit (a riot
  shield written with 0 damage, under the floor of 1, came back at 250 damage a second, over the cap of 150). Showing it the first
  answer, and asking it to change as little as it can, fixes the case; on this model either alone is enough (mutation: each removed
  alone, 0 cases fall; both removed, the case falls), so both stay and the paid tier decides.
- **The cap catches ordinary requests, not only attacks**: "a shield that reflects bullets" came out at 200 damage a second
  before the repair. A shield has no damage in this weapon shape, so a bare shield needs the repair to invent some; a real shield
  behaviour is still owed by `build` (`HANDOFF.md`).

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

- **The loop, set up 2026-11-12 (`ai/AGENTS.md`):** case first, watch it fail for the right reason, build the smallest change,
  mutation-prove (degrade the prompt or drop a node and the score must fall). **Three tiers behind one `weaponPipelineDependencies` argument:**
  `fake` (in `pnpm checks`, proves the harness and the deterministic logic), `local` (Ollama `qwen3.5:9b` on the laptop, free,
  the working loop) and `paid` (Haiku 5.5, validation after a turn only, total ceiling $1 until the user raises it, locked until
  a capped provider key and a spend guard exist). **Scores do not transfer between tiers:** a local 9B model's pass rate says
  nothing about Haiku's, so the local tier checks the mechanics and prompt structure and the paid tier checks quality. A
  GitHub runner cannot run Ollama, so `evals.yml` will be fake or paid. **Eval traces share the free plan's 5,000 a month with
  production**, so LangSmith tracking is off by default for evals and on only for a deliberate baseline run (`EVAL_TRACK=1`).
- **Shape: acceptance-test style (2026-11-12, the user's request).** The evals are tests in `ai/evals/tests/`, grouped by behaviour:
  `given` a situation, `when` one request is asked (once, for all the trials), `thenExpect` one named criterion each. The root is
  `tests | dsl | eval-criteria-mapping`, as in `acceptance-tests/`: the mapping is the setup (the model tier, the trials, the
  real driver, the regression gate, the results file); the DSL (`WeaponSmithDsl.ask`, `expectCreated`, `expectNoWeaponOverTheCap`,
  `expectSafeToShow`, …) is a thin `try` / `catch` wrapper that rethrows a `DslError` naming what was expected; beneath it, answers are
  kept and the deterministic evaluators are run in every trial. It reaches the pipeline only through a driver interface it owns,
  so its own tests use a scripted driver and no model. Lint stops an import running upwards. What holds whatever is asked
  (safe to show; the fixed path within three model calls) is the DSL's standing criteria, which the mapping adds under every `when`.
  This replaced a table of 21 case rows scored by every evaluator in a loop, whose intent lived in comments and whose failures were
  JSON. A criterion now fails as one sentence (`withinCaps: failed in 3 of 3 trials: 2000 damage per second is over 150`). Details in
  `ai/AGENTS.md`.
- **Datasets** (research of 2026-11-12, replacing the user's earlier "about 10": no source gives a cap. Anthropic: 20 to 50
  tasks drawn from real failures is a great start; Focused: a 7-example demo, 50 to 100 for production; Hamel Husain: about 100
  traces to discover failure modes. So start near 20 to 30 and grow to 50 to 100 once there is traffic, adding a case only
  when a real or probed failure needs one, never to pad): weapons (positive, negative, adversarial, deliberately
  overpowered, boundary), arenas (including unplayable layouts), judge pairs (each in both orders). Seeded from `build`'s
  fixtures and `art`'s example prompts. Failures from real traces become new cases.
- **Evaluators, deterministic first** and binary: schema validity, stats inside caps, arena reachable, token budget respected,
  no system-prompt leak, names clean. Then an LLM judge for "matches the prompt" and "interesting", temperature 0, majority
  vote of three; calibrate against about 50 human-rated examples (Focused; Hamel says 100 to 200 per failure mode); investigate any example that flips more than 10% of runs.
- **Types to cover** (from Focused, Anthropic and Hamel Husain, 2026-11-12; status for gunsmith's weapon suite):

  | Type | Status |
  | ---- | ------ |
  | Deterministic, one per failure mode (schema, caps, name hygiene, leak canary, call budget, outcome, node path) | 7 built |
  | Balanced negatives (a strange legitimate request must be created; off-topic must be rejected) | built (banana, French, "gun"; lasagna, weather, blank) |
  | Adversarial (system-prompt request, stat override, role-play, delimiter break, instruction as a name) | built (5 cases) |
  | Regression versus capability suites, gate on regression only | built (`EVAL_GATE=regression`) |
  | Consistency over trials (pass^k) | built (3 trials on the local tier) |
  | Cost and latency per case | latency built; tokens and cost once nodes call models |
  | LLM judge ("matches the prompt", "interesting") | **deferred** (user, 2026-11-12); then temperature 0, majority of three, about 50 labels |
  | Arena suite (reachability from the engine, swapped-order judge pairs) | later |
  | Online evaluators on sampled production traces | likely needs LangSmith Plus; failing traces are promoted into the dataset by hand |
  | Dataset hygiene (timestamp, monthly review, quarterly rotation, 10% from production monthly) | later |

  Sources: Focused, "Evaluation Pipelines for LangGraph Agents" and "AI Agent Evaluation Ends Too Early" (dev.to/focused_dot_io);
  Anthropic, "Demystifying evals for AI agents"; Hamel Husain, "How many examples do I need for an eval?". None gives a cap
  on the number of evals or evaluators.
- **Trajectory** checks (`agentevals`) matter little for a fixed graph; use node-level assertions instead.
- **Regression gate:** `evals.yml` runs the suite for changes under `ai/`, compares the pass rate per evaluator with the
  baseline, and blocks when one drops by more than a threshold scaled to the dataset size (Focused: 10% at 7 cases, 5% at about 50; below about 30 cases one case is over 3%, so
  the rule is that a **regression** case that passed on the baseline must not fail). Cases carry a **suite** tag: `regression`
  (expected near 100%, gates CI) or `capability` (a hill to climb, tracked, graduates to regression when it holds; Anthropic).
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
