import type {ArenaSubmission} from "@gunsmith/ai/pipeline/arena-submission/types/ArenaSubmission";
import type {ArenaSubmissionScreening} from "@gunsmith/ai/pipeline/arena-submission/types/ArenaSubmissionScreening";

/**
 * What the DSL needs to screen arena submissions: a way to run one screening, and how many times to repeat it. The DSL owns this seam
 * and knows nothing more, so its own tests use a scripted driver and no model. The mapping supplies the real one, built from the model
 * tier a run chose, so the same specs run on the fake and local tiers.
 */
export interface ArenaSubmissionDriver {
  /** How many times each screening is repeated, because a model's answer varies: a criterion must hold in every one. */
  trials: number;
  /** Screens these submissions and returns what was left for the players. */
  run(submissions: readonly ArenaSubmission[]): Promise<ArenaSubmissionScreening>;
}
