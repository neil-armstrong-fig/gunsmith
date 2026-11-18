import * as ls from "langsmith/vitest";
import {isGating} from "@evals/eval-criteria-mapping/environment/gate/IsGating";
import {evalRun} from "@evals/eval-criteria-mapping/mapping/run/CurrentEvalRun";
import type {RunCriterion} from "@evals/eval-criteria-mapping/types/RunCriterion";
import type {WhenContext} from "@evals/eval-criteria-mapping/mapping/types/WhenContext";

/**
 * Runs one criterion and records how it came out. A red one fails the run unless it is in progress and the run is not gating
 * (`EVAL_GATE`): then it is reported and the run goes on, because a hill still being climbed is red by definition.
 */
export async function runCriterion(whenContext: WhenContext, description: string, check: RunCriterion): Promise<void> {
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
    evalRun.record({...criterion, passed: false, comment});
    ls.logFeedback({key: "criterion", score: 0, comment});

    if (isGating(whenContext.suite, process.env.EVAL_GATE)) {
      throw error;
    }

    console.warn(`in-progress "when ${whenContext.description}, then ${description}" is red (not gating): ${comment}`);

    return;
  }

  evalRun.record({...criterion, passed: true});
  ls.logFeedback({key: "criterion", score: 1});
}
