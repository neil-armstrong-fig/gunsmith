import {checkWeaponDraft} from "@gunsmith/ai/pipeline/check/CheckWeaponDraft";
import type {WeaponCheck} from "@gunsmith/ai/pipeline/check/types/WeaponCheck";
import {generateWeaponDraft} from "@gunsmith/ai/pipeline/generate/GenerateWeaponDraft";
import {INVALID_WEAPON_REASON} from "@gunsmith/ai/pipeline/invalid/InvalidWeaponReason";
import {WEAPON_PROMPT_TOKEN_LIMIT} from "@gunsmith/ai/pipeline/limits/WeaponPromptTokenLimit";
import {moderationJudge} from "@gunsmith/ai/pipeline/moderation/ModerationJudge";
import {tokenPrecheck} from "@gunsmith/ai/pipeline/precheck/TokenPrecheck";
import {repairWeaponDraft} from "@gunsmith/ai/pipeline/repair/RepairWeaponDraft";
import type {GenerateWeaponInput} from "@gunsmith/ai/pipeline/types/GenerateWeaponInput";
import type {WeaponOutcome} from "@gunsmith/ai/pipeline/types/WeaponOutcome";
import type {WeaponPipelineDependencies} from "@gunsmith/ai/pipeline/types/WeaponPipelineDependencies";

/**
 * Turns a player's words into a weapon, or a rejection, or (when no valid weapon can be made) an invalid. Built node by node,
 * driven by the evals (`evals/weapons`): the token pre-check, the moderation judge, generation, then code's two checks
 * (`validate`, `rate`), and at most one repair that puts the faults back to the model before the same two checks run again.
 * Model calls: moderation, generation and at most one repair, so three at most.
 */
export async function generateWeapon(
  input: GenerateWeaponInput,
  weaponPipelineDependencies: WeaponPipelineDependencies,
): Promise<WeaponOutcome> {
  const precheck = tokenPrecheck(input.prompt, WEAPON_PROMPT_TOKEN_LIMIT);
  if (!precheck.accepted) {
    return {status: "rejected", reason: precheck.reason, nodes: ["precheck"], modelCalls: 0};
  }

  const verdict = await moderationJudge(input.prompt, weaponPipelineDependencies.moderator);
  if (!verdict.isWeaponRequest) {
    return {status: "rejected", reason: verdict.reason, nodes: ["precheck", "moderation"], modelCalls: 1};
  }

  const draft = await generateWeaponDraft(input.prompt, weaponPipelineDependencies.generator);
  const firstCheck = checkWeaponDraft(draft);
  if (firstCheck.ok) {
    return {
      status: "created",
      weapon: firstCheck.weapon,
      nodes: ["precheck", "moderation", "generate", ...firstCheck.nodes],
      modelCalls: 2,
    };
  }

  const repaired = await repairWeaponDraft(
    {prompt: input.prompt, previous: draft, errors: firstCheck.errors},
    weaponPipelineDependencies.generator,
  );
  const secondCheck = checkWeaponDraft(repaired);
  if (secondCheck.ok) {
    return {
      status: "created",
      weapon: secondCheck.weapon,
      nodes: nodesAfterRepair(firstCheck, secondCheck),
      modelCalls: 3,
    };
  }

  return {
    status: "invalid",
    reason: INVALID_WEAPON_REASON,
    nodes: nodesAfterRepair(firstCheck, secondCheck),
    modelCalls: 3,
  };
}

/** The path of a request that was repaired: the same start, the first check, the repair, then the second check. */
function nodesAfterRepair(firstCheck: WeaponCheck, secondCheck: WeaponCheck): string[] {
  return ["precheck", "moderation", "generate", ...firstCheck.nodes, "repair", ...secondCheck.nodes];
}
