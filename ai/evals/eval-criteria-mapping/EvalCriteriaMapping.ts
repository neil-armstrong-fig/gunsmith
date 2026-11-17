import * as ls from "langsmith/vitest";
import {afterAll, beforeAll as runBeforeAll, describe, expect} from "vitest";
import {createAppearanceDriver} from "@evals/eval-criteria-mapping/appearance/CreateAppearanceDriver";
import {createWeaponPipelineDriver} from "@evals/eval-criteria-mapping/weapon/CreateWeaponPipelineDriver";
import {parseEvalTier} from "@evals/eval-criteria-mapping/tier/ParseEvalTier";
import {AppearanceDsl} from "@evals/dsl/appearance/AppearanceDsl";
import {WeaponSmithDsl} from "@evals/dsl/WeaponSmithDsl";
import {TrackedFixtures} from "@evals/eval-criteria-mapping/fixtures/TrackedFixtures";
import {isGating} from "@evals/eval-criteria-mapping/gate/IsGating";
import type {RunCriterion} from "@evals/eval-criteria-mapping/types/RunCriterion";
import type {FixtureName} from "@evals/eval-criteria-mapping/types/FixtureName";
import type {DefineGiven} from "@evals/eval-criteria-mapping/types/DefineGiven";
import type {DefineWhen} from "@evals/eval-criteria-mapping/types/DefineWhen";
import type {GivenBlock} from "@evals/eval-criteria-mapping/types/GivenBlock";
import type {WhenContext} from "@evals/eval-criteria-mapping/types/WhenContext";
import {specNameOf} from "@evals/eval-criteria-mapping/reporting/spec-name/SpecNameOf";
import type {CriterionResult} from "@evals/eval-criteria-mapping/reporting/types/CriterionResult";
import {writeEvalResults} from "@evals/eval-criteria-mapping/reporting/WriteEvalResults";
import type {EvalSuite} from "@evals/eval-criteria-mapping/types/EvalSuite";

// The tier is chosen once per run (`EVAL_TIER`), and each spec file keeps its own results, written when the file is done.
const tier = parseEvalTier(process.env.EVAL_TIER);
const weaponDriver = createWeaponPipelineDriver(tier, process.env.EVAL_TRIALS);
const appearanceDriver = createAppearanceDriver(tier, process.env.EVAL_TRIALS);
const results: CriterionResult[] = [];
let currentGiven = "";
let currentSuite: EvalSuite = "regression";
let currentWhen: WhenContext | undefined;
let firstTaken: FixtureName | undefined;

afterAll(() => {
  writeEvalResults({
    spec: specNameOf(expect.getState().testPath),
    tier,
    trials: firstTaken === "appearance" ? appearanceDriver.trials : weaponDriver.trials,
    ranAt: new Date().toISOString(),
    results,
  });
});

/**
 * `given` / `when` / `then` read back in the report as the criteria a spec was written from, like the acceptance specs do.
 * `given` and `when` are native `describe` blocks underneath, except that each `when` is a LangSmith `ls.describe` (the wrapper
 * cannot nest, and a `when` is the right grain for a LangSmith dataset: one scenario, one example per `then`).
 */
export const given: GivenBlock = Object.assign(
  (description: string, define: DefineGiven): void => defineGiven("regression", description, define),
  {inProgress: (description: string, define: DefineGiven): void => defineGiven("inProgress", description, define)},
);

/** Every `when` in a `given` takes its suite from it: a feature is in progress as a whole, never one scenario at a time. */
function defineGiven(suite: EvalSuite, description: string, define: DefineGiven): void {
  describe(suite === "inProgress" ? `given (in progress) ${description}` : `given ${description}`, () => {
    currentGiven = description;
    currentSuite = suite;
    define();
  });
}

export function when(description: string, define: DefineWhen): void {
  ls.describe(`when ${description}`, () => {
    const whenContext: WhenContext = {given: currentGiven, description, suite: currentSuite};
    // One of each DSL per `when`, so its `then`s share the answers its `beforeAll` asked for, and no other `when` does.
    const tracked = new TrackedFixtures({
      weaponSmith: new WeaponSmithDsl(weaponDriver),
      appearance: new AppearanceDsl(appearanceDriver),
    });

    currentWhen = whenContext;
    define(tracked.fixtures);
    registerStandingCriteria(whenContext, tracked);
    firstTaken ??= tracked.taken()[0];
    currentWhen = undefined;
  });
}

/**
 * The request a `when` names, carried out once before its `then`s. It is `beforeAll` and not `beforeEach` (the acceptance
 * specs' word) on purpose: a model call costs time and money, so the request runs once, for all its trials, and every `then`
 * reads those same answers. A `then` must therefore not ask anything itself; lint stops it.
 */
export function beforeAll(arrange: RunCriterion): void {
  requireWhen("beforeAll");

  runBeforeAll(() => arrange());
}

/**
 * One criterion: what must be true of the answers. It holds only if it held in every trial, and it reads back in the report as
 * `then <description>`. It is not called `then`, as the acceptance specs' mapping is: a module that exports `then` is a thenable,
 * so Vitest's `await import` calls it with the promise machinery's resolve and reject functions and the spec file never loads
 * (Playwright loads specs as CommonJS, which hides this there).
 */
export function thenExpect(description: string, check: RunCriterion): void {
  registerCriterion(requireWhen("thenExpect"), description, check);
}

/** What holds whatever was asked is each DSL's to say; the mapping only reports it under every `when`, after the test's own criteria. */
function registerStandingCriteria(whenContext: WhenContext, tracked: TrackedFixtures): void {
  for (const criterion of tracked.standingCriteria()) {
    registerCriterion(whenContext, criterion.description, () => criterion.expect());
  }
}

function registerCriterion(whenContext: WhenContext, description: string, check: RunCriterion): void {
  const inputs = {given: whenContext.given, when: whenContext.description, then: description};

  ls.test(`then ${description}`, {inputs}, async () => {
    await runCriterion(whenContext, description, check);
  });
}

function requireWhen(caller: string): WhenContext {
  if (currentWhen === undefined) {
    throw new Error(`\`${caller}\` belongs inside a \`when\`.`);
  }

  return currentWhen;
}

async function runCriterion(whenContext: WhenContext, description: string, check: RunCriterion): Promise<void> {
  const criterion = {
    given: whenContext.given,
    when: whenContext.description,
    then: description,
    suite: whenContext.suite,
  };

  try {
    await check();
  } catch (error) {
    const comment = error instanceof Error ? error.message : String(error);
    results.push({...criterion, passed: false, comment});
    ls.logFeedback({key: "criterion", score: 0, comment});

    if (isGating(whenContext.suite, process.env.EVAL_GATE)) {
      throw error;
    }

    console.warn(`in-progress "when ${whenContext.description}, then ${description}" is red (not gating): ${comment}`);

    return;
  }

  results.push({...criterion, passed: true});
  ls.logFeedback({key: "criterion", score: 1});
}
