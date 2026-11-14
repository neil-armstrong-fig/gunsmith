import {completeRecord} from "@gunsmith/ai/pipeline/appearance/check/fix/complete/record/CompleteRecord";
import {isRecord} from "@gunsmith/ai/pipeline/appearance/check/fix/IsRecord";
import type {BlockCompletion} from "@gunsmith/ai/pipeline/appearance/check/fix/complete/types/BlockCompletion";

/**
 * Completes one record block of an appearance (the palette, the impact, the animation): a block that is absent becomes a copy of
 * its defaults, a record that is there has only its absent fields filled, and anything else (text, a list, a number) is left for
 * the strict check to refuse.
 */
export function completeBlock(block: unknown, defaults: Record<string, unknown>, name: string): BlockCompletion {
  if (block === undefined) {
    return {block: {...defaults}, changes: [name]};
  }

  if (!isRecord(block)) {
    return {block, changes: []};
  }

  const completed = completeRecord(block, defaults, `${name}.`);

  return {block: completed.record, changes: completed.changes};
}
