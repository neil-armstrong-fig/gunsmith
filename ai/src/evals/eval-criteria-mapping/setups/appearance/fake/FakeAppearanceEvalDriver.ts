import type {AppearanceDependencies} from "@gunsmith/ai/pipeline/appearance/types/AppearanceDependencies";
import {fakeAppearanceGenerator} from "@evals/eval-criteria-mapping/setups/appearance/fake/FakeAppearanceGenerator";
import {AppearanceEvalDriver} from "@evals/eval-criteria-mapping/setups/appearance/shared/AppearanceEvalDriver";

/** The appearance pipeline on a model that draws one valid drawing every time: deterministic, so one trial, and nothing worth keeping. */
export class FakeAppearanceEvalDriver extends AppearanceEvalDriver {
  constructor(requestedTrials: string | undefined) {
    super({tier: "fake", requestedTrials, defaultTrials: 1, keepsGeneratedByDefault: false});
  }

  protected createModels(): AppearanceDependencies {
    return {generator: fakeAppearanceGenerator()};
  }
}
