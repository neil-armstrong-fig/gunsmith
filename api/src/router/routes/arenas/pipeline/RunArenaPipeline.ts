import type {ArenaOutcome} from "@gunsmith/ai/pipeline/arena/types/ArenaOutcome";

/**
 * Turns a player's words into an arena outcome: `@gunsmith/ai`'s `generateArena` with its models, once the Worker has them. **No
 * production adapter yet**, so `isArenaPipelineAvailable` says no and the route never calls this. Tests mock this module.
 */
export async function runArenaPipeline(_prompt: string): Promise<ArenaOutcome> {
  throw new Error("no production arena pipeline is wired yet");
}
