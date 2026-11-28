import type {ArenaSize} from "@gunsmith/ai/pipeline/arena/drafting/format/shapes/types/ArenaSize";
import type {ShapesToCheck} from "@gunsmith/ai/pipeline/arena/drafting/format/shapes/types/ShapesToCheck";

/** A sentence for each rectangle or stair that is not wholly on the grid. */
export function outsideTheArena(size: ArenaSize, shapes: ShapesToCheck): string[] {
  const lastColumn = size.width - 1;
  const lastRow = size.height - 1;
  const errors: string[] = [];

  const lists = [
    ["clears", shapes.clears],
    ["floor", shapes.floor],
    ["walls", shapes.walls],
    ["covers", shapes.covers],
    ["platforms", shapes.platforms],
  ] as const;

  for (const [listName, rectangles] of lists) {
    (rectangles ?? []).forEach((rectangle, index) => {
      const name = `${listName}[${index}]`;
      const endColumn = rectangle.x + rectangle.width - 1;
      const endRow = rectangle.y + rectangle.height - 1;

      if (endColumn > lastColumn) {
        errors.push(
          `${name} reaches column ${endColumn} but the arena is ${size.width} wide (columns 0 to ${lastColumn}): make it end at column ${lastColumn} or sooner.`,
        );
      }

      if (endRow > lastRow) {
        errors.push(
          `${name} reaches row ${endRow} but the arena is ${size.height} tall (rows 0 to ${lastRow}): make it end at row ${lastRow} or sooner.`,
        );
      }
    });
  }

  (shapes.stairs ?? []).forEach((stair, index) => {
    if (stair.x > lastColumn) {
      errors.push(
        `stairs[${index}] is at column ${stair.x} but the arena is ${size.width} wide (columns 0 to ${lastColumn}).`,
      );
    }

    if (stair.y > lastRow) {
      errors.push(`stairs[${index}] is at row ${stair.y} but the arena is ${size.height} tall (rows 0 to ${lastRow}).`);
    }
  });

  return errors;
}
