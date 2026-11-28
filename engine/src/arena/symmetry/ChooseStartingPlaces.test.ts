import {arenaFrom} from "@gunsmith/engine/arena/ArenaFrom";
import {chooseStartingPlaces} from "@gunsmith/engine/arena/symmetry/ChooseStartingPlaces";
import {spawnPairsOf} from "@gunsmith/engine/arena/symmetry/spawn-pairs/SpawnPairsOf";
import {SPAWN_SEED_SALT} from "@gunsmith/engine/arena/symmetry/spawn-pairs/seed/SpawnSeedSalt";
import {SPAWN_SPACING_STEPS} from "@gunsmith/engine/arena/symmetry/spawn-pairs/SpawnSpacing";
import type {Point} from "@gunsmith/engine/geometry/types/Point";
import {nextRandom} from "@gunsmith/engine/random/NextRandom";
import {PICKUP_SEED_SALT} from "@gunsmith/engine/pickup/placement/PickupSeedSalt";
import {RING_SEED_SALT} from "@gunsmith/engine/ring/centre/seed/RingSeedSalt";

const WALL_ROW = "#".repeat(21);
const FLOOR_ROW = `#${".".repeat(19)}#`;
const OPEN_ROOM = arenaFrom([WALL_ROW, ...Array.from({length: 11}, () => FLOOR_ROW), WALL_ROW]);
const SEEDS = Array.from({length: 60}, (_, seed) => seed);

it("starts the fighters at the two ends of one of the arena's pairs, whichever seed it is", () => {
  const pairs = spawnPairsOf(OPEN_ROOM, SPAWN_SPACING_STEPS);

  for (const seed of SEEDS) {
    const places = chooseStartingPlaces(OPEN_ROOM, seed);

    expect(places).toBeDefined();
    expect(
      pairs.some(
        pair =>
          (isSame(pair.first, places?.player) && isSame(pair.second, places?.opponent)) ||
          (isSame(pair.second, places?.player) && isSame(pair.first, places?.opponent)),
      ),
    ).toBe(true);
  }
});

it("gives the same places for the same seed", () => {
  expect(chooseStartingPlaces(OPEN_ROOM, 17)).toEqual(chooseStartingPlaces(OPEN_ROOM, 17));
});

it("does not always choose the same pair", () => {
  const players = new Set(SEEDS.map(seed => JSON.stringify(chooseStartingPlaces(OPEN_ROOM, seed)?.player)));

  expect(players.size).toBeGreaterThan(10);
});

it("gives neither fighter a side by always seating the player at the lower end of the pair", () => {
  const seatedLower = SEEDS.filter(seed => {
    const places = chooseStartingPlaces(OPEN_ROOM, seed);
    const lowerFirst = (places?.player.y ?? 0) * 100 + (places?.player.x ?? 0);
    const lowerSecond = (places?.opponent.y ?? 0) * 100 + (places?.opponent.x ?? 0);

    return lowerFirst < lowerSecond;
  });

  expect(seatedLower.length).toBeGreaterThan(10);
  expect(seatedLower.length).toBeLessThan(SEEDS.length - 10);
});

it("has no places for an arena that is not the same picture turned half way round", () => {
  const lopsided = arenaFrom([
    WALL_ROW,
    ...Array.from({length: 10}, () => FLOOR_ROW),
    `#${".".repeat(9)}#${".".repeat(9)}#`,
    WALL_ROW,
  ]);

  expect(chooseStartingPlaces(lopsided, 3)).toBeUndefined();
});

it("has no places for an arena with no pair far enough apart", () => {
  expect(chooseStartingPlaces(arenaFrom(["#####", "#...#", "#####"]), 3)).toBeUndefined();
});

it("draws the pair from the stream salted for it, then who takes which end from the next draw on that stream", () => {
  const pairs = spawnPairsOf(OPEN_ROOM, SPAWN_SPACING_STEPS);

  for (const seed of SEEDS) {
    const pairDraw = nextRandom(seed ^ SPAWN_SEED_SALT);
    const pair = pairs[Math.floor(pairDraw.value * pairs.length)];
    const playerTakesFirst = nextRandom(pairDraw.seed).value < 0.5;

    expect(chooseStartingPlaces(OPEN_ROOM, seed)).toEqual({
      player: playerTakesFirst ? pair?.first : pair?.second,
      opponent: playerTakesFirst ? pair?.second : pair?.first,
    });
  }
});

it("draws on a stream of its own, so the pickup and the ring are not drawn from the same numbers", () => {
  expect(SPAWN_SEED_SALT).not.toBe(PICKUP_SEED_SALT);
  expect(SPAWN_SEED_SALT).not.toBe(RING_SEED_SALT);
});

function isSame(a: Point | undefined, b: Point | undefined): boolean {
  return a !== undefined && b !== undefined && a.x === b.x && a.y === b.y;
}
