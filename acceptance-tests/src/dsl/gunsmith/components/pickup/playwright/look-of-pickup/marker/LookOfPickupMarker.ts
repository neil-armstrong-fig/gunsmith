import type {Page} from "@playwright/test";
import {colourIsNear} from "@src/dsl/gunsmith/playwright/look/ColourIsNear";
import {floorColour} from "@src/dsl/gunsmith/components/pickup/playwright/look-of-pickup/floor/FloorColour";
import type {PickupMarkerLook} from "@src/dsl/gunsmith/components/pickup/types/PickupMarkerLook";
import {coloursAtTiles} from "@src/dsl/gunsmith/playwright/screen/ColoursAtTiles";
import type {Colour} from "@src/dsl/gunsmith/types/Colour";
import type {Point} from "@src/dsl/gunsmith/types/Point";

const PALE_LINE: Colour = {red: 0xe5, green: 0xea, blue: 0xf0};
const STROKE_TOLERANCE = 65;
const FLOOR_TOLERANCE = 12;
// Art's 88-unit canvas at half scale. Read the whole canvas closely enough to catch a dim one-pixel stroke.
const HALF_SIDE = 44;
const DESIGN_PIXELS_PER_TILE = 90;
const QUADRANTS = [
  [1, 1],
  [1, -1],
  [-1, 1],
  [-1, -1],
] as const;

const CARDINAL_GAPS = [
  [0, 37],
  [37, 0],
  [0, -37],
  [-37, 0],
] as const;

export async function lookOfPickupMarker(page: Page, centre: Point): Promise<PickupMarkerLook> {
  const offsets = Array.from({length: 2 * HALF_SIDE + 1}, (_, index) => index - HALF_SIDE);
  const places = offsets.flatMap(y => offsets.map(x => ({x, y})));
  const colours = await coloursAtTiles(
    page,
    places.map(({x, y}) => ({x: centre.x + x / DESIGN_PIXELS_PER_TILE, y: centre.y + y / DESIGN_PIXELS_PER_TILE})),
  );
  const floor = floorColour(colours);
  const pale = places.filter((_, index) => {
    const colour = colours[index];
    return colour !== undefined && colourIsNear(colour, PALE_LINE, STROKE_TOLERANCE);
  });
  const marked = places.filter((_, index) => {
    const colour = colours[index];
    return colour !== undefined && !colourIsNear(colour, floor, FLOOR_TOLERANCE);
  });

  return {
    corners: QUADRANTS.filter(([x, y]) => {
      return near(pale, 16 * x, 37 * y) && near(pale, 29 * x, 29 * y) && near(pale, 37 * x, 16 * y);
    }).length,
    gaps: CARDINAL_GAPS.filter(([x, y]) => !near(marked, x, y)).length,
    markedPixels: marked.length,
  };
}

// Allow for the screenshot's pixel rounding at the edges of the stroke.
function near(places: readonly Point[], x: number, y: number): boolean {
  return places.some(place => Math.abs(place.x - x) <= 2 && Math.abs(place.y - y) <= 2);
}
