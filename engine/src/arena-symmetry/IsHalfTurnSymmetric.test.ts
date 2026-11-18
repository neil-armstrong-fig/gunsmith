import {arenaFrom} from "@gunsmith/engine/arena/ArenaFrom";
import {isHalfTurnSymmetric} from "@gunsmith/engine/arena-symmetry/IsHalfTurnSymmetric";

it("is true for a room with nothing in it", () => {
  expect(isHalfTurnSymmetric(arenaFrom(["#####", "#...#", "#...#", "#####"]))).toBe(true);
});

it("is false when a wall has no wall at its half-turn place", () => {
  expect(isHalfTurnSymmetric(arenaFrom(["#####", "#.#.#", "#...#", "#####"]))).toBe(false);
});

it("is true when walls stand at opposite places", () => {
  expect(isHalfTurnSymmetric(arenaFrom(["######", "#.#..#", "#..#.#", "######"]))).toBe(true);
});

it("is false for a pair of walls that mirror one another but do not turn onto one another", () => {
  expect(isHalfTurnSymmetric(arenaFrom(["######", "#.#..#", "#.#..#", "######"]))).toBe(false);
});

it("is true for a platform in the middle with a stair at each end that climbs towards it", () => {
  expect(isHalfTurnSymmetric(arenaFrom(["#######", "#.>1<.#", "#######"]))).toBe(true);
});

it("is false when a stair has no stair at its half-turn place", () => {
  expect(isHalfTurnSymmetric(arenaFrom(["#######", "#.>1..#", "#######"]))).toBe(false);
});

it("is false when the platform is higher at one end than at its half-turn place", () => {
  expect(isHalfTurnSymmetric(arenaFrom(["######", "#1..2#", "######"]))).toBe(false);
});

it("is false for a stair on the centre tile, which a half turn makes climb the other way", () => {
  expect(isHalfTurnSymmetric(arenaFrom(["###", "#1#", "#^#", "#.#", "###"]))).toBe(false);
});

it("is true when cover blocks stand at opposite places", () => {
  expect(isHalfTurnSymmetric(arenaFrom(["######", "#c...#", "#...c#", "######"]))).toBe(true);
});

it("is false when a cover block has a wall, not a block, at its half-turn place", () => {
  expect(isHalfTurnSymmetric(arenaFrom(["######", "#c...#", "#...##", "######"]))).toBe(false);
});

it("is false when a cover block has plain floor at its half-turn place", () => {
  expect(isHalfTurnSymmetric(arenaFrom(["######", "#c...#", "#....#", "######"]))).toBe(false);
});
