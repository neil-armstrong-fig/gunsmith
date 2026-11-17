import type {Point} from "@gunsmith/engine/geometry/types/Point";

/** Where a tile is, as a person reads the drawing: the column from the left and the row from the top, both counted from 1. */
export function whereIsTile(arenaHeight: number, tile: Point): string {
  return `column ${tile.x + 1}, row ${arenaHeight - tile.y}`;
}
