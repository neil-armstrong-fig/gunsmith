# How an eval run works

Drawn from `ai/package.json`, `ai/vitest.evals.config.ts`, `ai/src/evals/eval-criteria-mapping/` and `ai/src/evals/dsl/`.

```mermaid
flowchart TD
  cmd["pnpm evals:fake / evals:local / evals:paid<br/>sets EVAL_TIER and EVAL_RUN_ID"]
  vitest["Vitest runs src/evals/**/*.eval.ts<br/>one spec file at a time, tree reporter"]
  run["CurrentEvalRun: new EvalRun(EVAL_TIER, EVAL_TRIALS)"]
  drivers{"createEvalDrivers(tier)"}
  fake["fake: canned models<br/>1 trial, deterministic"]
  local["local: Ollama qwen3.5:9b, temperature 0<br/>3 trials, canned drawing"]
  paid["paid: Haiku<br/>1 trial, spend ledger"]
  spec["given (regression) or given.inProgress<br/>then when / when.each"]
  trial["eachTrial(weaponSmith.weapon / arena / appearance)<br/>one 'trial k of N' scope each, fresh DSL from forTrial()"]
  ask["beforeAll: dsl.ask(prompt)<br/>DSL → Pipeline → driver.run"]
  guard["paid only: runPaidRequest<br/>ledger.assertRoom(), call log,<br/>throws on a failed call or a max_tokens cut-off"]
  pipelineRun["generateWeapon / generateArena / generateAppearance<br/>the real pipeline: weapon and arena graphs"]
  answer["the trial's one answer, held by the Pipeline"]
  then["thenExpect: registerCriterion → runCriterion<br/>a DSL getter runs pure evaluators over the answer"]
  passed{"criterion held?"}
  recordPass["evalRun.record: passed"]
  recordFail["evalRun.record: failed, with the reason"]
  gate{"isGating(suite, EVAL_GATE)"}
  fail["test fails, so the run fails"]
  warn["recorded red, warned, run goes on"]
  after["afterAll: resultsRun → foldTrials<br/>pass^k: one row per then, 'failed in 2 of 3 trials'"]
  write["writeEvalResults<br/>src/evals/results/Spec-tier-latest.json"]
  archive["archiveEvalResult<br/>private-source/eval-results/ in the main checkout, if present"]

  cmd --> vitest --> run --> drivers
  drivers --> fake
  drivers --> local
  drivers --> paid
  fake --> spec
  local --> spec
  paid --> spec
  spec --> trial --> ask
  ask -->|"fake / local"| pipelineRun
  ask -->|"paid"| guard --> pipelineRun
  pipelineRun --> answer --> then --> passed
  passed -->|"yes"| recordPass
  passed -->|"no"| recordFail --> gate
  gate -->|"regression, or inProgress without EVAL_GATE=regression"| fail
  gate -->|"inProgress with EVAL_GATE=regression"| warn
  recordPass --> after
  fail --> after
  warn --> after
  after --> write --> archive
```

- **Tiers measure different things.** The fake tier proves the wiring, the local tier is a free loop that cannot be fully repeated, and
  the paid tier is the real model. Scores do not carry over from one tier to another. `EVAL_TRIALS` overrides the tier's trial count.
- **A trial runs its request once.** The `beforeAll` asks, and every `then` in that trial reads the same answer. A criterion holds only
  if it held in every trial.
- **The evaluators are pure code:** `schemaValid`, `withinCaps`, `nameHygiene`, `drawnWhenCreated`, `noPromptLeak`, `nodePath` and the
  arena and drawing ones beside them under `ai/src/evals/dsl/<domain>/pipeline/evaluators/`. No model judges an answer yet.
- The arena and drawing drivers also keep what was made as contact sheets (`*-latest.html`) next to the JSON.

The [layers a spec talks through](eval-layers.md) show the same run from the spec's side.
