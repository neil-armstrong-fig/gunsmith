import type {ModelUsage} from "@gunsmith/ai/pipeline/appearance/types/ModelUsage";

/** What one call to the model gave back: its answer, `unknown` and unchecked on purpose, and what the call cost. */
export interface AppearanceDraftReply {
  /** What the model wrote, or nothing when it made no tool call or the call failed; `checkAppearance` parses it. */
  answer: unknown;
  usage: ModelUsage;
}
