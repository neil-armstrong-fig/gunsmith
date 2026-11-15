import {checkWeaponDraft} from "@gunsmith/ai/pipeline/check/CheckWeaponDraft";
import type {WeaponCheck} from "@gunsmith/ai/pipeline/check/types/WeaponCheck";
import {generateWeaponDraft} from "@gunsmith/ai/pipeline/weapon-drafting/generate/GenerateWeaponDraft";
import {WEAPON_PROMPT_TOKEN_LIMIT} from "@gunsmith/ai/pipeline/prompt-screening/precheck/limit/WeaponPromptTokenLimit";
import {moderationJudge} from "@gunsmith/ai/pipeline/prompt-screening/moderation/ModerationJudge";
import {tokenPrecheck} from "@gunsmith/ai/pipeline/prompt-screening/precheck/TokenPrecheck";
import {repairWeaponDraft} from "@gunsmith/ai/pipeline/weapon-drafting/repair/RepairWeaponDraft";
import type {GenerateWeaponInput} from "@gunsmith/ai/pipeline/types/GenerateWeaponInput";
import type {WeaponOutcome} from "@gunsmith/ai/pipeline/types/WeaponOutcome";
import type {WeaponPipelineDependencies} from "@gunsmith/ai/pipeline/types/WeaponPipelineDependencies";
import {drawCreatedWeapon} from "@gunsmith/ai/pipeline/weapon-drawing/DrawCreatedWeapon";

/** What a player is told when a request was a weapon request but no valid weapon came out of it, even after the one repair. */
const INVALID_WEAPON_REASON = "We could not build a valid weapon from that request. Try describing it differently.";

/**
 * Turns a player's words into a weapon, or a rejection, or (when no valid weapon can be made) an invalid. Built node by node,
 * driven by the evals (`evals/weapons`): the token pre-check, the moderation judge, generation, then code's checks (`validate`,
 * `balance`, `rate`), and at most one repair that puts the faults back to the model before the same checks run again. A weapon
 * that passes is then drawn, by a second model with its own repair and its own disclosed stand-in; a rejected or invalid request
 * draws nothing. Model calls: moderation, generation and at most one repair, then the drawing and at most one repair: five at
 * most, three when nothing needs repairing.
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
    return drawCreatedWeapon(
      {
        prompt: input.prompt,
        weapon: firstCheck.weapon,
        nodes: ["precheck", "moderation", "generate", ...firstCheck.nodes],
        modelCalls: 2,
      },
      weaponPipelineDependencies.appearanceGenerator,
    );
  }

  const repaired = await repairWeaponDraft(
    {prompt: input.prompt, previous: draft, errors: firstCheck.errors},
    weaponPipelineDependencies.generator,
  );
  const secondCheck = checkWeaponDraft(repaired);
  if (secondCheck.ok) {
    return drawCreatedWeapon(
      {
        prompt: input.prompt,
        weapon: secondCheck.weapon,
        nodes: nodesAfterRepair(firstCheck, secondCheck),
        modelCalls: 3,
      },
      weaponPipelineDependencies.appearanceGenerator,
    );
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
