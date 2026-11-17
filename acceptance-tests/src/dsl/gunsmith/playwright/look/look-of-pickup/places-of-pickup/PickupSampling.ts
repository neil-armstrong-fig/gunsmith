import type {Point} from "@src/dsl/gunsmith/types/Point";

/** The square around a pickup that is sampled, in tiles: a drawing at half scale is about 0.71 across, and a fighter stands three tiles away. */
const HALF_SIDE_TILES = 0.4;
const GAP_TILES = 0.025;

/** The places to read over a pickup centred on `centre`: an even grid, `GAP_TILES` apart. */
export function pickupSampling(centre: Point): Point[] {
  const perSide = Math.round((HALF_SIDE_TILES * 2) / GAP_TILES) + 1;

  return Array.from({length: perSide * perSide}, (_, index) => ({
    x: centre.x - HALF_SIDE_TILES + (index % perSide) * GAP_TILES,
    y: centre.y - HALF_SIDE_TILES + Math.floor(index / perSide) * GAP_TILES,
  }));
}
