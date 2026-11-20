import type {Sector} from "@gunsmith/engine/sound/types/Sector";

/**
 * Where each of the eight sectors a sound can come from sits between the ears, -1 wholly left to 1 wholly right. The view is a fixed one
 * from above with north at the top, so east is right and west is left, and the diagonals half way between. A sound from due north or
 * due south is in the middle: two ears cannot tell the front from the back, and the screen has no front.
 */
const PAN_OF_SECTOR: readonly number[] = [0, Math.SQRT1_2, 1, Math.SQRT1_2, 0, -Math.SQRT1_2, -1, -Math.SQRT1_2];

/** The stereo pan for a sound heard from `sector`; the middle for a number that is not one of the eight. */
export function panOfSector(sector: Sector): number {
  return PAN_OF_SECTOR[sector] ?? 0;
}
