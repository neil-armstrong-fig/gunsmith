import type {StrafeSide} from "@gunsmith/engine/opponent/types/StrafeSide";

/** The other side to circle the player on. */
export function oppositeSide(side: StrafeSide): StrafeSide {
  if (side === 1) {
    return -1;
  }

  return 1;
}
