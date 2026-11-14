import {APPEARANCE_LIMITS} from "@gunsmith/ai/pipeline/appearance/schema/AppearanceLimits";
import type {Appearance} from "@gunsmith/ai/pipeline/appearance/schema/Appearance";
import {partSvg} from "@evals/eval-criteria-mapping/appearance/drawings/sheet/svg/part/PartSvg";

const BACKGROUND = "#222C37";
const FRAME = "#3A4757";

/**
 * An appearance drawn as a square SVG `size` pixels on a side, the body only (the probe asks for no projectile), on a slate background with the design
 * space's frame, so a part reaching the edge is visible. For reviewing generated appearances by eye; not the game's renderer.
 */
export function appearanceSvg(appearance: Appearance, size: number): string {
  const space = APPEARANCE_LIMITS.space;
  const parts = appearance.body.map(part => partSvg(part, appearance.palette)).join("");

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${space} ${space}" width="${size}" height="${size}" role="img">`,
    `<rect width="${space}" height="${space}" fill="${BACKGROUND}"/>`,
    parts,
    `<rect width="${space}" height="${space}" fill="none" stroke="${FRAME}" stroke-width="0.5"/>`,
    "</svg>",
  ].join("");
}
