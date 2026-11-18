import {TILES_PER_STUDY_PIXEL} from "@src/dsl/gunsmith/playwright/look/look-of-damage/places-of-damage/TilesPerStudyPixel";
import type {Point} from "@src/dsl/gunsmith/types/Point";

/**
 * Where the art study (`docs/art/concepts/combat-feedback/Study.html`) draws a bracket of a hit, as places round a body centred on `centre`: each stands 25
 * pixels either side of the centre, 30 pixels tall, and opens outward by up to 8 pixels, so it is looked for along three strips across all of that.
 */
export function bracketPlaces(centre: Point, side: "left" | "right"): Point[] {
  const sign = side === "left" ? -1 : 1;
  const places: Point[] = [];

  for (const across of [-0.3, 0, 0.3]) {
    for (let out = 24; out <= 36; out += 1) {
      places.push({x: centre.x + sign * out * TILES_PER_STUDY_PIXEL, y: centre.y + across});
    }
  }

  return places;
}
