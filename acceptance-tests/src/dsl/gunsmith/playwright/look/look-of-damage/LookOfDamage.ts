import type {Page} from "@playwright/test";
import {colourIsNear} from "@src/dsl/gunsmith/playwright/look/ColourIsNear";
import {bracketPlaces} from "@src/dsl/gunsmith/playwright/look/look-of-damage/places-of-damage/BracketPlaces";
import {NEAREST_REACH} from "@src/dsl/gunsmith/playwright/look/look-of-damage/NearestReach";
import {reachPlaces} from "@src/dsl/gunsmith/playwright/look/look-of-damage/places-of-damage/ReachPlaces";
import {highlightPlaces} from "@src/dsl/gunsmith/playwright/look/look-of-damage/places-of-damage/HighlightPlaces";
import {coloursAtTiles} from "@src/dsl/gunsmith/playwright/screen/ColoursAtTiles";
import type {Colour} from "@src/dsl/gunsmith/types/Colour";
import type {DamageLook} from "@src/dsl/gunsmith/types/DamageLook";
import type {Point} from "@src/dsl/gunsmith/types/Point";

/** The coral of art's incoming damage and ring danger, `#FF5B62`; a 2 to 3 pixel line blurs at its edge, so a place counts when it is near. */
const CORAL: Colour = {red: 255, green: 91, blue: 98};
const TOLERANCE = 40;

/** What the screen shows of damage round the body centred on `centre`, read from a screenshot (the canvas is not in the DOM). */
export async function lookOfDamage(page: Page, centre: Point): Promise<DamageLook> {
  const left = bracketPlaces(centre, "left");
  const right = bracketPlaces(centre, "right");
  const highlight = highlightPlaces(centre);
  const reach = reachPlaces(centre);
  const colours = await coloursAtTiles(page, [...left, ...right, ...highlight, ...reach]);
  const coral = colours.map(colour => colourIsNear(colour, CORAL, TOLERANCE));
  const reachCoral = coral.slice(left.length + right.length + highlight.length);

  return {
    leftBracketPoints: coral.slice(0, left.length).filter(Boolean).length,
    rightBracketPoints: coral.slice(left.length, left.length + right.length).filter(Boolean).length,
    highlightPoints: coral
      .slice(left.length + right.length, left.length + right.length + highlight.length)
      .filter(Boolean).length,
    leftBracketReachPixels: farthestCoral(reachCoral),
  };
}

/** The farthest of the study's pixels out from the body, counting from the nearest looked at, at which the bar showed coral; zero when it showed none. */
function farthestCoral(reachCoral: boolean[]): number {
  const farthest = reachCoral.lastIndexOf(true);
  if (farthest < 0) {
    return 0;
  }

  return NEAREST_REACH + farthest;
}
