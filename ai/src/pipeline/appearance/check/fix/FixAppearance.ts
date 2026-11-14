import {completeAppearance} from "@gunsmith/ai/pipeline/appearance/check/fix/complete/CompleteAppearance";
import type {AppearanceFix} from "@gunsmith/ai/pipeline/appearance/check/fix/types/AppearanceFix";
import {unwrapEncodedFields} from "@gunsmith/ai/pipeline/appearance/check/fix/unwrap/UnwrapEncodedFields";

/**
 * What code does to a model's drawing before it is judged: read any nested field the model wrote as text (`unwrap`), then fill what
 * it left out (`complete`). It says what it did, so the model's own work can be told from the code's, and it never overrides a value
 * the model wrote: a wrong one is for `validate` to refuse and the repair to fix. No model is called.
 */
export function fixAppearance(answer: unknown): AppearanceFix {
  const unwrapped = unwrapEncodedFields(answer);
  const completed = completeAppearance(unwrapped.candidate);

  return {candidate: completed.candidate, changes: [...unwrapped.changes, ...completed.changes]};
}
