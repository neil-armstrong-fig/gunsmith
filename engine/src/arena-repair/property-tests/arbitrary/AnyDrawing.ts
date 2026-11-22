import fc from "fast-check";

const LARGEST_SIDE = 10;
const SMALLEST_SIDE = 3;

/** Every tile a model might draw, floor and wall most often, so the arenas are mostly open with walls, platforms and stairs scattered through them. */
const TILES = [".", ".", ".", ".", "#", "#", "c", "1", "2", "<", ">", "^", "v"] as const;

/**
 * Any bordered drawing of a few tiles on a side: a wall all round and, inside, floor, walls, cover, platforms of both levels and
 * stairs climbing any way, scattered with no regard for whether the engine would read them or the floor is one piece, which is what a model
 * can draw.
 */
export function anyDrawing(): fc.Arbitrary<string[]> {
  return fc
    .record({
      width: fc.integer({min: SMALLEST_SIDE, max: LARGEST_SIDE}),
      height: fc.integer({min: SMALLEST_SIDE, max: LARGEST_SIDE}),
    })
    .chain(({width, height}) => {
      const inside = (width - 2) * (height - 2);

      return fc.array(fc.constantFrom(...TILES), {minLength: inside, maxLength: inside}).map(tiles => {
        return drawingOf(width, height, tiles);
      });
    });
}

function drawingOf(width: number, height: number, tiles: readonly string[]): string[] {
  const rows: string[] = [];

  for (let row = 0; row < height; row += 1) {
    if (row === 0 || row === height - 1) {
      rows.push("#".repeat(width));
      continue;
    }

    const start = (row - 1) * (width - 2);
    rows.push(`#${tiles.slice(start, start + width - 2).join("")}#`);
  }

  return rows;
}
