import {drawShapes} from "@gunsmith/ai/pipeline/arena/arena-shapes/drawing/DrawShapes";
import {outsideTheArena} from "@gunsmith/ai/pipeline/arena/arena-shapes/drawing/OutsideTheArena";
import type {ArenaShapes} from "@gunsmith/ai/pipeline/arena/arena-shapes/draft/ArenaShapesDraft";
import type {ArenaShapesCompilation} from "@gunsmith/ai/pipeline/arena/arena-shapes/types/ArenaShapesCompilation";

const FLOOR = ".";

/**
 * Draws an arena's shapes into the rows of a drawing, the characters `arenaFrom` reads: floor, then the shapes (`drawShapes`). A shape
 * that reaches past the arena is refused with a sentence naming it, because the repair shows the model that sentence. Whether the
 * drawing can be played is not asked here: the result goes through the same check as any other drawing.
 */
export function compileArenaShapes(shapes: ArenaShapes): ArenaShapesCompilation {
  const errors = outsideTheArena(shapes, shapes);
  if (errors.length > 0) {
    return {ok: false, errors};
  }

  const grid = Array.from({length: shapes.height}, () => Array.from({length: shapes.width}, () => FLOOR));
  drawShapes(grid, shapes);

  return {ok: true, drawing: {name: shapes.name, rows: grid.map(row => row.join(""))}};
}
