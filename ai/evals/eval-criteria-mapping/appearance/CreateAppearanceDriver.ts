import {generateAppearance} from "@gunsmith/ai/pipeline/appearance/GenerateAppearance";
import type {AppearanceDriver} from "@evals/dsl/appearance/types/AppearanceDriver";
import {createAppearanceModels} from "@evals/eval-criteria-mapping/appearance/models/CreateAppearanceModels";
import {keepDrawing} from "@evals/eval-criteria-mapping/appearance/drawings/KeepDrawing";
import {startDrawings} from "@evals/eval-criteria-mapping/appearance/drawings/StartDrawings";
import {paidSpendGuard} from "@evals/eval-criteria-mapping/tier/paid/spend/PaidSpendGuard";
import {paidSpendLedger} from "@evals/eval-criteria-mapping/tier/paid/spend/PaidSpendLedger";
import {trialCount} from "@evals/eval-criteria-mapping/tier/trials/TrialCount";
import type {EvalTier} from "@evals/eval-criteria-mapping/tier/types/EvalTier";

// A drawing takes the local model about half a minute (two calls of a thousand tokens), against a few seconds for a weapon, so
// one trial keeps the whole local run to a few minutes. `EVAL_TRIALS=3` brings back the repeated trials when it is worth the wait.
const APPEARANCE_LOCAL_TRIALS = 1;
const RESULTS_FOLDER = "evals/results";

/** The real appearance pipeline on one tier's model, run as many times as the tier (or `EVAL_TRIALS`) asks. */
export function createAppearanceDriver(tier: EvalTier, requestedTrials: string | undefined): AppearanceDriver {
  const appearanceDependencies = createAppearanceModels(tier);
  const keep = {folder: RESULTS_FOLDER, tier, enabled: process.env.EVAL_KEEP_DRAWINGS === "1"};
  let started = false;

  return {
    trials: trialCount(tier, requestedTrials, APPEARANCE_LOCAL_TRIALS),
    run: async prompt => {
      // Started at the first request, not when the driver is built: every spec file builds this driver, and one that never
      // draws must not empty the drawings an earlier spec just kept.
      if (!started) {
        startDrawings(keep);
        started = true;
      }

      // The spend guard inside the model stops a call, but the pipeline reads a failed call as "no answer" and falls back, which
      // would look like a weak model. Checking here before each request makes running out of room fail the run in words.
      if (tier === "paid") {
        paidSpendLedger().assertRoom();
      }

      const outcome = await generateAppearance({prompt}, appearanceDependencies);
      const failure = tier === "paid" ? paidSpendGuard().takeFailure() : undefined;
      if (failure !== undefined) {
        throw new Error(`A paid model call failed, so this result says nothing about the drawing: ${failure}`);
      }

      keepDrawing({...keep, drawing: {prompt, outcome}});

      return outcome;
    },
  };
}
