import {arenaFrom} from "@gunsmith/engine/arena/ArenaFrom";
import {chooseStartingPlaces} from "@gunsmith/engine/arena-symmetry/ChooseStartingPlaces";
import {fairStart} from "@gunsmith/engine/arena-symmetry/FairStart";
import {drawStartingPlaces} from "@gunsmith/engine/arena-symmetry/DrawStartingPlaces";
import {matchedDistancePairs} from "@gunsmith/engine/arena-symmetry/spawn-pairs/matched-distances/MatchedDistancePairs";
import {SPAWN_SPACING_STEPS} from "@gunsmith/engine/arena-symmetry/SpawnSpacing";
import {startAtPlaces} from "@gunsmith/engine/arena-symmetry/StartAtPlaces";
import {startingWorld} from "@gunsmith/engine/game-loop/StartingWorld";

const WALL_ROW = "#".repeat(21);
const FLOOR_ROW = `#${".".repeat(19)}#`;
const OPEN_ROOM = arenaFrom([WALL_ROW, ...Array.from({length: 11}, () => FLOOR_ROW), WALL_ROW]);
const LOPSIDED = arenaFrom([
  WALL_ROW,
  ...Array.from({length: 10}, () => FLOOR_ROW),
  `#${".".repeat(9)}#${".".repeat(9)}#`,
  WALL_ROW,
]);
const SEEDS = Array.from({length: 40}, (_, seed) => seed);

it("starts a half-turn symmetric arena on the pair chosen for it, facing the middle", () => {
  for (const seed of SEEDS) {
    const places = chooseStartingPlaces(OPEN_ROOM, seed);
    if (!places) {
      throw new Error("The open room has places.");
    }

    expect(fairStart(OPEN_ROOM, seed)).toEqual(startAtPlaces(startingWorld(OPEN_ROOM, [], places.opponent), places));
  }
});

it("starts an arena that is not the same picture turned half way round on one of its matched pairs, facing the middle", () => {
  const pairs = matchedDistancePairs(LOPSIDED, SPAWN_SPACING_STEPS);

  for (const seed of SEEDS) {
    const places = drawStartingPlaces(pairs, seed);
    if (!places) {
      throw new Error("The lopsided room has matched pairs.");
    }

    expect(chooseStartingPlaces(LOPSIDED, seed)).toBeUndefined();
    expect(fairStart(LOPSIDED, seed)).toEqual(startAtPlaces(startingWorld(LOPSIDED, [], places.opponent), places));
  }
});

it("does not always start the lopsided arena the same way", () => {
  const players = new Set(SEEDS.map(seed => JSON.stringify(fairStart(LOPSIDED, seed)?.player.position)));

  expect(players.size).toBeGreaterThan(3);
});

it("gives the same world for the same seed", () => {
  expect(fairStart(LOPSIDED, 11)).toEqual(fairStart(LOPSIDED, 11));
});

it("starts the fighters as far apart as a small arena allows when none can be the minimum apart", () => {
  const corridor = arenaFrom(["######", "#...##", "######"]);

  const world = fairStart(corridor, 5);
  const ends = [world?.player.position.x, world?.opponent?.position.x].sort();

  expect(ends).toEqual([1.5, 3.5]);
  expect(world?.player.position.y).toBe(1.5);
});

it("has no world for an arena with only one place to stand", () => {
  expect(fairStart(arenaFrom(["###", "#.#", "###"]), 5)).toBeUndefined();
});
