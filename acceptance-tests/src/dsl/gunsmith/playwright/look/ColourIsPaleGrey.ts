import type {Colour} from "@src/dsl/gunsmith/types/Colour";

/** How bright every part of a colour must be, and how far apart its parts may be, to count as a pale grey: light, with no tint to speak of. */
const BRIGHT_FROM = 190;
const TINT_AT_MOST = 24;

/** Whether a colour on the screen is a pale grey, whatever exact shade tone mapping or edges made of it. Nothing in art's player drawing is: its lightest part is a blue-grey outline. */
export function colourIsPaleGrey(colour: Colour): boolean {
  const parts = [colour.red, colour.green, colour.blue];

  return Math.min(...parts) >= BRIGHT_FROM && Math.max(...parts) - Math.min(...parts) <= TINT_AT_MOST;
}
