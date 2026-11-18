import type {Appearance} from "@gunsmith/shared/appearance/schema/Appearance";
import {APPEARANCE_LIMITS} from "@gunsmith/shared/appearance/schema/AppearanceLimits";
import type {DetailTier} from "@gunsmith/shared/appearance/vocabulary/detail/DetailTier";
import {partSvg} from "@src/react/components/three/arena-canvas/components/arena-scene/hooks/use-weapon-drawing/texture/load-weapon-drawing/svg/part/PartSvg";

/**
 * An appearance's body as a transparent SVG over the 64-unit design space, back to front in array order, for the game to draw as a picture. `tiers` says which
 * parts are drawn: a weapon drawn small leaves out its `fine` parts and never a `structural` one (`art`'s rule, `docs/art/concepts/top-down-oddities/README.md`).
 * A part reaching past the space is cut off by the picture's edge, nothing more.
 */
export function appearanceSvg(appearance: Appearance, tiers: readonly DetailTier[]): string {
  const space = APPEARANCE_LIMITS.space;
  const parts = appearance.body
    .filter(part => tiers.includes(part.detail))
    .map(part => partSvg(part, appearance.palette))
    .join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${space} ${space}" width="${space}" height="${space}">${parts}</svg>`;
}
