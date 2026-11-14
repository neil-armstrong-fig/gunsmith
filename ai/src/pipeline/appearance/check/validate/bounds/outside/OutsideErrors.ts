import {APPEARANCE_LIMITS} from "@gunsmith/ai/pipeline/appearance/schema/AppearanceLimits";
import {partExtent} from "@gunsmith/ai/pipeline/appearance/check/validate/bounds/extent/PartExtent";
import {edgeOutside} from "@gunsmith/ai/pipeline/appearance/check/validate/bounds/outside/edge/EdgeOutside";
import type {AppearancePart} from "@gunsmith/ai/pipeline/appearance/schema/part/AppearancePart";

/** One sentence for each part in a list that, turned and stroked, reaches outside the design space; `listName` is `body` or `projectile`. */
export function outsideErrors(listName: string, parts: AppearancePart[]): string[] {
  const space = APPEARANCE_LIMITS.space;

  return parts.flatMap((part, index) => {
    const edge = edgeOutside(partExtent(part), space);
    if (edge === undefined) {
      return [];
    }

    return [`${listName}.${index}: reaches outside the ${space} by ${space} space (${edge})`];
  });
}
