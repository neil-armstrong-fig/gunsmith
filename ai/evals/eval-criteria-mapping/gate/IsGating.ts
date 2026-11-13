import type {EvalSuite} from "@evals/eval-criteria-mapping/types/EvalSuite";

/**
 * Whether a failed criterion fails the run. A `regression` criterion always does. A `capability` criterion does too, so a new one
 * is seen failing first, unless the run asks for `EVAL_GATE=regression` (what CI will use): then it is still run, scored and
 * reported, but only warned about.
 */
export function isGating(suite: EvalSuite, gateSetting: string | undefined): boolean {
  if (suite === "regression") {
    return true;
  }

  return gateSetting !== "regression";
}
