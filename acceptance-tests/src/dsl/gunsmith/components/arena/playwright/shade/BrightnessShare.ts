import type {Page} from "@playwright/test";
import {coloursAtTiles} from "@src/dsl/gunsmith/playwright/screen/ColoursAtTiles";
import type {Colour} from "@src/dsl/gunsmith/types/Colour";
import type {Point} from "@src/dsl/gunsmith/types/Point";

// A patch of this many places a side, this far apart, is averaged at each place, so the floor's own pattern does not decide the answer.
const PLACES_ACROSS = 5;
const GAP_TILES = 0.05;

/**
 * How bright the floor at `place` shows, as a share of the floor at `clearFloor`, read from one screenshot so the light and the fog are the
 * same for both: 1 is as bright, 0.8 is a fifth darker. Each is the mean of a small patch of the screen's red, green and blue.
 */
export async function brightnessShare(page: Page, place: Point, clearFloor: Point): Promise<number> {
  const offsets = Array.from({length: PLACES_ACROSS * PLACES_ACROSS}, (_, index) => ({
    x: (Math.floor(index / PLACES_ACROSS) - (PLACES_ACROSS - 1) / 2) * GAP_TILES,
    y: ((index % PLACES_ACROSS) - (PLACES_ACROSS - 1) / 2) * GAP_TILES,
  }));
  const colours = await coloursAtTiles(
    page,
    [place, clearFloor].flatMap(origin => offsets.map(({x, y}) => ({x: origin.x + x, y: origin.y + y}))),
  );
  const shown = meanBrightness(colours.slice(0, offsets.length));
  const reference = meanBrightness(colours.slice(offsets.length));

  return shown / reference;
}

function meanBrightness(colours: readonly Colour[]): number {
  const total = colours.reduce((sum, {red, green, blue}) => sum + red + green + blue, 0);

  return total / (colours.length * 3);
}
