import type {Page} from "@playwright/test";
import {colourIsNear} from "@src/dsl/gunsmith/playwright/look/ColourIsNear";
import {pickupSampling} from "@src/dsl/gunsmith/playwright/look/look-of-pickup/places-of-pickup/PickupSampling";
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
  const colours = await coloursAtTiles(page, pickupSampling(centre));

  const floor = floorColour(colours);

  return {
    bluePixels: colours.filter(colour => colourIsNear(colour, WEAPON_BLUE, TOLERANCE)).length,
    palePixels: colours.filter(colour => colourIsNear(colour, PALE_TEXT, TOLERANCE)).length,
    discPixels: colours.filter(colour => colourIsNear(colour, PLACEHOLDER_MINT, TOLERANCE)).length,
    markedPixels: colours.filter(colour => !colourIsNear(colour, floor, MARK_TOLERANCE)).length,
  };
}

/** The colour most of the places show, which is the floor's (or the fog's over it) because a drawing covers only a small part of the square. */
function floorColour(colours: Colour[]): Colour {
  const counts = new Map<string, number>();
  colours.forEach(colour => {
    const key = `${colour.red},${colour.green},${colour.blue}`;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  });

  const [commonest = "0,0,0"] = [...counts.entries()].sort((first, second) => second[1] - first[1]).map(([key]) => key);
  const [red = 0, green = 0, blue = 0] = commonest.split(",").map(Number);

  return {red, green, blue};
}
