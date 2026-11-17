import type {Point} from "@src/dsl/gunsmith/types/Point";

/** The square around the player that is sampled to see their drawing, in tiles (a sprite is about 1.4 across), and the gap between samples. */
const HALF_SIDE_TILES = 0.75;
const GAP_TILES = 0.025;

/** The places to read over a drawing centred on `centre`: an even grid, `GAP_TILES` apart. */
export function lookSampling(centre: Point): Point[] {
  const perSide = Math.round((HALF_SIDE_TILES * 2) / GAP_TILES) + 1;

  return Array.from({length: perSide * perSide}, (_, index) => ({
    x: centre.x - HALF_SIDE_TILES + (index % perSide) * GAP_TILES,
    y: centre.y - HALF_SIDE_TILES + Math.floor(index / perSide) * GAP_TILES,
  }));
}
