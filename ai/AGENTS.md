# AGENTS.md: ai

The LangChain / LangGraph pipeline that turns a player's words into a weapon or an arena, and the evals that steer it.
Root `AGENTS.md` still applies. Why it runs inside the Worker: `docs/ai-hosting.md`. The pipeline's design: `docs/ai-pipeline.md`.

## Layout and imports

Laid out like `engine/` (read its `AGENTS.md`): one folder per subject, entry points at the top, every interface and type
alias in that folder's `types/`, a tunable constant in a file of its own, and a helper only one file uses in a subfolder beneath it.
**One exception (the user, 2026-11-12): a type read off a runtime value lives in the same file as that value**, so the two cannot
drift apart: a `z.infer` type beside its zod schema (`graph/proof/WeaponProof.ts`), and an `as const` list beside the union derived
from it (`pipeline/types/WeaponOutcomeStatus.ts`, `src/evals/eval-criteria-mapping/environment/tier/shared/types/EvalTier.ts`).

**Imports.** `api/` will import this package as raw source (`exports: {"./*": "./src/*.ts"}`), so inside `src/` a file imports
another by the package's own name, `@gunsmith/ai/pipeline/GenerateWeapon`, never an `@src` alias (it would resolve into
`api/`'s tree). Checked 2026-11-12 to resolve in `tsc`, vitest, ESLint, `wrangler deploy --dry-run` (esbuild) and
`langgraphjs dev`. The evals live in `src/evals/` (moved there from `ai/evals/`, 2026-11-18, to keep them with the code they steer). Nothing
imports them, and `package.json`'s `exports` carries `"./evals/*": null` so `api/` cannot (checked: Node answers `ERR_PACKAGE_PATH_NOT_EXPORTED`), so they keep
their own `@evals/*` alias (`./src/evals/*`) and the only code in `src/` allowed to import `@langchain/ollama`. Their results are written
to `src/evals/results/` (git-ignored; CI uploads the fake tier's).

## Pipeline and eval boundaries

- `src/pipeline/GenerateWeapon.ts` and `appearance/GenerateAppearance.ts` are separate entry points. Models arrive through dependencies; runtime stays Workers-safe. Never import eval-only Ollama or LangSmith test clients into `src/` outside `src/evals/` (lint stops it).
- Code, not the model, keeps stats in range: `check/validate/` parses the loose `proposal/WeaponProposal` (any finite number for the six stats; text, `NaN`, a missing or stray field or a fractional magazine still go to repair), then `check/balance/clamping/ClampToRanges` brings each stat to the end of its range, both sides, before the engine's `balanceWeapon`. A stat past a range therefore costs no repair.
- Appearance is integrated after validated, balanced and rated stats, with five calls maximum, one repair per stage and a disclosed visual fallback. The appearance schema, limits, vocabularies and stand-in live in `shared/src/appearance/` (the webapp renders them); the bounds that need a sum or a transform (`check/validate/`) stay here.
- The arena pipeline (`src/pipeline/arena/`, entry `GenerateArena.ts`) mirrors the weapon's: precheck at 1,000 characters, moderation, generate, `validate`, one repair, then a built-in arena and a refund (`arena-graph/`), three model calls at most. The model writes the engine's drawing rows; `check/validate/` runs zod, `arenaFrom`, then engine's `validateArena` (the repair is shown the first five problems and a count of the rest, because the validator names every cut-off piece of floor); the size limits and the built-in pool are engine's (`ARENA_LIMITS`, `BUILT_IN_ARENAS`, adopted 2026-11-18; the evals' setups may import engine for the pool), and `limits/ArenaNameLength` is the one rule only a drawn arena has; a drawing may carry low cover blocks (`c`, allowed since engine's cover was integrated, 2026-11-19), which the prompt's legend teaches (the example has none, on purpose: a model copies its example) and engine's `validateArena` treats as walls; ragged rows are refused with the row named (`check/validate/row-lengths/`). **A model may describe the arena as shapes instead of rows** (`ArenaPipelineDependencies.format`, `rows` by default; `arena-shapes/`: a size and rectangles that `CompileArenaShapes` draws into the same rows, which the same check then judges; the format list, its prompts and reply schemas are in `arena-drafting/format/`); an experiment (2026-11-19) while the choice waits for the Haiku comparison. Built-ins are injected (`builtInArenas`). The arena evals (`src/evals/dsl/arena/`, `src/evals/tests/arena/`) have no paid tier yet; a paid arena run needs the user's cost review first.
- Nothing judges which arena is played: the players pick (decided 2026-11-18). `src/pipeline/arena-submission/` (entry `ScreenArenaSubmissions.ts`) screens each submission with the arena pipeline's own pre-check and moderation (a built-in submission only has to exist) and leaves none, one or two survivors. The pure rule for the players' choices (pick an arena, pick nothing, or random; the table is in `docs/ai-pipeline.md`) is engine's `arena-picking/ResolveArenaPicks.ts` (moved there 2026-11-19; `ai/` keeps no copy). The evals (`src/evals/dsl/arena-submission/`, `src/evals/tests/arena-submission/`) have no paid tier.
- **Eval layout (the user, 2026-11-18):** `dsl/<domain>/` for each of `weapon/`, `appearance/`, `arena/`, `arena-submission/` holds its `<Domain>Dsl.ts`, a `pipeline/` (the `*Pipeline` class, its `evaluators/` and `types/`) and `types/`; what every domain shares is `dsl/shared/` (`errors/`, `checks/`, `types/`), the top-level **`WeaponSmithDsl`** holds the four DSLs as members (`.weapon`, `.appearance`, `.arena`, `.arenaSubmission`, as acceptance's `GunsmithDsl` holds its components) and `dsl/types/` its drivers (`EvalDrivers`) and `AnyTrialDsl`, so every other folder in `dsl/` is one DSL, and each DSL is a `TrialDsl` (`domain`, `trials`, `forTrial()`: a fresh DSL over a one-trial view of the same driver), and a helper two domains share stays with the domain that owns it (the appearance drawing checks the weapon also runs). `eval-criteria-mapping/` is the entry `EvalCriteriaMapping.ts`, **which defines what a spec may say** (`given`, `when` and `when.each`, `eachTrial`, `beforeAll`, `thenExpect`, `expect`: short, readable, no barrel) with the types of their signatures in `types/`, and **`mapping/`**, the helpers behind them: `run/` (`EvalRun`, the state of the spec file being loaded, which the verbs read and write, and `CurrentEvalRun`, the one per file; `fold-trials/` folds the rows of a criterion's trials into one, pass^k), `criterion/` (registering and running one criterion), and `trial/` (`defineTrials`, the scope of each trial), **`environment/`** (how a run is configured, reported and kept, the same for every domain: `tier/`, laid out as the setups are (`local/` the shared Ollama model, `paid/` its key and spend, `shared/` the tier type, the trial count and `ParseEvalTier`, `unreachable/` the helper that ends every tier chain; the fake tier needs nothing environment-wide, so it has no folder), `gate/`, `reporting/`, `archive/`) and **`setups/<domain>/`** (what one pipeline's scenario needs, so it knows its domain), laid out like `dsl/`: a folder per tier, **`fake/`**, **`local/`**, **`paid/`**, and **`shared/`** for what every tier of the domain uses (the base driver, the built-in arenas, and what is kept to look at: the appearance's `drawings/` contact sheet, the arena's `arenas/`). **A driver is an abstract class in `shared/`** (`WeaponPipelineEvalDriver`, `AppearanceEvalDriver`, `ArenaPipelineEvalDriver`, `ArenaSubmissionEvalDriver`) that implements its DSL's driver interface (the DSL keeps the interface: it is the seam that keeps the DSL from knowing any model) and holds the baseline: models built on the first request, the trial count, what is kept. **Each tier is a subclass in its own folder** (`FakeWeaponPipelineEvalDriver`, `LocalAppearanceEvalDriver`, `PaidWeaponPipelineEvalDriver`, …) that overrides only what differs: `createModels`, and the hooks `runThrough` (the weapon: the paid tier checks the ledger and logs around the pipeline, after its models and so its key exist) or `beforeRequest` / `afterOutcome` (the appearance: the paid tier checks the ledger and refuses a failed call before the drawing is kept). A tier passes its defaults up in the constructor (`super(...)`), never as a field the base reads, because a subclass's fields do not exist yet while the base is built. `drivers/CreateEvalDrivers.ts` is the one place that names a tier; it ends in `unreachableTier` and its test pins every tier-to-class pairing, since a wrong pairing keeps every check green while a local run uses canned answers or spends the ledger. The paid arena classes exist and say there is no paid tier yet when used (not when built), because the mapping builds every driver when a spec file loads. A weapon-only name carries the prefix its siblings have (`WeaponEvalInput`, `WeaponModerationFakeModel`).
- Evals import only downwards: `tests/` → `eval-criteria-mapping/` → `dsl/`. Specs import the mapping only.
- The mapping owns model/test-runner setup and drivers. A `*Dsl` only wraps lower pipeline-class calls in contextual `DslError`; no loops, filtering or evaluators there. Pipeline classes throw plain failures; pure evaluators/trial folding are independently unit-tested beneath them.
- A request runs once in each trial's `beforeAll`. Every criterion of that trial reads that one answer; every trial must pass. Keep deterministic evaluators independent of pipeline constants so they can detect bad enforcement.
- `src/graph/` and `src/worker/` contain hosting/trace proofs, not the production API. `ai/langgraph.json` registers `weaponProof` and `weaponSmith` (the real `createWeaponGraph` on canned models, for `langgraphjs dev`; it must not import `src/evals/`). Check actual Worker CPU and tracing behavior during integration.

Use current source, adjacent tests and [design decisions](../docs/agent-reference/SessionDecisions.md) when extending the pipeline.

## How a test reads

```ts
given("a player asks the weapon smith for a real weapon", () => {
  when("the player asks for a mild rifle", ({weaponSmith}) => {
    eachTrial(weaponSmith.weapon, weapon => {
      // reads back as "trial 1 of 3", each with a fresh DSL
      beforeAll(() => weapon.ask("a mild rifle")); // one request, once, for this trial

      thenExpect("the weapon smith creates a weapon", () => {
        expect(weapon.getStatus()).toBe("created"); // the spec states the assertion; the DSL reads, the pipeline asks
      });

      when("the weapon is rated", () => {
        // nested: free, reads the same answer
        thenExpect("its damage per second is inside the cap of 150", () => {
          expect(weapon.getDamagePerSecond()).toBeLessThanOrEqual(150);
        });
      });
    });
  });
});
```

**Wording (the user, 2026-11-18): exact, not generic.** The report reads `given …` / `when …` / `then …`, so each says its own part:
the **`given`** is the case and what must hold for it (who sends what kind of input, and what the pipeline must do with that kind); the **`when`**
is the action, the request actually made, with what is special in its text (the prompt if short, else its gist); the **`thenExpect`** is one observable
result **worded to what its check really sees**, with the number or state in it ("at most one model call (moderation)", "code balanced the weapon, with
no repair by the model"), never a bare "is shown" or "is created" where the check is narrower or wider. A criterion whose title claims more than its
check does is a bug in one of the two. Every `when` states its own expectation in a `thenExpect`; one with none is a hidden test.

**What holds whatever is asked** (safe to show, the fixed path within the call budget, and a domain's own always-on checks) is one function at the bottom of each spec file (`expectDefaultPipelineBehaviour(weapon)`, below its callers), called last in every trial, with the same words in every spec of the domain (decided 2026-11-19: the duplication is cheaper than a hidden registry, and each spec keeps its own copy beside it, where it can change); its parameter type is the trial's DSL, imported as a type from its DSL file (the one import lint lets a spec make besides the mapping). A spec states what is special to its request above them. A plain reading (`getStatus()`, `getDamagePerSecond()`, `getModelCalls()`, `getNodes()`, `getOutputTokens()`, `getSurvivingPrompts()`, `wasRefunded()`) is asserted in the spec, so the number is in the spec (the weapon specs say `toBe(0)` for a request the pre-check turns away, `toBeLessThanOrEqual(5)` for the budget, `getNodes()` containing `"balance"` and not `"repair"` for a weapon code balanced); a composite rule (schema, name hygiene, prompt leak, playable arena) is a named DSL `get<Rule>Problems()` that returns what is wrong, asserted in the spec as `expect(weapon.getSafeToShowProblems()).toEqual([])`, so a failure prints the reasons. Each stage retains its current call budget until integration deliberately changes the combined contract.

- A **`when`** is one request. `eachTrial(weaponSmith.<domain>, trial => {…})` gives each trial the tier runs (that DSL's `trials`) a scope of its own with a fresh DSL; the request is asked once in that scope's `beforeAll` (not `beforeEach`: a model call costs time and money) and its **`thenExpect`s** each state one criterion and read that answer. Lint stops a `thenExpect` from calling any `ask…`. A criterion holds only if it held in **every** trial (pass^k): the results fold the rows of a criterion's trials into one, and a failure is one sentence naming the check and why, with the trials it failed in: `failed in 1 of 3 trials: 2000 damage per second is over 150`. A `when` inside a trial's scope is a free group (`outer › inner` in the results); `when.each(table, name, define)` is a `when` once per row, each row carrying its `why`.
- `given.inProgress(...)` is a hill to climb (tracked, not gated under `EVAL_GATE=regression`); a plain `given` is a regression.
- A test imports the mapping and nothing else: no pipeline, evaluator, model or vitest (`expect` comes from the mapping). To check something new, add a
  `…Problems()` method to the pipeline class (built from a pure evaluator) and a thin `get…Problems()` wrapper to the DSL, and assert it in the spec with `toEqual([])`; to read a number or a status, add a plain `get…` and assert it in the spec. Unit tests are kept only for pure logic that can quietly be wrong (the verdict evaluators, trial folding, the spend ledger and guard), as in `acceptance-tests/`; the DSL, pipeline classes, drivers and fakes are tested by the evals running.
- **Why `thenExpect` and not `then`:** a module that exports `then` is a thenable, so Vitest's `await import` calls it with the
  promise machinery's functions and the test file never loads (Playwright's CommonJS loading hides this in `acceptance-tests/`).
  The report still prints `then <criterion>`.
- Preserve serial eval execution and configured hook timeouts: a timed-out request can skip the criteria beneath it.

## Eval-driven development (the way work is done here, like ATDD but with evals)

1. **Write the criterion first** as a `when` and its `thenExpect`s in the test file that fits (or a new one), with a comment naming the
   failure it catches.
2. **Run it and watch it fail for the right reason** (`pnpm evals:local`; `evals:fake` proves only the harness).
3. **Build the smallest node or prompt change** that turns it green. Core logic is also unit-tested first as usual.
4. **Mutation proof:** degrade the prompt, drop a node or swap in a weaker model; the criteria that guard it must fall (name them).
   If none does, the eval measures nothing. The mapping and DSL are proved the same way (break the gate: the fake tier must stay red).
5. Only then validate on the paid tier, once per turn at most, if the change could behave differently on Haiku.

## Rules

- **Suite size follows the research, not a cap** (start with tasks from real failures). Add a `when` only for a real or probed failure, never to pad. Make every feature a plain `given`
  (near 100%, gates CI) or `given.inProgress` (a hill to climb). One deterministic evaluator per failure mode, no cap.
- **Binary, deterministic evaluators first**, written independently of the code they check (the caps in `WithinCaps.ts` are not
  imported from the pipeline). `engine/` and `shared/` are shared resources (the user, 2026-11-18), so an evaluator may call the engine
  (`PlayableArena` judges with `validateArena`, as the pipeline does); the independence is from `ai/src`, so a pipeline that stops checking is still caught. A model judge is **deferred** until a real failure needs one, then calibrated on about 50 human-rated examples.
- Local-model/SDK limitations and earlier prompt ablations must be checked against the current runner and adjacent tests. Recheck the current runner before changing generation strategy; failed formatting support in one runner does not establish model capability.
- **Three tiers, each a driver class per domain (see the layout above; `EVAL_TIER` unset means `local`, which calls the free Ollama model, so a hand-run spec needs `EVAL_TIER=fake` to stay offline):** `fake` (checks, free), `local` (Ollama `qwen3.5:9b`, free, the working loop),
  `paid` (Haiku 5.5, weapon and appearance specs: the key comes from `ANTHROPIC_API_KEY` or the git-ignored `ai/.env.local`, never printed, loaded by
  `environment/tier/paid/key/LoadAnthropicKey`; a ledger in `src/evals/results/paid-spend-latest.json` adds up the cost of every paid run from the tokens reported and stops at
  the **$1 total ceiling**; ask before raising it; Haiku 5.5 refuses `temperature`). **Every paid model carries the one `paidSpendGuard()`** (never a second:
  it is what adds into the one ledger and remembers the failures of either model). The weapon's two paid models are `setups/weapon/paid/models/PaidWeaponModels`, with a
  token cap far above need (2000), because a tool call cut off by `maxTokens` fails to parse and moderation then fails closed, which a report would read as a
  model that over-rejects. **A paid weapon request goes through `setups/weapon/paid/run/RunPaidWeapon`**, which checks there is room first, then **fails the run in words**
  when a paid call errored or an answer stopped at `max_tokens`, because the pipeline swallows both and they read as "a bad weapon" or "rejected", and which
  logs each request's calls (tokens, stop reason, latency) to `src/evals/results/paid-weapon-calls-latest.jsonl` (git-ignored; it appends, so move it aside to
  start a baseline). Paid weapon runs are 1 trial unless `EVAL_TRIALS=3`; a 1-trial run is a smoke test, because Haiku has no `temperature` to pin.
  **Scores do not transfer between tiers.**
- **The specs use native Vitest, not `langsmith/vitest`** (decided 2026-11-19): its `ls.describe` cannot nest and its `ls.test` loses its context inside a native `describe`, and the nested scopes are what the specs need. LangChain's own tracing is a separate, environment-driven setting (`LANGSMITH_TRACING`); eval traces share the free plan's 5,000 a month with production, so keep it off for evals. Experiments and per-commit comparison in LangSmith are not wired: if wanted, upload the results JSON with the LangSmith client after a run.
- **`given` / `when` / `thenExpect` are not unit-test `describe` / `it`.** The "no top-level `describe`" rule (root `AGENTS.md`) is for
  unit tests only; acceptance-style tests are the opposite case, their nesting **is** the specification. Unit tests, including the
  evaluators' and the DSL's, stay flat `it(...)`.
- Schema validation is separate from model generation: parse untrusted output, preserve field types and let code enforce limits. The engine owns deterministic rating/balancing; AI parses preferences and invokes it before final rating. Do not silently change either policy while editing prompts.
- Model output is `unknown` until zod has parsed it; the AI proposes, the engine disposes.
- Schemas and caps here are **drafts** until the domain owner and real consumers review the contracts in `HANDOFF.md`. The appearance schema moved to `shared/` (the webapp is its consumer); other schemas stay local, and nothing else goes to `shared/` without a second consumer.

## Commands

`pnpm --filter @gunsmith/ai checks` (the gate), `... evals:fake`, `... evals:local`, `... evals:paid`, `... dev` (Agent Server and Studio).
Environment for the evals: `EVAL_TIER` (`fake`, `local`, `paid`), `EVAL_ARENA_FORMAT` (`rows` by default or `shapes`; the local arena driver only), `EVAL_TRIALS` (runs per case; default 3 local for weapons, 1 for drawings, 1 otherwise),
`EVAL_KEEP_DRAWINGS` and `EVAL_KEEP_ARENAS` (keep every drawing, or every arena, of the run in `src/evals/results/drawings-<tier>-latest.json` or `arenas-<tier>-latest.json` and a page to look at, `.html`; **on by default for the local tier** (the user, 2026-11-18), off for the fake and paid tiers; `1` forces it on, `0` off),
`EVAL_GATE=regression` (only `regression` cases fail the run; what CI will use).
**Archive (the user, 2026-11-18):** every `evals:*` run also keeps its results for good in the **main checkout's** `private-source/eval-results/<YYYYMMDD-HHMMSS>-<commit>[-uncommitted]/`
(`<Spec>-<tier>.json` per spec, and `drawings-<tier>.json` / `.html` and `arenas-<tier>.json` / `.html` when they are kept, so a local run's generated drawings and arenas are in the archive; the arenas of every arena spec file of a run share one page). The `evals:*` scripts set `EVAL_RUN_ID` (a run started by
hand archives nothing); `EVAL_ARCHIVE=0` switches it off; it does nothing when the main checkout has no `private-source/` (CI, a fresh clone). The folder is found
through git's common directory, so a worktree's runs survive its removal; `-uncommitted` marks results from code no commit contains, and a run's first file names its
folder. `src/evals/results/*-latest.*` stay as before (git-ignored, overwritten by the next run). The paid call log and spend ledger are running files, not archived.
