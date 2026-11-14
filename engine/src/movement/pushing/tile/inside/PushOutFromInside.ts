import type {Point} from "@gunsmith/engine/geometry/types/Point";

/** The circle's centre is inside the tile, so there is no line to push along: leave by the nearest side. */
export function pushOutFromInside(centre: Point, tile: Point, radius: number): Point {
  const toWest = centre.x - tile.x;
  const toEast = tile.x + 1 - centre.x;
  const toSouth = centre.y - tile.y;
  const toNorth = tile.y + 1 - centre.y;
  const nearest = Math.min(toWest, toEast, toSouth, toNorth);

  if (nearest === toWest) {
    return {x: -(toWest + radius), y: 0};
  }

  if (nearest === toEast) {
    return {x: toEast + radius, y: 0};
  }

  if (nearest === toSouth) {
    return {x: 0, y: -(toSouth + radius)};
  }

  return {x: 0, y: toNorth + radius};
}
