import {TILES_PER_STUDY_PIXEL} from "@src/dsl/gunsmith/playwright/look/look-of-damage/places-of-damage/TilesPerStudyPixel";
import type {Point} from "@src/dsl/gunsmith/types/Point";

/** Each tick lies between 17 and 24 of the study's pixels out from the centre along both axes, the tip toward the body (`Study.html`, the outgoing hit). */
const NEAREST_STUDY_PIXELS = 17;
const FARTHEST_STUDY_PIXELS = 24;
const PLACES_ALONG_A_TICK = 8;

/** The places along the tick in one corner of a body centred on `centre`: `corner`'s x and y are each -1 or 1 (arena y runs north), which corner. */
export function tickPlaces(centre: Point, corner: Point): Point[] {
  const places: Point[] = [];

  for (let step = 0; step < PLACES_ALONG_A_TICK; step += 1) {
    const pixels =
      NEAREST_STUDY_PIXELS + ((FARTHEST_STUDY_PIXELS - NEAREST_STUDY_PIXELS) * step) / (PLACES_ALONG_A_TICK - 1);

    places.push({
      x: centre.x + corner.x * pixels * TILES_PER_STUDY_PIXEL,
      y: centre.y + corner.y * pixels * TILES_PER_STUDY_PIXEL,
    });
  }

  return places;
}
