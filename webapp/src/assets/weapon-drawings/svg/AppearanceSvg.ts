import type {Appearance} from "@gunsmith/shared/appearance/schema/Appearance";
import {APPEARANCE_LIMITS} from "@gunsmith/shared/appearance/schema/AppearanceLimits";
import type {DetailTier} from "@gunsmith/shared/appearance/vocabulary/detail/DetailTier";
import {partSvg} from "@src/assets/weapon-drawings/svg/part/PartSvg";

/**
 * An appearance's body as a transparent SVG over the 64-unit design space, back to front in array order, for the game to draw as a picture. `tiers` says which
 * parts are drawn: a weapon drawn small leaves out its `fine` parts and never a `structural` one (`art`'s rule, `docs/art/concepts/top-down-oddities/README.md`).
 * A part reaching past the space is cut off by the picture's edge, nothing more.
 */
export function appearanceSvg(
  appearance: Appearance,
  tiers: readonly DetailTier[],
  withThumbnailOutline = false,
): string {
  const space = APPEARANCE_LIMITS.space;
  const parts = appearance.body
    .filter(part => tiers.includes(part.detail))
    .map(part => partSvg(part, appearance.palette))
    .join("");

  if (withThumbnailOutline) return outlinedThumbnail(parts, space);

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${space} ${space}" width="${space}" height="${space}">${parts}</svg>`;
}

function outlinedThumbnail(parts: string, space: number): string {
  // Two design units leave one screen pixel around the 64-unit drawing at the HUD's 34 px size.
  const margin = 2;
  const size = space + 2 * margin;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${-margin} ${-margin} ${size} ${size}" width="${size}" height="${size}">
  <defs>
    <filter id="thumbnail-outline" filterUnits="userSpaceOnUse" x="${-margin}" y="${-margin}" width="${size}" height="${size}">
      <feMorphology in="SourceAlpha" operator="dilate" radius="${margin}"/>
      <feComponentTransfer result="silhouette"><feFuncA type="linear" slope="5"/></feComponentTransfer>
      <feFlood flood-color="#A7B3C2" result="contour"/>
      <feComposite in="contour" in2="silhouette" operator="in" result="outlined"/>
      <feComposite in="SourceGraphic" in2="outlined" operator="over"/>
    </filter>
  </defs>
  <g filter="url(#thumbnail-outline)">${parts}</g>
</svg>`;
}
