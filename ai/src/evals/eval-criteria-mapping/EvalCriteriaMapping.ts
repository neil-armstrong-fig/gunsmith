import * as ls from "langsmith/vitest";
import {beforeAll as runBeforeAll, describe} from "vitest";
import {registerCriterion} from "@evals/eval-criteria-mapping/mapping/criterion/RegisterCriterion";
import {evalRun} from "@evals/eval-criteria-mapping/mapping/run/CurrentEvalRun";
import {createTrackedFixtures} from "@evals/eval-criteria-mapping/mapping/when/CreateTrackedFixtures";
import {registerStandingCriteria} from "@evals/eval-criteria-mapping/mapping/when/RegisterStandingCriteria";
import type {DefineGiven} from "@evals/eval-criteria-mapping/types/DefineGiven";
import type {DefineWhen} from "@evals/eval-criteria-mapping/types/DefineWhen";
import type {EvalSuite} from "@evals/eval-criteria-mapping/types/EvalSuite";
import type {GivenBlock} from "@evals/eval-criteria-mapping/types/GivenBlock";
import type {RunCriterion} from "@evals/eval-criteria-mapping/types/RunCriterion";

// What a spec may say, and nothing else: a spec imports only this file (lint). The four verbs are defined here; the state they share
// (the run of the spec file being loaded) and the criterion machinery behind them are in `mapping/`.

/**
 * `given` reads back in the report as the case a spec covers, as the acceptance specs' does. It is a native `describe` underneath.
 * A plain `given` is a regression; `given.inProgress` is a hill to climb, and every `when` in it takes its suite from it.
 */
export const given: GivenBlock = Object.assign(
  (description: string, define: DefineGiven): void => defineGiven("regression", description, define),
  {inProgress: (description: string, define: DefineGiven): void => defineGiven("inProgress", description, define)},
);

/**
 * `when` reads back in the report as the request a spec makes. It is a LangSmith `ls.describe` underneath (the wrapper cannot nest,
 * and a `when` is the right grain for a LangSmith dataset: one scenario, one example per `then`). Its body is handed the DSLs it
 * may talk to, one of each per `when`.
 */
export function when(description: string, define: DefineWhen): void {
  ls.describe(`when ${description}`, () => {
    const whenContext = evalRun.beginWhen(description);
    const tracked = createTrackedFixtures(evalRun.drivers);

    define(tracked.fixtures);
    registerStandingCriteria(whenContext, tracked);
    evalRun.endWhen(tracked.taken()[0]);
  });
}

/**
 * The request a `when` names, carried out once before its `then`s. It is `beforeAll` and not `beforeEach` (the acceptance
 * specs' word) on purpose: a model call costs time and money, so the request runs once, for all its trials, and every `then`
 * reads those same answers. A `then` must therefore not ask anything itself; lint stops it.
 */
export function beforeAll(arrange: RunCriterion): void {
  evalRun.requireWhen("beforeAll");

  runBeforeAll(() => arrange());
}

/**
 * One criterion: what must be true of the answers. It holds only if it held in every trial, and it reads back in the report as
 * `then <description>`. It is not called `then`, as the acceptance specs' mapping is: a module that exports `then` is a thenable,
 * so Vitest's `await import` calls it with the promise machinery's resolve and reject functions and the spec file never loads
 * (Playwright loads specs as CommonJS, which hides this there).
 */
export function thenExpect(description: string, check: RunCriterion): void {
  registerCriterion(evalRun.requireWhen("thenExpect"), description, check);
}

/** Every `when` in a `given` takes its suite from it: a feature is in progress as a whole, never one scenario at a time. */
function defineGiven(suite: EvalSuite, description: string, define: DefineGiven): void {
  describe(suite === "inProgress" ? `given (in progress) ${description}` : `given ${description}`, () => {
    evalRun.beginGiven(description, suite);
    define();
  });
}
