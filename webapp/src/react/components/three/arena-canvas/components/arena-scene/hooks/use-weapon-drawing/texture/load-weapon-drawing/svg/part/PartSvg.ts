import type {AppearancePart} from "@gunsmith/shared/appearance/schema/part/AppearancePart";
import {roleColour} from "@src/react/components/three/arena-canvas/components/arena-scene/hooks/use-weapon-drawing/texture/load-weapon-drawing/svg/colour/RoleColour";
import type {AppearancePalette} from "@src/react/components/three/arena-canvas/components/arena-scene/hooks/use-weapon-drawing/texture/load-weapon-drawing/svg/types/AppearancePalette";

/**
 * One part as an SVG element, in the 64-unit design space: placed at its `x`, `y` and turned about it. Round joins and caps, as `art` specifies. Everything written
 * into the markup is an enumerated role (resolved to a colour here) or a number the strict schema has already checked, so nothing a model wrote reaches the page as text.
 */
export function partSvg(part: AppearancePart, palette: AppearancePalette): string {
  const paint = [
    `fill="${roleColour(part.fill, palette)}"`,
    `stroke="${roleColour(part.stroke, palette)}"`,
    `stroke-width="${part.strokeWidth}"`,
    `opacity="${part.opacity}"`,
    'stroke-linejoin="round"',
    'stroke-linecap="round"',
  ].join(" ");
  const place = `transform="translate(${part.x} ${part.y}) rotate(${part.rotation})"`;

  if (part.kind === "circle") {
    return `<circle ${place} r="${part.radius}" ${paint}/>`;
  }

  if (part.kind === "ellipse") {
    return `<ellipse ${place} rx="${part.radiusX}" ry="${part.radiusY}" ${paint}/>`;
  }

  if (part.kind === "rect") {
    return `<rect ${place} width="${part.width}" height="${part.height}" ${paint}/>`;
  }

  const points = part.points.map(point => `${point[0]},${point[1]}`).join(" ");

  return `<${part.kind} ${place} points="${points}" ${paint}/>`;
}
