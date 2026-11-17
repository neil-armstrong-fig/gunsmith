import {checkAppearance} from "@gunsmith/ai/pipeline/appearance/check/CheckAppearance";
import {generateAppearanceDraft} from "@gunsmith/ai/pipeline/appearance/drafting/generate/GenerateAppearanceDraft";
import {repairAppearanceDraft} from "@gunsmith/ai/pipeline/appearance/drafting/repair/RepairAppearanceDraft";
import {fallbackAppearance} from "@gunsmith/shared/appearance/fallback/FallbackAppearance";
import type {AppearanceDependencies} from "@gunsmith/ai/pipeline/appearance/types/AppearanceDependencies";
import type {AppearanceOutcome} from "@gunsmith/ai/pipeline/appearance/types/AppearanceOutcome";
import type {GenerateAppearanceInput} from "@gunsmith/ai/pipeline/appearance/types/GenerateAppearanceInput";

/**
 * Draws a weapon from a player's words: the model generates a drawing, then code's check reads and finishes it (`fix`) and holds
 * it to the strict schema, the budgets and the bounds (`validate`). A drawing that is refused goes back to the model once, with its
 * faults (`repair`), and is checked again; if that is refused too, the plain stand-in is shown and the outcome says so
 * (`fallback`). Model calls: one, or two with a repair. It touches no weapon stat. DRAFT: not wired into `generateWeapon`, because
 * the call budget (the same call as the stats, or a second one) is for `build` and the user to decide.
 */
export async function generateAppearance(
  input: GenerateAppearanceInput,
  appearanceDependencies: AppearanceDependencies,
): Promise<AppearanceOutcome> {
  const first = await generateAppearanceDraft(input.prompt, appearanceDependencies.generator);
  const firstCheck = checkAppearance(first.answer);
  if (firstCheck.ok) {
    return {
      status: firstCheck.changes.length === 0 ? "valid" : "completed",
      appearance: firstCheck.appearance,
      changes: firstCheck.changes,
      errors: [],
      nodes: ["generate", ...firstCheck.nodes],
      modelCalls: 1,
      usage: first.usage,
    };
  }

  const repaired = await repairAppearanceDraft(
    {prompt: input.prompt, previous: first.answer, errors: firstCheck.errors},
    appearanceDependencies.generator,
  );
  const secondCheck = checkAppearance(repaired.answer);
  const nodes = ["generate", ...firstCheck.nodes, "repair", ...secondCheck.nodes];
  const usage = {
    inputTokens: first.usage.inputTokens + repaired.usage.inputTokens,
    outputTokens: first.usage.outputTokens + repaired.usage.outputTokens,
  };
  if (secondCheck.ok) {
    return {
      status: "repaired",
      appearance: secondCheck.appearance,
      changes: secondCheck.changes,
      errors: [],
      firstErrors: firstCheck.errors,
      nodes,
      modelCalls: 2,
      usage,
    };
  }

  return {
    status: "fallback",
    appearance: fallbackAppearance(),
    changes: [],
    errors: secondCheck.errors,
    firstErrors: firstCheck.errors,
    nodes: [...nodes, "fallback"],
    modelCalls: 2,
    usage,
  };
}
