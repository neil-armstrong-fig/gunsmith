import type {Page} from "@playwright/test";
import {colourIsNear} from "@src/dsl/gunsmith/playwright/look/ColourIsNear";
import {tickPlaces} from "@src/dsl/gunsmith/playwright/look/look-of-hit/places-of-hit/TickPlaces";
import {coloursAtTiles} from "@src/dsl/gunsmith/playwright/screen/ColoursAtTiles";
import type {Colour} from "@src/dsl/gunsmith/types/Colour";
import type {HitLook} from "@src/dsl/gunsmith/types/HitLook";
import type {Point} from "@src/dsl/gunsmith/types/Point";

/** The mint of art's outgoing hit confirmation, `#8AD4B0`; a 2 pixel line blurs at its edge, so a place counts when it is near. */
const MINT: Colour = {red: 138, green: 212, blue: 176};
const TOLERANCE = 40;
/** A corner carries a tick when this many of the places along it are mint: a stray pixel of the floor's colour is not one. */
const PLACES_FOR_A_TICK = 3;
const CORNERS: Point[] = [
  {x: -1, y: 1},
  {x: 1, y: 1},
  {x: -1, y: -1},
  {x: 1, y: -1},
];

/** What the screen shows of a hit landed round the body centred on `centre`, read from a screenshot (the canvas is not in the DOM). */
export async function lookOfHit(page: Page, centre: Point): Promise<HitLook> {
  const corners = CORNERS.map(corner => tickPlaces(centre, corner));
  const colours = await coloursAtTiles(page, corners.flat());
  const mint = colours.map(colour => colourIsNear(colour, MINT, TOLERANCE));

  let cornersWithTicks = 0;
  let offset = 0;
  for (const places of corners) {
    const mintAlongIt = mint.slice(offset, offset + places.length).filter(Boolean).length;
    if (mintAlongIt >= PLACES_FOR_A_TICK) {
      cornersWithTicks += 1;
    }

    offset += places.length;
  }

  return {cornersWithTicks};
}
