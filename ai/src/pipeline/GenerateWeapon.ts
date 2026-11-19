import type {GenerateWeaponInput} from "@gunsmith/ai/pipeline/types/GenerateWeaponInput";
import type {WeaponOutcome} from "@gunsmith/ai/pipeline/types/WeaponOutcome";
import type {WeaponPipelineDependencies} from "@gunsmith/ai/pipeline/types/WeaponPipelineDependencies";
import {createWeaponGraph} from "@gunsmith/ai/pipeline/weapon-graph/CreateWeaponGraph";
import {weaponOutcomeFromState} from "@gunsmith/ai/pipeline/weapon-graph/outcome/WeaponOutcomeFromState";

/**
 * Turns a player's words into a weapon, or a rejection, or (when no valid weapon can be made) an invalid. It runs the request
 * through the weapon graph (`weapon-graph/`, a fixed LangGraph `StateGraph`: the length pre-check, the moderation judge,
 * generation, then code's checks `validate`, `balance` and `rate`, at most one repair that puts the faults back to the model before
 * the same checks run again, and then the drawing by a second model with its own repair and its own disclosed stand-in; a rejected
 * or invalid request draws nothing) and reads the outcome off the state the run ended in. Model calls: moderation, generation and
 * at most one repair, then the drawing and at most one repair: five at most, three when nothing needs repairing.
 */
export async function generateWeapon(
  input: GenerateWeaponInput,
  weaponPipelineDependencies: WeaponPipelineDependencies,
): Promise<WeaponOutcome> {
  const weaponGraph = createWeaponGraph(weaponPipelineDependencies);
  const endState = await weaponGraph.invoke({prompt: input.prompt});

  return weaponOutcomeFromState(endState);
}
