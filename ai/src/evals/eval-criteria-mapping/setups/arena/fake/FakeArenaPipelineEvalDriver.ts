import type {ArenaPipelineDependencies} from "@gunsmith/ai/pipeline/arena/types/ArenaPipelineDependencies";
import {ArenaGenerationFakeModel} from "@evals/eval-criteria-mapping/setups/arena/fake/models/ArenaGenerationFakeModel";
import {ArenaModerationFakeModel} from "@evals/eval-criteria-mapping/setups/arena/fake/ArenaModerationFakeModel";
import {ArenaPipelineEvalDriver} from "@evals/eval-criteria-mapping/setups/arena/shared/ArenaPipelineEvalDriver";

/** The arena pipeline on canned models: deterministic, so one trial, and nothing worth keeping. */
export class FakeArenaPipelineEvalDriver extends ArenaPipelineEvalDriver {
  constructor(requestedTrials: string | undefined) {
    super({tier: "fake", requestedTrials, defaultTrials: 1, keepsGeneratedByDefault: false});
  }

  protected createModels(): ArenaPipelineDependencies {
    return {
      generator: new ArenaGenerationFakeModel(),
      moderator: new ArenaModerationFakeModel(),
      // The canned generator answers in rows, so the graph must ask for rows; the default format would read them as shapes.
      format: "rows",
    };
  }
}
