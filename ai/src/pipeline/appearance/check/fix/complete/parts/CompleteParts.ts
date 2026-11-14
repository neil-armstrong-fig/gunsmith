import {completePart} from "@gunsmith/ai/pipeline/appearance/check/fix/complete/parts/part/CompletePart";
import type {PartsCompletion} from "@gunsmith/ai/pipeline/appearance/check/fix/complete/types/PartsCompletion";

/** Completes every part in a list, and reports each field filled once however many parts it was filled in. */
export function completeParts(listName: string, parts: unknown[]): PartsCompletion {
  const changes = new Set<string>();
  const completed = parts.map(part => {
    const result = completePart(part);
    if (result === undefined) {
      return part;
    }

    result.changes.forEach(change => changes.add(`${listName}.${change}`));

    return result.record;
  });

  return {parts: completed, changes: [...changes]};
}
