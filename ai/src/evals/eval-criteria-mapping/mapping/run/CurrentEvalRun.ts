import {afterAll, expect} from "vitest";
import {writeEvalResults} from "@evals/eval-criteria-mapping/environment/reporting/WriteEvalResults";
import {parseEvalTier} from "@evals/eval-criteria-mapping/environment/tier/shared/ParseEvalTier";
import {EvalRun} from "@evals/eval-criteria-mapping/mapping/run/EvalRun";

/**
 * The run of the spec file being loaded. Vitest gives every spec file its own copy of the modules, so each file has its own run, with
 * its own drivers, and its results are written when the file is done.
 */
export const evalRun = new EvalRun(parseEvalTier(process.env.EVAL_TIER), process.env.EVAL_TRIALS);

afterAll(() => {
  writeEvalResults(evalRun.resultsRun(expect.getState().testPath));
});
