import type {Page} from "@playwright/test";
import {colourIsNear} from "@src/dsl/gunsmith/playwright/look/ColourIsNear";
import {floorColour} from "@src/dsl/gunsmith/components/pickup/playwright/look-of-pickup/floor/FloorColour";
import {pickupSampling} from "@src/dsl/gunsmith/components/pickup/playwright/look-of-pickup/places-of-pickup/PickupSampling";
import {coloursAtTiles} from "@src/dsl/gunsmith/playwright/screen/ColoursAtTiles";
import type {Colour} from "@src/dsl/gunsmith/types/Colour";
import type {PickupLook} from "@src/dsl/gunsmith/types/PickupLook";
import type {Point} from "@src/dsl/gunsmith/types/Point";

// Only colours the drawing alone has near a pickup: the weapon blue (`--color-gs-weapon-blue`) of the lantern's cage and the pale text grey
// (`--color-gs-ui-text`) of its core. The body grey is the wall's colour and the outline the background's, so neither is counted.
// The placeholder disc's mint is counted too, since the drawing replaces it. Its material is tone-mapped, so the screen shows it paler than its
// `#7ee0c3` (measured: 168, 216, 202); matching the source colour counted nothing and let "the disc is gone" pass with the disc on the screen.
// These are flat fills, so a drawing drawn with `toneMapped={false}` reads them exactly, give or take edges.
const WEAPON_BLUE: Colour = {red: 0x62, green: 0xb5, blue: 0xff};
const PALE_TEXT: Colour = {red: 0xe5, green: 0xea, blue: 0xf0};
const PLACEHOLDER_MINT: Colour = {red: 168, green: 216, blue: 202};
const TOLERANCE = 6;

// How far from the floor's colour a place must be to count as marked: a drawing dimmed by the fog still differs by far more than this, the floor's own grain by far less.
const MARK_TOLERANCE = 12;

/** What a player sees where a weapon lies: a grid of places over its drawing, counted by colour. */
export async function lookOfPickup(page: Page, centre: Point): Promise<PickupLook> {
  const places = pickupSampling(centre);
  const colours = await coloursAtTiles(page, places);

  const floor = floorColour(colours);

  return {
    bluePixels: colours.filter(colour => colourIsNear(colour, WEAPON_BLUE, TOLERANCE)).length,
    // The marker shares the core’s pale colour and only sits outside this central sample.
    palePixels: colours.filter((colour, index) => {
      const place = places[index];
      return (
        place !== undefined &&
        Math.abs(place.x - centre.x) < 0.25 &&
        Math.abs(place.y - centre.y) < 0.25 &&
        colourIsNear(colour, PALE_TEXT, TOLERANCE)
      );
    }).length,
    discPixels: colours.filter(colour => colourIsNear(colour, PLACEHOLDER_MINT, TOLERANCE)).length,
    markedPixels: colours.filter(colour => !colourIsNear(colour, floor, MARK_TOLERANCE)).length,
  };
}
