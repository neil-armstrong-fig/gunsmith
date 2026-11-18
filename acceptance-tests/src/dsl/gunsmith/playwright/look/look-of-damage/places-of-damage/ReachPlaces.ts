import {NEAREST_REACH} from "@src/dsl/gunsmith/playwright/look/look-of-damage/NearestReach";
import {TILES_PER_STUDY_PIXEL} from "@src/dsl/gunsmith/playwright/look/look-of-damage/places-of-damage/TilesPerStudyPixel";
import type {Point} from "@src/dsl/gunsmith/types/Point";

/** How far out, in the study's pixels, `reachPlaces` looks: the bracket stands 25 out and opens up to 8 more. */
const FARTHEST_REACH = 36;

/** Places in a line out from the body's centre to the left, one study pixel apart, through the middle of the left bracket's bar: where it stands is how far out it has opened. */
export function reachPlaces(centre: Point): Point[] {
  const places: Point[] = [];

  for (let out = NEAREST_REACH; out <= FARTHEST_REACH; out += 1) {
    places.push({x: centre.x - out * TILES_PER_STUDY_PIXEL, y: centre.y});
  }

  return places;
}
