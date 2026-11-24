import type {ShapeRectangle} from "@gunsmith/ai/pipeline/arena/arena-shapes/types/ShapeRectangle";

/** Draws one character over a rectangle of a grid, in place. The rectangle must lie inside the grid (`outsideTheArena`): a column past the east edge would lengthen a row. */
export function fillRectangle(grid: string[][], rectangle: ShapeRectangle, character: string): void {
  for (let y = rectangle.y; y < rectangle.y + rectangle.height; y += 1) {
    for (let x = rectangle.x; x < rectangle.x + rectangle.width; x += 1) {
      const row = grid[y];
      if (row !== undefined) {
        row[x] = character;
      }
    }
  }
}
