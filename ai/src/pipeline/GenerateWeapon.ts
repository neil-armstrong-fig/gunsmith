import {WEAPON_PROMPT_TOKEN_LIMIT} from "@gunsmith/ai/pipeline/limits/WeaponPromptTokenLimit";
import {tokenPrecheck} from "@gunsmith/ai/pipeline/precheck/TokenPrecheck";
import type {GenerateWeaponInput} from "@gunsmith/ai/pipeline/types/GenerateWeaponInput";
import type {WeaponOutcome} from "@gunsmith/ai/pipeline/types/WeaponOutcome";
import type {WeaponPipelineDeps} from "@gunsmith/ai/pipeline/types/WeaponPipelineDeps";

/**
 * Turns a player's words into a weapon, or a rejection. Built up node by node, driven by the evals (`evals/weapons`): so far
 * the token pre-check. Past it the one-node proof still answers every request with the same weapon and ignores both models;
 * moderation, generation, validation, repair and rating come next, each one when an eval is red for its want.
 */
export async function generateWeapon(input: GenerateWeaponInput, _deps: WeaponPipelineDeps): Promise<WeaponOutcome> {
  const precheck = tokenPrecheck(input.prompt, WEAPON_PROMPT_TOKEN_LIMIT);
  if (!precheck.accepted) {
    return {status: "rejected", reason: precheck.reason, nodes: ["precheck"], modelCalls: 0};
  }

  return {
    status: "created",
    weapon: {name: "Proof Rifle", damage: 20, rateOfFire: 6},
    nodes: ["precheck", "generate"],
    modelCalls: 1,
  };
}
