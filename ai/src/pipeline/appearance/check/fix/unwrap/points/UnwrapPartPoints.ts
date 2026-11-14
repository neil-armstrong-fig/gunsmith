import {decodeContainer} from "@gunsmith/ai/pipeline/appearance/check/fix/unwrap/decode/DecodeContainer";
import {isRecord} from "@gunsmith/ai/pipeline/appearance/check/fix/IsRecord";
import type {PartsRewrite} from "@gunsmith/ai/pipeline/appearance/check/fix/unwrap/types/PartsRewrite";

/** Reads the `points` of any part in a list that the model wrote as text. Anything that is not a list of records is left as it is. */
export function unwrapPartPoints(parts: unknown): PartsRewrite {
  if (!Array.isArray(parts)) {
    return {parts, changed: false};
  }

  let changed = false;
  const rewritten = parts.map((part: unknown) => {
    if (!isRecord(part)) {
      return part;
    }

    const points = decodeContainer(part.points, "array");
    if (points === undefined) {
      return part;
    }

    changed = true;

    return {...part, points};
  });

  return {parts: rewritten, changed};
}
