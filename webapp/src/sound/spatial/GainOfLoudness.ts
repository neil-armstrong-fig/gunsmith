import type {Loudness} from "@gunsmith/engine/sound/types/Loudness";

/** How loud each of the three loudnesses plays, 1 being the file as it is. Tunables for play: guesses, each about half the one before. */
const GAIN_OF_LOUDNESS: Record<Loudness, number> = {near: 1, mid: 0.5, far: 0.2};

/** The gain for a sound of `loudness`. */
export function gainOfLoudness(loudness: Loudness): number {
  return GAIN_OF_LOUDNESS[loudness];
}
