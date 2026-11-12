import {WEAPON_PROMPT_TOKEN_LIMIT} from "@gunsmith/ai/pipeline/limits/WeaponPromptTokenLimit";
import {moderationJudge} from "@gunsmith/ai/pipeline/moderation/ModerationJudge";
import {tokenPrecheck} from "@gunsmith/ai/pipeline/precheck/TokenPrecheck";
import type {GenerateWeaponInput} from "@gunsmith/ai/pipeline/types/GenerateWeaponInput";
import type {WeaponOutcome} from "@gunsmith/ai/pipeline/types/WeaponOutcome";
import type {WeaponPipelineDeps} from "@gunsmith/ai/pipeline/types/WeaponPipelineDeps";

/**
 * Turns a player's words into a weapon, or a rejection. Built up node by node, driven by the evals (`evals/weapons`): so far
 * the token pre-check and the moderation judge. Past them the one-node proof still answers every request with the same weapon and
 * ignores the generator; generation, validation, repair and rating come next, each one when an eval is red for its want.
 */
export async function generateWeapon(input: GenerateWeaponInput, deps: WeaponPipelineDeps): Promise<WeaponOutcome> {
  const precheck = tokenPrecheck(input.prompt, WEAPON_PROMPT_TOKEN_LIMIT);
  if (!precheck.accepted) {
    return {status: "rejected", reason: precheck.reason, nodes: ["precheck"], modelCalls: 0};
  }

  const verdict = await moderationJudge(input.prompt, deps.moderator);
  if (!verdict.isWeaponRequest) {
    return {status: "rejected", reason: verdict.reason, nodes: ["precheck", "moderation"], modelCalls: 1};
  }

  return {
    status: "created",
    weapon: {name: "Proof Rifle", damage: 20, rateOfFire: 6},
    nodes: ["precheck", "moderation", "generate"],
    modelCalls: 2,
  };
}
