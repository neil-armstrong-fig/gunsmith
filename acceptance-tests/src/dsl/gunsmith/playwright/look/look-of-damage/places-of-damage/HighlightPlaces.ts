import type {Point} from "@src/dsl/gunsmith/types/Point";

/** The red highlight is a thin circle of about half a tile round the body's centre (the body is 0.4 tile in radius), inside where the brackets stand. */
const HIGHLIGHT_RADII_TILES = [0.51, 0.53, 0.55];
const COMPASS_POINTS = 24;

/** The places the highlight would cover: three radii across its width, round the whole circle. */
export function highlightPlaces(centre: Point): Point[] {
  const places: Point[] = [];

  for (const radius of HIGHLIGHT_RADII_TILES) {
    for (let point = 0; point < COMPASS_POINTS; point += 1) {
      const angle = (point / COMPASS_POINTS) * 2 * Math.PI;
      places.push({x: centre.x + radius * Math.cos(angle), y: centre.y + radius * Math.sin(angle)});
    }
  }

  return places;
}
