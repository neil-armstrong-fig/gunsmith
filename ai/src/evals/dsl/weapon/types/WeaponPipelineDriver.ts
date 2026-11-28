import type {WeaponOutcome} from "@gunsmith/ai/pipeline/weapon/types/WeaponOutcome";

/**
 * What the DSL needs to ask the weapon smith: a way to run a request, and how many times. The DSL owns this seam and knows
 * nothing more, so its own tests use a scripted driver and no model. The mapping supplies the real one, built from the model tier
 * a run chose (setup, as the acceptance mapping's fixtures supply the `Page`), so the same specs run on the fake, local and paid tiers.
 */
export interface WeaponPipelineDriver {
  /** How many times a request is run, because a model's answer varies: a criterion must hold in every one. */
  trials: number;
  /** Puts one player request through the pipeline and returns how it ended. */
  run(prompt: string): Promise<WeaponOutcome>;
}
