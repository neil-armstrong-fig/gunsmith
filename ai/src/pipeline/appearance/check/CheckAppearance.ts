import {fixAppearance} from "@gunsmith/ai/pipeline/appearance/check/fix/FixAppearance";
import type {AppearanceCheck} from "@gunsmith/ai/pipeline/appearance/check/types/AppearanceCheck";
import {validateAppearance} from "@gunsmith/ai/pipeline/appearance/check/validate/ValidateAppearance";

/**
 * Everything code decides about what the model drew, in order: read and finish the answer (`fix`), then hold the result to the
 * strict schema, the budgets and the bounds (`validate`). The model's answer is `unknown` until this has parsed it. Says which
 * nodes ran, so the outcome can show the path, and what `fix` did to the answer. No model is called. DRAFT, not wired into
 * `generateWeapon`.
 */
export function checkAppearance(answer: unknown): AppearanceCheck {
  const fixed = fixAppearance(answer);
  const validation = validateAppearance(fixed.candidate);
  if (!validation.ok) {
    return {ok: false, errors: validation.errors, changes: fixed.changes, nodes: ["fix", "validate"]};
  }

  return {ok: true, appearance: validation.appearance, changes: fixed.changes, nodes: ["fix", "validate"]};
}
