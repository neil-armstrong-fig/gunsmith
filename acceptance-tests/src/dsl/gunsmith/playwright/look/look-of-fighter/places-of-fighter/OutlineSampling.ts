import type {Point} from "@src/dsl/gunsmith/types/Point";

/**
 * How far the circle walls stop is from the player's centre, in tiles (the engine's `PLAYER_RADIUS`, which a spec may not import), how many compass points to look at on
 * it, and how far either side of it to look too: the outline is two pixels wide, so a place on its very edge is blended with what is beside it.
 */
const BODY_RADIUS_TILES = 0.4;
const COMPASS_POINTS = 8;
const OUTLINE_REACH_TILES = 0.015;

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
