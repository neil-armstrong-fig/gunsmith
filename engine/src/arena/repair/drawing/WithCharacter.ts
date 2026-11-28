import type {DrawnTile} from "@gunsmith/engine/arena/repair/types/DrawnTile";

/** The drawing with one tile drawn as another character; the rows given are not changed. */
export function withCharacter(rows: readonly string[], tile: DrawnTile, character: string): string[] {
  const changed = [...rows];
  const row = rows[tile.row];
  if (row === undefined) {
    return changed;
  }

  changed[tile.row] = row.slice(0, tile.column) + character + row.slice(tile.column + 1);

  return changed;
}
