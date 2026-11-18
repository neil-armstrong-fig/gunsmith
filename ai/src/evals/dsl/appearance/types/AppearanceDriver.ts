import type {AppearanceOutcome} from "@gunsmith/ai/pipeline/appearance/types/AppearanceOutcome";

/**
 * What the DSL needs to ask for a weapon's appearance: a way to run a request, and how many times. Like `WeaponPipelineDriver`, the
 * DSL owns this seam and knows nothing more, so its own tests use a scripted driver and no model; the mapping supplies the real one.
 */
export interface AppearanceDriver {
  /** How many times a request is run, because a model's drawing varies: a criterion must hold in every one. */
  trials: number;
  /** Puts one player request through the appearance pipeline and returns how it ended. */
  run(prompt: string): Promise<AppearanceOutcome>;
}
