import {appearanceToDraw} from "@src/assets/weapon-drawings/appearance-to-draw/AppearanceToDraw";
import {appearanceSvg} from "@src/assets/weapon-drawings/svg/AppearanceSvg";

/** A stable image URL derived from the same appearance as the held weapon, with a contour for small dark slots. */
export function weaponThumbnailUrl(input: unknown): string | undefined {
  if (input === undefined) return undefined;

  const appearance = appearanceToDraw(input);
  const hasVisibleBody = appearance.body.some(part => {
    return part.detail === "structural" && (part.fill !== "none" || (part.stroke !== "none" && part.strokeWidth > 0));
  });
  if (!hasVisibleBody) return undefined;

  const svg = appearanceSvg(appearance, ["structural"], true);
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}
