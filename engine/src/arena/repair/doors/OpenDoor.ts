import {FLOOR} from "@gunsmith/engine/arena/drawing/level/Floor";
import {characterAt} from "@gunsmith/engine/arena/repair/drawing/CharacterAt";
import {withCharacter} from "@gunsmith/engine/arena/repair/drawing/WithCharacter";
import {cheapestWay} from "@gunsmith/engine/arena/repair/doors/cheapest-way/CheapestWay";
import type {OpenedDoor} from "@gunsmith/engine/arena/repair/doors/types/OpenedDoor";
import type {DrawnTile} from "@gunsmith/engine/arena/repair/types/DrawnTile";

/**
 * Cuts the cheapest way through the walls between a cut-off piece of floor and
 * the arena, drawing each tile cut as floor: a doorway as wide as the wall is thick. Nothing when there is no way.
 */
export function openDoor(
  rows: readonly string[],
  from: readonly DrawnTile[],
  to: readonly DrawnTile[],
): OpenedDoor | undefined {
  const way = cheapestWay(rows, {from, to});
  if (way === undefined) {
    return undefined;
  }

  let opened = [...rows];
  let tiles = 0;
  for (const tile of way) {
    if (characterAt(rows, tile) !== FLOOR) {
      opened = withCharacter(opened, tile, FLOOR);
      tiles += 1;
    }
  }

  return {rows: opened, tiles};
}
