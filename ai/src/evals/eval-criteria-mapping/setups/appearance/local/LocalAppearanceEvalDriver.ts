import type {AppearanceDependencies} from "@gunsmith/ai/pipeline/appearance/types/AppearanceDependencies";
import {createLocalChatModel} from "@evals/eval-criteria-mapping/environment/tier/local/CreateLocalChatModel";
import {AppearanceEvalDriver} from "@evals/eval-criteria-mapping/setups/appearance/shared/AppearanceEvalDriver";

// A drawing takes the local model about half a minute (two calls of a thousand tokens), against a few seconds for a weapon, so
// one trial keeps the whole local run to a few minutes. `EVAL_TRIALS=3` brings back the repeated trials when it is worth the wait.
const APPEARANCE_LOCAL_TRIALS = 1;

/** The appearance pipeline on the local model, which keeps its drawings by default: a real model's drawings are worth looking at. */
export class LocalAppearanceEvalDriver extends AppearanceEvalDriver {
  constructor(requestedTrials: string | undefined) {
    super({tier: "local", requestedTrials, defaultTrials: APPEARANCE_LOCAL_TRIALS, keepsGeneratedByDefault: true});
  }

  // Not the weapon's settings: a drawing is about a thousand tokens, so the weapon's 400-token budget would cut it off, and at
  // temperature 0 every trial would be a copy of the first, which defeats trials (measured 2026-11-13). Thinking off, as for the weapon.
  protected createModels(): AppearanceDependencies {
    return {generator: createLocalChatModel({temperature: 0.7, numPredict: 3000})};
  }
}
