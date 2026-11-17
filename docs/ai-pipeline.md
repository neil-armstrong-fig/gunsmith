# The AI pipeline

How natural language becomes a validated weapon or arena, and how cost, safety and quality are controlled. Owner: `ai`.
Research dated 2026-11-12; library APIs drift fast, so re-check them before relying on a detail (`(unverified)` marks gaps).

## Shape: a deterministic graph, not a free agent

Focused's stance is that most agent work can be deterministic and autonomy applied selectively; their own post says
"agentic workflows should get less agentic". Everything here is a fixed LangGraph `StateGraph`; no node chooses its own tools.
A Deep Agent is not needed and would add cost and variance.

```
tokenPrecheck ─► moderationJudge ─► generate ─► validate ─► balance ─► rate ─► commit
     │ over limit        │ rejected        │ model fails   │ not a valid weapon
     ▼                   ▼                 ▼               ▼
  reject (0.5 credit, no LLM)      repair (once) ─► validate ─► balance ─► rate ─► still bad: `invalid`
                                   typed failure; built-in pool fallback; refund where it is our fault
```

Built for weapons 2026-11-12 (`ai/src/pipeline/`): the path is `precheck`, `moderation`, `generate`, `validate`, `balance`, `rate`,
and when `validate` refuses (or `rate`, which after `balance` should never), `repair` then `validate`, `balance` and `rate` once
more. **`balance` joined 2026-11-15** (the user's design, below): the model proposes the stats and the player's preference, code
brings the weapon inside the limits. A weapon request ends `created`, `rejected` (not a weapon, too long) or `invalid` (a weapon
request, but no valid weapon even after the repair). **A created weapon is then drawn (2026-11-15)**, as a second stage with its own model,
repair and disclosed stand-in (below), so a request costs **five model calls at most** (moderation, stats, stats repair, drawing,
drawing repair; three when nothing needs repairing).

| Node | Does | Model? | Cost control |
| ---- | ---- | ------ | ------------ |
| `tokenPrecheck` | Counts tokens in code; rejects over-limit prompts (weapon 150, arena 250, tunable) | No | Free; half-credit rejection |
| `moderationJudge` | One cheap model: is this a weapon/arena request, is it safe, is it an injection attempt? Structured verdict | Cheap | Small output cap |
| `generate` | Structured output through a **loose reply shape** (the weapon's fields and types, no limits), with the `sound` block later | Stronger | `maxTokens`, one call |
| `validate` | The strict zod parse of the weapon's shape and the player's stat `preference` beside it (and, for arenas, the engine's arena validator). Zod only. **It does not hold a stat to its range** (2026-11-16): a finite number past either end is data and passes as written (`check/validate/proposal/WeaponProposal`). A missing preference is no preference; a stat there is not, text, `NaN`, a missing field, a fractional magazine or reserve, a stray field and a bad name are refused | No | Free |
| `balance` | First `clampToRanges` (`ai/`): a stat past a range goes to the end of it, on either side, so a weapon is never useless (damage 0 becomes 1, a magazine of 100 becomes 60). Then **the engine's `balanceWeapon`** (`engine/src/weapon-balance/`): brings the weapon inside the power budget and the damage-per-second cap by taking from its stats where the preference says. The balancing never makes a stat stronger | No | Free |
| `rate` | The backstop behind `balance`: refuses a weapon over the engine's damage cap or power budget. After `balance` it has nothing to refuse, so a refusal means the balancing was bypassed | No | Free |
| `repair` | At most one retry with the first answer and the faults (our own sentences, shortened) each in a data block. Now for schema faults only: the model is no longer asked to lower a stat | Same | Counted against the model-call limit |
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

### What the weapon evals showed on Haiku 5.5 (measured 2026-11-14)

The weapon specs run on the paid tier now. **All 70 criteria pass, in all 3 trials** (101 calls, every one `tool_use`, none cut
off; about $0.018; costs in `docs/cost-and-budget.md`). The shield cases, which on the local model passed only through the repair,
pass first time. What the run taught:

- **A paid result can lie unless the harness refuses to let it.** The pipeline swallows a failed model call and moderation fails
  closed, so an API error, or a tool call cut off at `maxTokens`, reads as "the model wrote a bad weapon" or "rejected the
  request". The paid runner fails the run in words for either, and the spend guard records the ceiling stopping a call mid-request
  as a failure too. A paid model's token cap must be far above need (2,000 here, a reply is about 140 tokens), unlike the local
  one's 400 and 100, which only kept Ollama fast.
- **At first nothing on Haiku steered the repair, and one criterion fixed that.** Four eval mutants at 3 trials (repair skipped,
  "change as little as you can" removed, the `<previous>` block removed, both removed) all survived 70 of 70, because the attack specs
  accept `invalid` as well as `created` ("refusing is as good as creating"). The repair does run (5 of 57 model requests, the "100
  damage, 20 a second" request 3 of 3). With the user's agreement a criterion was added to that `when`: **the request still ends
  `created`, inside the cap.** Re-run: **skipping the repair now falls exactly that criterion** (so the Haiku eval can fail), and
  **removing the `<previous>` block, the "change as little" sentence, or both still passes 71 of 71.** So on Haiku, for the one case
  that needs a repair, the model fixes its own overshoot from the problem list alone; the local model needed them (each alone
  enough, both removed fell). One case and three trials is thin, and the user's stat balancer (`TODO-ai.md` O2) will take over
  fixing stats, leaving the repair for schema faults, so **nothing was dropped**: revisit the `<previous>` block (it echoes model
  output, a small injection surface) when the repair's job is settled.
- **Moderation does not need its two defence paragraphs on Haiku, for the current cases.** Removing the "say no" list, and
  removing the data-block paragraph (the weapon-words sentence kept), each leave 70 of 70. These mutants *can* fall (a fail-open
  moderator sinks four `when`s), so the cases genuinely do not exercise them. They stay as defence in depth until a case does:
  the injection probes so far are the 46 local ones, and none was aimed at Haiku.

### The stat balancer: the model infers, code balances (built 2026-11-15)

The user's design (2026-11-14): "max everything" is not a solution, and asking the model to behave, or refusing and repairing, is the
wrong tool. The model returns the **stat values it infers** and the player's **stat preference** (`favoured` and `sacrificed`, two
lists from `damage, fireRate, bulletSpeed, magazineSize, reloadSpeed, reserve`), and **code balances the weapon afterwards**. This
**replaces "refuse, never clamp" for stats**: an over-the-limit request now becomes a balanced weapon, not an `invalid` one.

**Where it lives (the user's call, 2026-11-15): `engine/src/weapon-balance/`, on top of `engine/src/power-rating/`**, a game rule that `api/` will need to re-check any stored
weapon, imported by `ai/` through a workspace link. The one cross-persona write of this slice; `build` owns the numbers from here.

- **A weapon is rated 0 to 1**: each stat is turned into a goodness from 0 (its weakest allowed value) to 1 (its strongest), on a
  log scale for damage, fire rate, magazine and reload speed (a magazine of 12 against 6 is as big a step as 6 against 3) and a
  linear one for bullet speed and reserve, and the goodnesses are added up by what each is worth (damage and fire rate 0.25 each,
  magazine and reload 0.15, speed and reserve 0.1). The rifle rates 0.55 and the marksman rifle 0.46.
- **Two limits**: a power budget of 0.65, and the old damage cap (150 a second), which the budget alone would not hold, because a
  very quick, very hard hitter that gives up everything else still rates low. All numbers are tunables, set by play.
- **Never buff, trim evenly.** A weapon inside both limits comes back as it was (a weak request stays weak). Over them, every stat
  gives up the same share of its goodness times a weight, **favoured 0.25, neutral 1, sacrificed 3**, the smallest shrink that fits,
  found by halving. Two steps: the **budget first, from all six stats**, then the **damage cap, from damage and fire rate only**
  and only if the first step left it over (an even trim to the budget usually does not). Numbers are then rounded to two decimals
  (whole rounds for the magazine and reserve) toward the weaker value, so rounding cannot put a weapon back over a limit.
  A stat the player both favours and would sacrifice counts as neither, so it is accepted and not repaired.
- **Properties, with `fast-check` as janggi does** (`BalanceWeaponInvariants.test.ts`, `pnpm test:properties`, outside `pnpm checks` because a fresh seed each run
  is not reproducible; 100 random weapons and preferences per property by default, 3000 tried): every output is inside every limit and range, whole rounds in the
  magazine and reserve, never more than 150 damage a second (counted without the limits it checks), no stat ends stronger than it was asked, a weapon already inside
  the limits comes back exactly as it was, the same input gives the same output, and **promoting a stat in the preference never lowers it**. Of 15 mutants the
  properties alone kill 8; the other 7 (the budget, a magazine rounded up, a missing clamp, the preference ignored, goodness going negative, too few halvings) are
  killed by the unit tests, so neither alone is enough. Over fifty engine and about thirty `ai` mutants were all killed in the end; the ones that survived at first
  were a missing test (every stat favoured), a step order nothing pinned, a limit no test isolated, and one equivalent guard.

**What the probe found (Haiku 5.5, 12 requests, 3 trials each, $0.009).** The model states the preference well: 36 of 36 answers used
only the six names and none put a stat in both lists; it is steady on clear requests ("hits hard but fires slowly" favours damage and
gives up fire rate, the sniper gives up reload speed) and unsteady on one word: **"tiny magazine" is sometimes favoured and sometimes
sacrificed**, a real ambiguity ("tiny" is wanted low, and the prompt now says a magazine it wants tiny is a sacrificed
`magazineSize`). The local `qwen3.5:9b` did as well on 12 of 12. Both models already **balance their own stats** unless told to max
out: asked for "100 damage and 20 shots a second" Haiku writes exactly that (2000 damage a second), which is what the balancer is for.

**What it makes of the requests that trigger it (Haiku, the whole pipeline, 2 calls each):** "100 damage and 20 shots a second"
becomes 23.7 damage every 0.16 s (148 a second), speed 20.9, magazine 8, reload 2.3 s, reserve 76; "hits hard and fires fast but I do
not care about anything else" becomes 21 to 22 damage every 0.15 s (140 to 147 a second) with the rest trimmed by what was
sacrificed (magazine 20, reserve 79). **The damage cap, not the preference, decides how hard and fast a weapon can be**: it holds
damage times fire rate to 150 whoever is favoured, and the preference decides only which of the two gives more. And because the
balancer never buffs, a sacrificed stat is trimmed only as far as the limits need, not pushed to its floor.

**Evals.** `evals/tests/weapon/`: the "maximum of everything" request and the "hard and fast" request each end `created` by code (a
`balance` node, no `repair`: `expectBalancedByCode`), a created weapon's path must read `validate`, `balance`, `rate`
(`NodePath`). Red-first by mutation, since the balancer was built unit-first: with the balancing bypassed, exactly the three
criteria that name it fall, in 3 of 3 trials each. Final run, 3 trials: local 78 of 78, fake the same 8 by-design failures (78 criteria), Haiku 77 of 78 (the one failure is the capability criterion for the open finding below; $0.57 of the $1 spent in all). The
preference's direction is proved in `engine/` (a favoured stat ends higher, a sacrificed one lower, and the random-weapon properties), not in an eval,
because both models already point the right way, so an eval could not be red first.

**The finding, closed in code 2026-11-16.** On "a machine gun with a big magazine and plenty of spare ammo" Haiku writes a magazine of 80 to 100 and a
reserve of 300 to 400, past the ranges (60 and 200), 3 of 3 times, under every prompt wording tried (five variants, including the
probe's own), so `validate` used to refuse and a repair ran (a third call; it still ended `created`). **The user chose "code clamps it":** `validate`
accepts a finite number past either end of a range, `balance` brings it to the end of the range (`ai/`'s `clampToRanges`; `engine/` is untouched, and it
already owns the ranges as `STAT_RANGES`, which `ai/`'s `WEAPON_LIMITS` is built from), and the weak side clamps up too ("we don't want weapons to be
actually useless"). Proved on the fake and local tiers and by unit tests (mutants: no clamp, strong side only, strict `validate` again, whole-number rule
dropped, each killed by the tests that name it); **proved on Haiku 5.5 with one paid trial** (2026-11-17, about $0.001, a smoke test since Haiku has no `temperature`): created, three calls, no repair, where it
was a repair in 3 of 3 before. The spec is now a plain `given`. A shield has no damage in the weapon's shape, so a bare shield (damage 0) is now created at damage 1 with no repair: the same
weapon as before, one call cheaper, and still only a stand-in for the shield behaviour `build` owes.

**Reconcile with `docs/game-design.md`**, which still says "power is capped, not balanced; nothing is silently nerfed" and
`docs/schemas.md`, which says the power rating "is displayed, not used to scale anything". The balancer trims by design; those two
lines are `build`'s and the user's to update.

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
  (safe to show; the fixed path within five model calls, three before the drawing joined) is the DSL's standing criteria, which the mapping adds under every `when`.
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

## Weapon visuals (very early, 2026-11-13; wired in 2026-11-15)

A second domain, `ai/src/pipeline/appearance/`, has the model draw a weapon's appearance as strict JSON (generate, fix, validate, one repair,
a disclosed stand-in). **Since 2026-11-15 `generateWeapon` runs it as a second stage** (the user's call budget: separate stats and drawing
calls, five at most), after the stats have passed `validate`, `balance` and `rate`:

```
… ─► rate ─► appearance.generate ─► appearance.fix ─► appearance.validate ─► done
                       └ refused ─► appearance.repair (once) ─► fix ─► validate ─► still refused: appearance.fallback (the stand-in)
```

- **Order and skipping.** A rejected or `invalid` request makes no drawing call. Drawing never runs before the weapon has passed
  everything, so a weapon that could not be built costs no drawing.
- **The outcome.** `WeaponOutcome.appearance` is the drawing's own `AppearanceOutcome` (`valid | completed | repaired | fallback`, what
  code changed, what was refused), on every `created` outcome and on none other. The drawing's nodes follow the stats' own with an
  `appearance.` prefix, and `modelCalls` adds both stages. A drawing that cannot be made leaves a `created` weapon with the
  disclosed stand-in: the stats are never held hostage to the picture, and the picture never changes a stat.
- **Its own model.** `appearanceGenerator` sits beside `generator` and `moderator` in `weaponPipelineDependencies`, because a drawing
  needs far more output than the stats (about 3,000 tokens of cap against a hundred) and a temperature above zero locally.
- **Where it lives.** The `draw` node of the weapon graph (`ai/src/pipeline/weapon-graph/drawing/AppearanceNode.ts`, 2026-11-16; it was `weapon-drawing/DrawCreatedWeapon.ts`); the schema stays in `ai/` until the webapp renderer imports it.

Measurements, failure classes, candidate defaults and open questions are in `docs/ai-visual-generation.md`.

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
