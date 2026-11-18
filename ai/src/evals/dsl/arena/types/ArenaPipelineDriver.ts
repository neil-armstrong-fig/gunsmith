import type {ArenaOutcome} from "@gunsmith/ai/pipeline/arena/types/ArenaOutcome";

/**
 * What the DSL needs to ask the arena pipeline: a way to run a request, and how many times. The DSL owns this seam and knows
 * nothing more, so its own tests use a scripted driver and no model. The mapping supplies the real one, built from the model tier
 * a run chose, so the same specs run on the fake, local and paid tiers.
 */
export interface ArenaPipelineDriver {
  /** How many times a request is run, because a model's answer varies: a criterion must hold in every one. */
  trials: number;
  /** Puts one player request through the pipeline and returns how it ended. */
  run(prompt: string): Promise<ArenaOutcome>;
}
