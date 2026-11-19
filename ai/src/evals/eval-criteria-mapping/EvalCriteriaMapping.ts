import {beforeAll as runBeforeAll} from "vitest";
import type {AnyTrialDsl} from "@evals/dsl/types/AnyTrialDsl";
import type {TrialDsl} from "@evals/dsl/shared/types/TrialDsl";
import {registerCriterion} from "@evals/eval-criteria-mapping/mapping/criterion/RegisterCriterion";
import {evalRun} from "@evals/eval-criteria-mapping/mapping/run/CurrentEvalRun";
import {defineGiven} from "@evals/eval-criteria-mapping/mapping/given/DefineGiven";
import {defineTrials} from "@evals/eval-criteria-mapping/mapping/trial/DefineTrials";
import {defineEachWhen} from "@evals/eval-criteria-mapping/mapping/when/DefineEachWhen";
import {defineWhen} from "@evals/eval-criteria-mapping/mapping/when/DefineWhen";
import type {DefineGiven} from "@evals/eval-criteria-mapping/types/DefineGiven";
import type {GivenBlock} from "@evals/eval-criteria-mapping/types/GivenBlock";
import type {RunCriterion} from "@evals/eval-criteria-mapping/types/RunCriterion";
import type {WhenBlock} from "@evals/eval-criteria-mapping/types/WhenBlock";

// What a spec may say, and nothing else: a spec imports only this file (lint). The verbs are defined here; the state they share
// (the run of the spec file being loaded) and the criterion machinery behind them are in `mapping/`.

/** `expect`, so a criterion states its own assertion in the spec, as an acceptance `then` does: a spec cannot import Vitest. */
export {expect} from "vitest";

/**
 * `given` reads back in the report as the case a spec covers, as the acceptance specs' does. It is a native `describe` underneath.
 * A plain `given` is a regression; `given.inProgress` is a hill to climb, and every `when` in it takes its suite from it.
 */
export const given: GivenBlock = Object.assign(
  (description: string, define: DefineGiven): void => defineGiven("regression", description, define),
  {inProgress: (description: string, define: DefineGiven): void => defineGiven("inProgress", description, define)},
);

/**
 * `when` reads back in the report as the request a spec makes. It is a native `describe` underneath, handed the weapon smith, whose
 * members are the DSLs it may talk to. Inside a trial's scope (`eachTrial`) a `when` nests a group of criteria that read the same
 * answer, and costs no request. `when.each` is it once per item of a table, with each row carrying its reason.
 */
export const when: WhenBlock = Object.assign(defineWhen, {each: defineEachWhen});

/**
 * Runs the request a `when` names once for each trial the tier runs, each in a scope of its own (`trial 1 of 3`) with a fresh DSL that
 * holds only that trial's answer. A criterion holds only if it held in every trial (pass^k).
 */
export function eachTrial<Dsl extends AnyTrialDsl & TrialDsl<Dsl>>(dsl: Dsl, define: (trial: Dsl) => void): void {
  defineTrials(evalRun, dsl, define);
}

/**
 * The request a trial's scope carries out once before its `then`s. It is `beforeAll` and not `beforeEach` (the acceptance specs' word)
 * on purpose: a model call costs time and money, so the request runs once for the trial, and every `then` of that trial reads the same
 * answer. A `then` must therefore not ask anything itself; lint stops it.
 */
export function beforeAll(arrange: RunCriterion): void {
  evalRun.requireWhen("beforeAll");

  runBeforeAll(() => arrange());
}

/**
 * One criterion: what must be true of the answer. It reads back in the report as `then <description>`. It is not called `then`, as the
 * acceptance specs' mapping is: a module that exports `then` is a thenable, so Vitest's `await import` calls it with the promise
 * machinery's resolve and reject functions and the spec file never loads (Playwright loads specs as CommonJS, which hides this there).
 */
export function thenExpect(description: string, check: RunCriterion): void {
  registerCriterion(evalRun.requireWhen("thenExpect"), description, check);
}
