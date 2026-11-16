import type {Point} from "@src/dsl/gunsmith/types/Point";

/** The square around the player that is sampled to see their drawing, in tiles (a sprite is about 1.4 across), and the gap between samples. */
const HALF_SIDE_TILES = 0.75;
const GAP_TILES = 0.025;

/**
 * How far the circle walls stop is from the player's centre, in tiles (the engine's `PLAYER_RADIUS`, which a spec may not import), how many compass points to look at on
 * it, and how far either side of it to look too: the outline is two pixels wide, so a place on its very edge is blended with what is beside it.
 */
const BODY_RADIUS_TILES = 0.4;
const COMPASS_POINTS = 8;
const OUTLINE_REACH_TILES = 0.015;

/** The places to read over a drawing centred on `centre`: an even grid, `GAP_TILES` apart. */
export function lookSampling(centre: Point): Point[] {
  const perSide = Math.round((HALF_SIDE_TILES * 2) / GAP_TILES) + 1;

  return Array.from({length: perSide * perSide}, (_, index) => ({
    x: centre.x - HALF_SIDE_TILES + (index % perSide) * GAP_TILES,
    y: centre.y - HALF_SIDE_TILES + Math.floor(index / perSide) * GAP_TILES,
  }));
}

/** For each compass point, the places across where the body's outline should be: round the circle walls stop, evenly spaced, whichever way the player faces. */
export function outlineSampling(centre: Point): Point[][] {
  return Array.from({length: COMPASS_POINTS}, (_, point) => {
    const angle = (point / COMPASS_POINTS) * 2 * Math.PI;

    return [-OUTLINE_REACH_TILES, 0, OUTLINE_REACH_TILES].map(reach => ({
      x: centre.x + (BODY_RADIUS_TILES + reach) * Math.cos(angle),
      y: centre.y + (BODY_RADIUS_TILES + reach) * Math.sin(angle),
    }));
  });
}
