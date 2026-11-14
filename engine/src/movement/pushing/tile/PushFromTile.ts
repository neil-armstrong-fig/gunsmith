import type {Point} from "@gunsmith/engine/geometry/types/Point";
import {pushOutFromInside} from "@gunsmith/engine/movement/pushing/tile/inside/PushOutFromInside";

/** How far to move a circle so it clears one blocked tile, or `undefined` when it already does. */
export function pushFromTile(centre: Point, tile: Point, radius: number): Point | undefined {
  const nearestX = Math.min(Math.max(centre.x, tile.x), tile.x + 1);
  const nearestY = Math.min(Math.max(centre.y, tile.y), tile.y + 1);
  const offsetX = centre.x - nearestX;
  const offsetY = centre.y - nearestY;
  const distanceSquared = offsetX * offsetX + offsetY * offsetY;

  if (distanceSquared >= radius * radius) {
    return undefined;
  }

  if (distanceSquared === 0) {
    return pushOutFromInside(centre, tile, radius);
  }

  const distance = Math.sqrt(distanceSquared);
  const overlap = radius - distance;

  return {x: (offsetX / distance) * overlap, y: (offsetY / distance) * overlap};
}
