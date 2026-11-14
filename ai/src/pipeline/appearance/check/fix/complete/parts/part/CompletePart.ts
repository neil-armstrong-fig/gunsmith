import {APPEARANCE_DEFAULTS} from "@gunsmith/ai/pipeline/appearance/check/fix/complete/defaults/AppearanceDefaults";
import {completeRecord} from "@gunsmith/ai/pipeline/appearance/check/fix/complete/record/CompleteRecord";
import {isRecord} from "@gunsmith/ai/pipeline/appearance/check/fix/IsRecord";
import type {RecordCompletion} from "@gunsmith/ai/pipeline/appearance/check/fix/complete/types/RecordCompletion";

/**
 * Fills what one part leaves out: its fill (none for a line, the body colour for a shape), the origin of a polygon or polyline,
 * and the stroke, opacity, rotation and detail every part has. Where a circle, ellipse or rectangle is has no default, so a part
 * that omits it stays refused. Returns nothing for a part that is not a record.
 */
export function completePart(part: unknown): RecordCompletion | undefined {
  if (!isRecord(part)) {
    return undefined;
  }

  const isLine = part.kind === "polyline";
  const hasPoints = part.kind === "polygon" || isLine;
  const defaults: Record<string, unknown> = {
    fill: isLine ? APPEARANCE_DEFAULTS.line : APPEARANCE_DEFAULTS.filledShape,
    ...(hasPoints ? {x: APPEARANCE_DEFAULTS.origin, y: APPEARANCE_DEFAULTS.origin} : {}),
    ...APPEARANCE_DEFAULTS.part,
  };

  return completeRecord(part, defaults, "");
}
