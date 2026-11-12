import {tokenPrecheck} from "@src/pipeline/precheck/TokenPrecheck";
import type {WeaponOutcome} from "@src/pipeline/types/WeaponOutcome";
import type {WeaponPipelineDeps} from "@src/pipeline/types/WeaponPipelineDeps";

interface GenerateWeaponInput {
  prompt: string;
}

// Tunable: the longest weapon prompt, in estimated tokens, that reaches a model (`docs/cost-and-budget.md`).
const WEAPON_PROMPT_TOKEN_LIMIT = 150;

// BUILT UP NODE BY NODE, driven by the evals (`evals/weapons`). So far: the token pre-check. Past it the one-node proof still
// answers every request with the same weapon and ignores both models; moderation, generation, validation, repair and rating
// come next, each one when an eval is red for its want.
export async function generateWeapon(input: GenerateWeaponInput, _deps: WeaponPipelineDeps): Promise<WeaponOutcome> {
  const precheck = tokenPrecheck(input.prompt, WEAPON_PROMPT_TOKEN_LIMIT);
  if (!precheck.accepted) {
    return {status: "rejected", reason: precheck.reason, modelCalls: 0};
  }

  return {status: "created", weapon: {name: "Proof Rifle", damage: 20, rateOfFire: 6}, modelCalls: 1};
}
