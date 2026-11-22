import type {Page} from "@playwright/test";
import {colourIsNear} from "@src/dsl/gunsmith/playwright/look/ColourIsNear";
import type {PickupBodyLook} from "@src/dsl/gunsmith/components/pickup/types/PickupBodyLook";
import {coloursAtTiles} from "@src/dsl/gunsmith/playwright/screen/ColoursAtTiles";
import type {Point} from "@src/dsl/gunsmith/types/Point";

// The stand-in's body is 40 by 12 of the drawing's 64 units, and a unit is about 1/90 tile at the half scale a pickup is drawn at, so the body
// reaches 0.27 tile one way and 0.18 the other along its length and 0.07 either side. Read the middle: short of its ends, away from the muzzle
// (which begins 0.18 tile along) and from the C2 marker's corners (which begin 0.18 tile out), and inside its width.
const HALF_LENGTH_TILES = 0.15;
const HALF_WIDTH_TILES = 0.025;
const GAP_TILES = 0.025;
// Apart means more than this in some part of the colour: the wall's dark against the lowest floor differs by about a tenth of this.
const APART_BY = 40;

/** Reads the middle of the body against a clear tile of the same floor, in the same screenshot, so the light and the fog are the same for both. */
export async function lookOfPickupBody(page: Page, centre: Point, clearFloor: Point): Promise<PickupBodyLook> {
  const lengthwise = Math.round((HALF_LENGTH_TILES * 2) / GAP_TILES) + 1;
  const widthwise = Math.round((HALF_WIDTH_TILES * 2) / GAP_TILES) + 1;
  const offsets = Array.from({length: lengthwise * widthwise}, (_, index) => ({
    x: -HALF_LENGTH_TILES + (index % lengthwise) * GAP_TILES,
    y: -HALF_WIDTH_TILES + Math.floor(index / lengthwise) * GAP_TILES,
  }));
  const colours = await coloursAtTiles(
    page,
    [centre, clearFloor].flatMap(origin => offsets.map(({x, y}) => ({x: origin.x + x, y: origin.y + y}))),
  );
  const apart = offsets.filter((_, index) => {
    const colour = colours[index];
    const floor = colours[index + offsets.length];
    if (!colour || !floor) {
      throw new Error("The screenshot did not include the weapon's body and its floor reference.");
    }

    return !colourIsNear(colour, floor, APART_BY);
  });

  return {sampled: offsets.length, apartFromFloor: apart.length};
}
