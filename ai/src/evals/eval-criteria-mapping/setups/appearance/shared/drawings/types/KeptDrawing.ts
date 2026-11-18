import type {AppearanceOutcome} from "@gunsmith/ai/pipeline/appearance/types/AppearanceOutcome";

/** One request and how its drawing ended, kept so a person can look at it. */
export interface KeptDrawing {
  prompt: string;
  outcome: AppearanceOutcome;
}
