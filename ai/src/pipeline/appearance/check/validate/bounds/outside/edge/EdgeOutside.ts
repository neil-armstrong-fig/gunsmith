import type {EdgeCrossing} from "@gunsmith/ai/pipeline/appearance/check/validate/bounds/outside/edge/types/EdgeCrossing";
import type {Extent} from "@gunsmith/ai/pipeline/appearance/check/validate/bounds/extent/types/Extent";

/** The first edge of the space an extent crosses (left, top, right, bottom), where it reaches and how far to pull it back, or nothing when it fits. */
export function edgeOutside(extent: Extent, space: number): EdgeCrossing | undefined {
  if (extent.minX < 0) {
    return {edge: "left", reach: rounded(extent.minX), limit: 0, bound: "at least", pullIn: rounded(-extent.minX)};
  }

  if (extent.minY < 0) {
    return {edge: "top", reach: rounded(extent.minY), limit: 0, bound: "at least", pullIn: rounded(-extent.minY)};
  }

  if (extent.maxX > space) {
    return {
      edge: "right",
      reach: rounded(extent.maxX),
      limit: space,
      bound: "at most",
      pullIn: rounded(extent.maxX - space),
    };
  }

  if (extent.maxY > space) {
    return {
      edge: "bottom",
      reach: rounded(extent.maxY),
      limit: space,
      bound: "at most",
      pullIn: rounded(extent.maxY - space),
    };
  }

  return undefined;
}

/** Two decimals, so a turned part's floating-point noise does not fill the sentence. */
function rounded(value: number): number {
  return Number(value.toFixed(2));
}
