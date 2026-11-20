import {drawStartingPlaces} from "@gunsmith/engine/arena-symmetry/DrawStartingPlaces";
import {SPAWN_SEED_SALT} from "@gunsmith/engine/arena-symmetry/spawn-pairs/SpawnSeedSalt";
import type {PlacePair} from "@gunsmith/engine/arena-symmetry/spawn-pairs/types/PlacePair";
import {nextRandom} from "@gunsmith/engine/random/NextRandom";

const PAIRS: readonly PlacePair[] = Array.from({length: 5}, (_, index) => {
  return {first: {x: index + 0.5, y: 1.5}, second: {x: index + 0.5, y: 8.5}};
});
const SEEDS = Array.from({length: 60}, (_, seed) => seed);

it("has no places when there is no pair", () => {
  expect(drawStartingPlaces([], 3)).toBeUndefined();
});

it("draws the pair from the stream salted for it, then who takes which end from the next draw on that stream", () => {
  for (const seed of SEEDS) {
    const pairDraw = nextRandom(seed ^ SPAWN_SEED_SALT);
    const pair = PAIRS[Math.floor(pairDraw.value * PAIRS.length)];
    const playerTakesFirst = nextRandom(pairDraw.seed).value < 0.5;

    expect(drawStartingPlaces(PAIRS, seed)).toEqual({
      player: playerTakesFirst ? pair?.first : pair?.second,
      opponent: playerTakesFirst ? pair?.second : pair?.first,
    });
  }
});

it("gives the same places for the same seed", () => {
  expect(drawStartingPlaces(PAIRS, 17)).toEqual(drawStartingPlaces(PAIRS, 17));
});

it("always seats the two fighters at the two ends of one pair", () => {
  for (const seed of SEEDS) {
    const places = drawStartingPlaces(PAIRS, seed);

    expect(
      PAIRS.some(pair => [pair.first, pair.second].every(end => [places?.player, places?.opponent].includes(end))),
    ).toBe(true);
  }
});
