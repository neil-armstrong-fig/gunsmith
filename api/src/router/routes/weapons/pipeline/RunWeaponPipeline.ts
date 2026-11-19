import type {WeaponOutcome} from "@gunsmith/ai/pipeline/types/WeaponOutcome";

/**
 * Turns a player's words into a weapon outcome: `@gunsmith/ai`'s `generateWeapon` with its models, once the Worker has them. **No
 * production adapter yet** (it needs ai's Worker-safe adapters and the user's authorisation for paid calls), so
 * `isWeaponPipelineAvailable` says no and the route never calls this. Tests mock this module.
 */
export async function runWeaponPipeline(_prompt: string): Promise<WeaponOutcome> {
  throw new Error("no production weapon pipeline is wired yet");
}
