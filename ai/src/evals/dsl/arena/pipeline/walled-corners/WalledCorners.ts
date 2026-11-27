/** Each way, a corner is this fraction of the arena inside its border wall: small enough that a plus sign with thick arms still has corners. */
const CORNER_FRACTION = 1 / 6;
/** The share of a corner's tiles that must be wall for it to count as walled in, so a stray floor tile or two is allowed. */
const WALLED_SHARE = 0.9;

/**
 * How many of an arena's four corners are walled in, read from its drawing: the block inside the border wall at each corner, a sixth of
 * the inner width by a sixth of the inner height, counts when at least nine tenths of it is wall (`#`). Open floor in a rectangle has
 * none walled, a plus sign four and an L one, so a layout request can be checked against the shape asked for. It reads only the rows the
 * player was given, never the shapes the model wrote.
 */
export function walledCorners(rows: readonly string[]): number {
  const height = rows.length;
  const width = rows[0]?.length ?? 0;
  if (width < 3 || height < 3) return 0;

  const blockWidth = Math.max(1, Math.floor((width - 2) * CORNER_FRACTION));
  const blockHeight = Math.max(1, Math.floor((height - 2) * CORNER_FRACTION));
  const corners = [1, height - 1 - blockHeight].flatMap(top => {
    return [1, width - 1 - blockWidth].map(left => {
      return rows.slice(top, top + blockHeight).flatMap(row => [...row.slice(left, left + blockWidth)]);
    });
  });

  return corners.filter(isWalled).length;
}

function isWalled(tiles: string[]): boolean {
  return tiles.filter(tile => tile === "#").length >= WALLED_SHARE * tiles.length;
}
