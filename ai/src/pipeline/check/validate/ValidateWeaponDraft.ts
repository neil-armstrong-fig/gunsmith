import type {WeaponValidation} from "@gunsmith/ai/pipeline/check/validate/types/WeaponValidation";
import {weaponDraftSchema} from "@gunsmith/ai/pipeline/weapon/WeaponDraft";
import {statPreferenceDraftSchema} from "@gunsmith/ai/pipeline/check/validate/preference/StatPreferenceDraft";

const MAX_ERROR_LENGTH = 120;

/** What the model writes: the weapon and, beside it, the player's stat preference. Strict, so a stray field is refused. */
const weaponWithPreferenceSchema = weaponDraftSchema.extend({preference: statPreferenceDraftSchema});

/**
 * Parses what the model wrote against the strict weapon schema: the first place the answer is trusted as a weapon. Zod only; how
 * strong the weapon is, is `balanceWeaponDraft`'s to bring inside the limits and `rateWeaponDraft`'s to check. The preference
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
