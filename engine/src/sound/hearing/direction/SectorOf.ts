import type {Point} from "@gunsmith/engine/geometry/types/Point";
import type {Sector} from "@gunsmith/engine/sound/types/Sector";

const SECTOR_COUNT = 8;

/**
 * Which of the eight directions `to` lies in as heard from `from`, each sector an eighth of a turn wide and centred on a compass
 * point, so sector 0 is 22.5 degrees either side of north and the rest follow clockwise. It says nothing of how far, and a
 * sound from the very same place has no direction and is sector 0.
 */
export function sectorOf(from: Point, to: Point): Sector {
  const turnsClockwiseFromNorth = Math.atan2(to.x - from.x, to.y - from.y) / (2 * Math.PI);
  const sector = Math.round(turnsClockwiseFromNorth * SECTOR_COUNT);

  return (sector + SECTOR_COUNT) % SECTOR_COUNT;
}
