import {drawShapes} from "@gunsmith/ai/pipeline/arena/drafting/format/shapes/drawing/DrawShapes";
import {fillRectangle} from "@gunsmith/ai/pipeline/arena/drafting/format/shapes/drawing/FillRectangle";
import {outsideTheArena} from "@gunsmith/ai/pipeline/arena/drafting/format/shapes/drawing/OutsideTheArena";
import type {ArenaEdit} from "@gunsmith/ai/pipeline/arena/drafting/format/edit-built-in/ArenaEditDraft";
import type {ArenaShapesCompilation} from "@gunsmith/ai/pipeline/arena/drafting/format/shapes/types/ArenaShapesCompilation";

const FLOOR = ".";

/**
 * Draws an edit onto the rows of the arena it starts from: the rectangles it clears go back to floor first, then its shapes are
 * drawn on top (`drawShapes`, which keeps the border). A rectangle that reaches past the base is refused with a sentence naming it.
 * Whether the result can be played is not asked here: it goes through the same check as any other drawing.
 */
export function applyArenaEdit(baseRows: readonly string[], edit: Omit<ArenaEdit, "base">): ArenaShapesCompilation {
  const size = {width: baseRows[0]?.length ?? 0, height: baseRows.length};

  const errors = outsideTheArena(size, edit);
  if (errors.length > 0) {
    return {ok: false, errors};
  }

  const grid = baseRows.map(row => [...row]);

  for (const clear of edit.clears ?? []) {
    fillRectangle(grid, clear, FLOOR);
  }

  drawShapes(grid, edit);

  return {ok: true, drawing: {name: edit.name, rows: grid.map(row => row.join(""))}};
}
