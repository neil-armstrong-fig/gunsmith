import type {Point} from "@gunsmith/engine/geometry/types/Point";
import type {BlockedTiles} from "@gunsmith/engine/movement/types/BlockedTiles";

/** Resolving one wall can push a circle into a neighbour, so a few passes settle it; more is never needed at game speeds. */
const PASSES = 4;

/**
 * Moves a circle out of every blocked tile it overlaps (`blocked`: a wall, or a drop it cannot walk up), along the line from the wall's nearest point to the circle's centre.
 * Pushing along that line is what lets a player slide along a wall rather than stick to it.
 *
 * It resolves overlap, it does not sweep: a circle that travels further than its radius in one step can tunnel through
 * a wall, so the caller steps in small, fixed increments.
 */
export function pushOutOfWalls(blocked: BlockedTiles, centre: Point, radius: number): Point {
  let position = centre;

  for (let pass = 0; pass < PASSES; pass += 1) {
    const pushed = pushOnce(blocked, position, radius);
    if (pushed === position) {
      return position;
    }

    position = pushed;
  }

  return position;
}

function pushOnce(blocked: BlockedTiles, centre: Point, radius: number): Point {
  let x = centre.x;
  let y = centre.y;
  let moved = false;

  for (let tileY = Math.floor(y - radius); tileY <= Math.floor(y + radius); tileY += 1) {
    for (let tileX = Math.floor(x - radius); tileX <= Math.floor(x + radius); tileX += 1) {
      if (!blocked(tileX, tileY)) {
        continue;
      }

      const push = pushFromTile({x, y}, {x: tileX, y: tileY}, radius);
      if (push) {
        x += push.x;
        y += push.y;
        moved = true;
      }
    }
  }

  if (!moved) {
    return centre;
  }

  return {x, y};
}

/** How far to move a circle so it clears one wall tile, or `undefined` when it already does. */
function pushFromTile(centre: Point, tile: Point, radius: number): Point | undefined {
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

/** The circle's centre is inside the tile, so there is no line to push along: leave by the nearest side. */
function pushOutFromInside(centre: Point, tile: Point, radius: number): Point {
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
