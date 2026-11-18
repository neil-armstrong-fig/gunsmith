import type {Page} from "@playwright/test";
import {colourIsNear} from "@src/dsl/gunsmith/playwright/look/ColourIsNear";
import {coloursAtTiles} from "@src/dsl/gunsmith/playwright/screen/ColoursAtTiles";
import type {Colour} from "@src/dsl/gunsmith/types/Colour";
import type {Point} from "@src/dsl/gunsmith/types/Point";

const OUTLINE: Colour = {red: 0x91, green: 0xa2, blue: 0xb2};
const ACROSS_BARREL = [-0.065, -0.042, 0.042, 0.065];
const ALONG_BARREL = [0.53, 0.57, 0.61, 0.65];

/** The rifle has a slate outline running along both sides of the barrel, beyond the body and hand. */
export async function hasRifleOnScreen(page: Page, centre: Point, aimDegrees: number): Promise<boolean> {
  const radians = (aimDegrees * Math.PI) / 180;
  const forwardX = Math.cos(radians);
  const forwardY = Math.sin(radians);
  const places = ALONG_BARREL.flatMap(along => {
    return ACROSS_BARREL.map(across => ({
      x: centre.x + along * forwardX - across * forwardY,
      y: centre.y + along * forwardY + across * forwardX,
    }));
  });
  const colours = await coloursAtTiles(page, places);

  return (
    ALONG_BARREL.filter((_, index) => {
      const start = index * ACROSS_BARREL.length;
      return (
        colours.slice(start, start + 2).some(colour => colourIsNear(colour, OUTLINE, 40)) &&
        colours.slice(start + 2, start + 4).some(colour => colourIsNear(colour, OUTLINE, 40))
      );
    }).length >= 2
  );
}
