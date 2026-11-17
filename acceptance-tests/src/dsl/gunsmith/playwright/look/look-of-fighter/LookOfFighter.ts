import type {Page} from "@playwright/test";
import {colourIsNear} from "@src/dsl/gunsmith/playwright/look/ColourIsNear";
import {colourIsPaleGrey} from "@src/dsl/gunsmith/playwright/look/ColourIsPaleGrey";
import {lookSampling} from "@src/dsl/gunsmith/playwright/look/look-of-fighter/places-of-fighter/LookSampling";
import {outlineSampling} from "@src/dsl/gunsmith/playwright/look/look-of-fighter/places-of-fighter/OutlineSampling";
import {coloursAtTiles} from "@src/dsl/gunsmith/playwright/screen/ColoursAtTiles";
import type {Colour} from "@src/dsl/gunsmith/types/Colour";
import type {FighterLook} from "@src/dsl/gunsmith/types/FighterLook";
import type {Point} from "@src/dsl/gunsmith/types/Point";

// The colours art's fighter drawings are made of (`docs/art/asset-reference/players/`): the neutral body's grey and the grey-blue outline round it.
// A team shows only in its stripes. The old placeholder discs were close to the team colours (tone mapping paled them), so only the grey
// body, the outline at the hitbox's radius and the lack of any pale grey say the drawing is there.
const BODY_GREY: Colour = {red: 0x30, green: 0x40, blue: 0x4f};
const OUTLINE_GREY: Colour = {red: 0x91, green: 0xa2, blue: 0xb2};
const TOLERANCE = 6;

// A thin line is blurred a little at its edges, so the outline is matched more loosely than the flat fills.
const OUTLINE_TOLERANCE = 16;

/**
 * What a player sees where a fighter stands: a grid of places over their drawing, counted by colour (`teamColour` is the colour of their stripes), and the
 * compass points on their outline. The fighter must be standing still.
 */
export async function lookOfFighter(page: Page, centre: Point, teamColour: Colour): Promise<FighterLook> {
  const grid = lookSampling(centre);
  const outline = outlineSampling(centre);

  // One screenshot for all of them, so they show the same moment.
  const colours = await coloursAtTiles(page, [...grid, ...outline.flat()]);
  const gridColours = colours.slice(0, grid.length);
  const outlineColours = colours.slice(grid.length);

  return {
    bodyPixels: gridColours.filter(colour => colourIsNear(colour, BODY_GREY, TOLERANCE)).length,
    teamPixels: gridColours.filter(colour => colourIsNear(colour, teamColour, TOLERANCE)).length,
    placeholderPixels: gridColours.filter(colourIsPaleGrey).length,
    outlinePoints: outline.filter((across, point) => {
      const first = point * across.length;

      return outlineColours
        .slice(first, first + across.length)
        .some(colour => colourIsNear(colour, OUTLINE_GREY, OUTLINE_TOLERANCE));
    }).length,
  };
}
