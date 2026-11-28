import type {AppearanceOutcomeStatus} from "@gunsmith/ai/pipeline/appearance/types/AppearanceOutcomeStatus";
import type {ModelUsage} from "@gunsmith/ai/pipeline/shared/usage/types/ModelUsage";

/** The result of drawing a weapon from a player's words. DRAFT, local to `ai/`: a candidate for `build` and `art` to react to, not a contract. */
export interface AppearanceOutcome {
  status: AppearanceOutcomeStatus;
  /** `unknown` on purpose, as `WeaponOutcome.weapon` is: whoever reads it (the renderer, an evaluator) parses it again. */
  appearance: unknown;
  /** What the code did to the answer on the way (fields read out of text, fields filled), so the model's own work can be told from the code's. */
  changes: string[];
  /** For a fallback: what was still wrong after the repair, as plain sentences. Empty otherwise. */
  errors: string[];
  /** When a repair was asked: what the first drawing was refused for, as plain sentences. Absent when the first drawing passed. */
  firstErrors?: string[];
  /** The steps that ran, in order, so a test can see the path (a repair at most once). */
  nodes: string[];
  /** Model calls made: one, or two when the first drawing was refused and a repair was asked. */
  modelCalls: number;
  usage: ModelUsage;
}
