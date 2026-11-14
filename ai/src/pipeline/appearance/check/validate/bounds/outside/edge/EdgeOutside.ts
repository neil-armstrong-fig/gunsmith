import type {Extent} from "@gunsmith/ai/pipeline/appearance/check/validate/bounds/extent/types/Extent";

/** Which edge of the space an extent crosses first (left, top, right, bottom) and where it reaches, or nothing when it fits. */
export function edgeOutside(extent: Extent, space: number): string | undefined {
  if (extent.minX < 0) {
    return `left edge ${rounded(extent.minX)}`;
  }

  if (extent.minY < 0) {
    return `top edge ${rounded(extent.minY)}`;
  }

  if (extent.maxX > space) {
    return `right edge ${rounded(extent.maxX)}`;
  }

  if (extent.maxY > space) {
    return `bottom edge ${rounded(extent.maxY)}`;
  }

  return undefined;
}

/** Two decimals, so a turned part's floating-point noise does not fill the sentence. */
function rounded(value: number): number {
  return Number(value.toFixed(2));
}
