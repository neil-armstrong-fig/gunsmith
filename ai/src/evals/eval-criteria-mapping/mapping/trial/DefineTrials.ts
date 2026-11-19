import {describe} from "vitest";
import type {AnyTrialDsl} from "@evals/dsl/types/AnyTrialDsl";
import type {TrialDsl} from "@evals/dsl/shared/types/TrialDsl";
import type {EvalRun} from "@evals/eval-criteria-mapping/mapping/run/EvalRun";

/**
 * Gives each trial of a request a scope of its own: `trial 1 of 3`, each with a fresh DSL (so a trial holds only its own answer and
 * its criteria read that answer) and its own `beforeAll`. A criterion holds only if it held in every scope (pass^k).
 */
export function defineTrials<Dsl extends AnyTrialDsl & TrialDsl<Dsl>>(
  run: EvalRun,
  dsl: Dsl,
  define: (trial: Dsl) => void,
): void {
  const when = run.requireWhen("eachTrial");
  if (run.isInTrial()) {
    throw new Error("`eachTrial` belongs directly inside a `when`, not inside another trial's scope.");
  }

  run.noteTrialDomain(dsl.domain);

  for (let trial = 1; trial <= dsl.trials; trial += 1) {
    describe(`trial ${trial} of ${dsl.trials}`, () => {
      const source: TrialDsl<Dsl> = dsl;
      const forTrial = source.forTrial();

      run.runInScope(when, () => define(forTrial));
    });
  }
}
