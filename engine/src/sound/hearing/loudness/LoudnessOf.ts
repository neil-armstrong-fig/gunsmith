import type {Loudness} from "@gunsmith/engine/sound/types/Loudness";

/** How loud a sound `distance` tiles away is for one that carries `range` tiles: near in the first third of the range, mid in the second, far beyond (compared as thirds written in whole numbers, so a distance of exactly a third is not pushed over by rounding). */
export function loudnessOf(distance: number, range: number): Loudness {
  if (distance * 3 <= range) {
    return "near";
  }

  if (distance * 3 <= range * 2) {
    return "mid";
  }

  return "far";
}
