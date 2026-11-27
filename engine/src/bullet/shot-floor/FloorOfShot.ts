import {isSolid} from "@gunsmith/engine/arena/IsSolid";
import {levelOfTile} from "@gunsmith/engine/arena/LevelOfTile";
import type {Arena} from "@gunsmith/engine/arena/types/Arena";
import type {ShotRequest} from "@gunsmith/engine/bullet/types/ShotRequest";
import {EDGE_REACH_TILES} from "@gunsmith/engine/height/EdgeReach";

/** The shot's path is looked along this often, so no tile within reach is skipped. */
const SAMPLE_SPACING = 0.1;

/**
 * The lowest level a new bullet can hurt something on: the lowest floor along the shot within `EDGE_REACH_TILES` of the shooter,
 * and never above their own level. A shooter back from a platform's edge has only their own level within reach, so their shot
 * flies over the low ground; one at the edge has the low ground below within reach, and can hit what stands on it.
 */
export function floorOfShot(arena: Arena, shot: ShotRequest): number {
  const samples = Math.ceil(EDGE_REACH_TILES / SAMPLE_SPACING);
  let floor = shot.level;
  for (let sample = 0; sample <= samples; sample += 1) {
    const travelled = (EDGE_REACH_TILES * sample) / samples;
    const tileX = Math.floor(shot.from.x + shot.aim.x * travelled);
    const tileY = Math.floor(shot.from.y + shot.aim.y * travelled);
    if (!isSolid(arena, tileX, tileY)) {
      floor = Math.min(floor, levelOfTile(arena, tileX, tileY));
    }
  }

  return floor;
}
