import type {RandomDraw} from "@gunsmith/engine/random/types/RandomDraw";

const SEED_STEP = 0x6d2b79f5;

/**
 * The next number from a seeded generator (mulberry32). The generator's whole state is the seed, which comes back with
 * each draw, so it sits in the `World` as plain data: the same seed always gives the same draw, and a match is the same
 * from the same seed and inputs. There is no `Math.random` in the engine; the caller that starts a match picks the seed.
 */
export function nextRandom(seed: number): RandomDraw {
  const nextSeed = (seed + SEED_STEP) | 0;
  let mixed = Math.imul(nextSeed ^ (nextSeed >>> 15), 1 | nextSeed);
  mixed = (mixed + Math.imul(mixed ^ (mixed >>> 7), 61 | mixed)) ^ mixed;

  return {value: ((mixed ^ (mixed >>> 14)) >>> 0) / 4294967296, seed: nextSeed};
}
