import type {HeardSound} from "@gunsmith/engine/sound/types/HeardSound";

/**
 * How far away, in tiles in a straight line, each sound can still be heard. Tunables for play, all guesses: a shot carries further
 * than a rifle's reach, a footfall and the taking of a weapon much less.
 */
export const HEARING_RANGES: Record<HeardSound, number> = {
  shot: 20,
  step: 8,
  pickup: 12,
};
