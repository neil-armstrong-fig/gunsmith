import type {AppearancePart} from "@gunsmith/ai/pipeline/appearance/schema/part/AppearancePart";

/**
 * How far a part's stroke reaches beyond its geometry: half its width, since a stroke is centred on the edge and the renderer
 * joins with round caps and joins (a mitred corner would reach further). Nothing when the stroke is not drawn, which is a role of
 * `none` or a width of zero.
 */
export function strokeReach(part: AppearancePart): number {
  if (part.stroke === "none") {
    return 0;
  }

  return part.strokeWidth / 2;
}
