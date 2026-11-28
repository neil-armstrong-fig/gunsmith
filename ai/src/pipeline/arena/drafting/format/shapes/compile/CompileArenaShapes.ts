import {drawShapes} from "@gunsmith/ai/pipeline/arena/drafting/format/shapes/drawing/DrawShapes";
import {fillRectangle} from "@gunsmith/ai/pipeline/arena/drafting/format/shapes/drawing/FillRectangle";
import {outsideTheArena} from "@gunsmith/ai/pipeline/arena/drafting/format/shapes/drawing/OutsideTheArena";
import type {ArenaShapes} from "@gunsmith/ai/pipeline/arena/drafting/format/shapes/draft/ArenaShapesDraft";
import type {ArenaShapesCompilation} from "@gunsmith/ai/pipeline/arena/drafting/format/shapes/types/ArenaShapesCompilation";
import type {ShapeRectangle} from "@gunsmith/ai/pipeline/arena/drafting/format/shapes/types/ShapeRectangle";

const FLOOR = ".";
const WALL = "#";
const COVER = "c";

/**
 * Draws an arena's shapes into the rows of a drawing, the characters `arenaFrom` reads: its open area, then the shapes (`drawShapes`).
 * The open area is the whole rectangle, or with a `floor` list only its rectangles, every other tile wall; cover drawn outside it is
 * walled in too, since no fighter could reach it. A shape that reaches past the arena is refused with a sentence naming it, because the
 * repair shows the model that sentence. Whether the drawing can be played is not asked here: the result goes through the same check as
 * any other drawing.
 */
export function compileArenaShapes(shapes: ArenaShapes): ArenaShapesCompilation {
  const errors = outsideTheArena(shapes, shapes);
  if (errors.length > 0) {
    return {ok: false, errors};
  }

  const openArea = openAreaOf(shapes);
  const grid = Array.from({length: shapes.height}, () => Array.from({length: shapes.width}, () => WALL));
  for (const rectangle of openArea) {
    fillRectangle(grid, rectangle, FLOOR);
  }

  drawShapes(grid, shapes);
  wallInCoverOutside(grid, openArea);

  return {ok: true, drawing: {name: shapes.name, rows: grid.map(row => row.join(""))}};
}

function openAreaOf(shapes: ArenaShapes): readonly ShapeRectangle[] {
  if (shapes.floor && shapes.floor.length > 0) {
    return shapes.floor;
  }

  return [{x: 0, y: 0, width: shapes.width, height: shapes.height}];
}

function wallInCoverOutside(grid: string[][], openArea: readonly ShapeRectangle[]): void {
  grid.forEach((row, y) => {
    row.forEach((tile, x) => {
      if (tile === COVER && !openArea.some(rectangle => contains(rectangle, x, y))) {
        row[x] = WALL;
      }
    });
  });
}

function contains(rectangle: ShapeRectangle, x: number, y: number): boolean {
  return (
    x >= rectangle.x && x < rectangle.x + rectangle.width && y >= rectangle.y && y < rectangle.y + rectangle.height
  );
}
