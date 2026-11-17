import {APPEARANCE_LIMITS} from "@gunsmith/shared/appearance/schema/AppearanceLimits";
import {partExtent} from "@gunsmith/ai/pipeline/appearance/check/validate/bounds/extent/PartExtent";
import {edgeOutside} from "@gunsmith/ai/pipeline/appearance/check/validate/bounds/outside/edge/EdgeOutside";
import type {AppearancePart} from "@gunsmith/shared/appearance/schema/part/AppearancePart";

/**
 * One sentence for each part in a list that, turned and stroked, reaches outside the design space; `listName` is `body` or
 * `projectile`. It names the part and its kind, the edge and where it reaches, and how far to pull it in, because a model told only
 * "outside" left a long thin line (a tentacle) where it was (measured 2026-11-14 on Haiku 5.5).
 */
export function outsideErrors(listName: string, parts: AppearancePart[]): string[] {
  const space = APPEARANCE_LIMITS.space;

  return parts.flatMap((part, index) => {
    const crossing = edgeOutside(partExtent(part), space);
    if (crossing === undefined) {
      return [];
    }

    const name = `${listName}.${index} (${part.kind})`;
    const reaches = `reaches outside the ${space} by ${space} space (${crossing.edge} edge ${crossing.reach})`;
    const fix = `pull it in by ${crossing.pullIn} so its ${crossing.edge} edge, stroke included, is ${crossing.bound} ${crossing.limit}`;

    return [`${name}: ${reaches}; ${fix}`];
  });
}
