/**
 * The floor colour of each level, low to high: the palette's `--color-gs-floor-l1` to `l3` in `index.css`, which WebGL cannot read
 * from CSS, so they are repeated here. Each is lighter than the one below, so a raised floor reads as raised with no label.
 */
const LEVEL_COLOURS = ["#202b36", "#30404f", "#465a6b"] as const;

/** The floor colour of `level`; a level beyond the third gets the third's, and a level below the first, which no arena has, the first's. */
export function levelColour(level: number): string {
  const index = Math.min(Math.floor(level), LEVEL_COLOURS.length - 1);

  return LEVEL_COLOURS[index] ?? LEVEL_COLOURS[0];
}
