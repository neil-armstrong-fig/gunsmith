import type {AppearanceOutcome} from "@gunsmith/ai/pipeline/appearance/types/AppearanceOutcome";

/** What an appearance evaluator is given: what the pipeline answered to one trial. */
export interface AppearanceEvalInput {
  outcome: AppearanceOutcome;
}
