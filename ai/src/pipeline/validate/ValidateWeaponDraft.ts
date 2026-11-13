import type {WeaponValidation} from "@gunsmith/ai/pipeline/validate/types/WeaponValidation";
import {weaponDraftSchema} from "@gunsmith/ai/pipeline/weapon/WeaponDraft";

const MAX_ERROR_LENGTH = 120;

/**
 * Parses what the model wrote against the strict weapon schema: the first place the answer is trusted as a weapon. Zod only; how
 * strong the weapon is, is `rateWeaponDraft`'s to judge. A refusal names every problem, each shortened, because `repair` shows
 * them to the model and some of the words in them (a stray field's name) came from the model, or through it from the player.
 */
export function validateWeaponDraft(candidate: unknown): WeaponValidation {
  const parsed = weaponDraftSchema.safeParse(candidate);
  if (parsed.success) {
    return {ok: true, weapon: parsed.data};
  }

  const errors = parsed.error.issues.map(issue => {
    const where = issue.path.length > 0 ? issue.path.join(".") : "weapon";

    return `${where}: ${issue.message}`.slice(0, MAX_ERROR_LENGTH);
  });

  return {ok: false, errors};
}
