import {appearanceSchema} from "@gunsmith/ai/pipeline/appearance/schema/Appearance";
import {measureAppearance} from "@gunsmith/ai/pipeline/appearance/check/validate/budget/measure/MeasureAppearance";
import {boundsErrors} from "@gunsmith/ai/pipeline/appearance/check/validate/bounds/BoundsErrors";
import {budgetErrors} from "@gunsmith/ai/pipeline/appearance/check/validate/budget/BudgetErrors";
import {schemaErrors} from "@gunsmith/ai/pipeline/appearance/check/validate/schema/SchemaErrors";
import type {AppearanceValidation} from "@gunsmith/ai/pipeline/appearance/check/validate/types/AppearanceValidation";

/**
 * Parses what the model wrote against the strict appearance schema, then holds what a schema cannot see to the limits: the
 * points in all, the bytes, and whether every part, once turned and stroked, stays inside the design space. The first place an
 * answer is trusted as an appearance. A refusal names every problem, each shortened, because a repair would show them to the
 * model and some of the words in them (a stray field's name) came from the model, or through it from the player.
 */
export function validateAppearance(candidate: unknown): AppearanceValidation {
  const parsed = appearanceSchema.safeParse(candidate);
  if (!parsed.success) {
    return {ok: false, errors: schemaErrors(parsed.error)};
  }

  const errors = [...budgetErrors(measureAppearance(parsed.data)), ...boundsErrors(parsed.data)];
  if (errors.length > 0) {
    return {ok: false, errors};
  }

  return {ok: true, appearance: parsed.data};
}
