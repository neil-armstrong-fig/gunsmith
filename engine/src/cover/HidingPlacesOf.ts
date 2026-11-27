import type {Arena} from "@gunsmith/engine/arena/types/Arena";
import {coverBesideTarget} from "@gunsmith/engine/cover/CoverBesideTarget";
import {tilesBesideCover} from "@gunsmith/engine/cover/TilesBesideCover";
import type {HidingPlace} from "@gunsmith/engine/cover/types/HidingPlace";
import type {Point} from "@gunsmith/engine/geometry/types/Point";
import {canSeePoint} from "@gunsmith/engine/vision/sight/CanSeePoint";
import type {Cone} from "@gunsmith/engine/vision/types/Cone";

/** Each tile is split into this many squares a side, so a place is a quarter of a tile across. */
const SQUARES_PER_TILE_SIDE = 4;

/**
 * The floor, in small squares, where a crouched fighter would be hidden from the viewer whose cone this is, and which the viewer sees: the same
 * `coverBesideTarget` question that hides a fighter and shields them from a bullet, asked of each square next to a cover block. A block
 * can only hide a place within `COVER_REACH_TILES` of it, which is never farther than the tiles around it, so only those are asked. It says where a
 * hiding fighter could be, never whether one is there.
 */
export function hidingPlacesOf(arena: Arena, cone: Cone): readonly HidingPlace[] {
  const places: HidingPlace[] = [];

  // A block's far corner is under 0.71 tile from its centre, and what it hides lies a tile past that.
  for (const tile of tilesBesideCover(arena, {centre: cone.apex, radius: cone.range + 2})) {
    for (const place of squaresOfTile(tile)) {
      const centre = {x: place.x + place.size / 2, y: place.y + place.size / 2};
      if (coverBesideTarget(arena, cone.apex, centre) && canSeePoint(arena, cone, centre)) {
        places.push(place);
      }
    }
  }

  return places;
}

function squaresOfTile(tile: Point): readonly HidingPlace[] {
  const size = 1 / SQUARES_PER_TILE_SIDE;

  return Array.from({length: SQUARES_PER_TILE_SIDE * SQUARES_PER_TILE_SIDE}, (_, index) => ({
    x: tile.x + (index % SQUARES_PER_TILE_SIDE) * size,
    y: tile.y + Math.floor(index / SQUARES_PER_TILE_SIDE) * size,
    size,
  }));
}
