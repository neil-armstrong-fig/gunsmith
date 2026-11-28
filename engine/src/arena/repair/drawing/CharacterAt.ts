import type {DrawnTile} from "@gunsmith/engine/arena/repair/types/DrawnTile";

/** What is drawn on a tile, or `undefined` for a place outside the drawing. */
export function characterAt(rows: readonly string[], tile: DrawnTile): string | undefined {
  return rows[tile.row]?.[tile.column];
}
