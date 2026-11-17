import type {WeaponValidation} from "@gunsmith/ai/pipeline/check/validate/types/WeaponValidation";
import {weaponProposalSchema} from "@gunsmith/ai/pipeline/check/validate/proposal/WeaponProposal";
import {statPreferenceDraftSchema} from "@gunsmith/ai/pipeline/check/validate/preference/StatPreferenceDraft";

const MAX_ERROR_LENGTH = 120;

/** What the model writes: the weapon (its stats not yet held to their ranges) and, beside it, the player's stat preference. Strict, so a stray field is refused. */
const weaponWithPreferenceSchema = weaponProposalSchema.extend({preference: statPreferenceDraftSchema});

/**
 * Parses what the model wrote against the weapon's shape: the first place the answer is trusted as a weapon. Zod only, and it does
 * not hold a stat to its range: a finite number past either end is accepted as written, and `balanceWeaponDraft` brings it to the end
 * of the range and inside the limits, which `rateWeaponDraft` then checks. The preference
 * comes back apart from the weapon, so it never reaches the player. A refusal names every problem, each shortened, because `repair` shows
 * them to the model and some of the words in them (a stray field's name) came from the model, or through it from the player.
 */
export function validateWeaponDraft(candidate: unknown): WeaponValidation {
  const parsed = weaponWithPreferenceSchema.safeParse(candidate);
  if (parsed.success) {
    const {preference, ...weapon} = parsed.data;

    return {ok: true, weapon, preference};
  }

  const errors = parsed.error.issues.map(issue => {
    const where = issue.path.length > 0 ? issue.path.join(".") : "weapon";

    return `${where}: ${issue.message}`.slice(0, MAX_ERROR_LENGTH);
  });

  return {ok: false, errors};
}
