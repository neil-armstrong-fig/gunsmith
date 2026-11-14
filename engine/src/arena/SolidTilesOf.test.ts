import {arenaFrom} from "@gunsmith/engine/arena/ArenaFrom";
import {solidTilesOf} from "@gunsmith/engine/arena/SolidTilesOf";

const arena = arenaFrom(["#####", "#.1.#", "#####"]);

it("blocks a wall tile", () => {
  expect(solidTilesOf(arena)(0, 0)).toBe(true);
});

it("does not block a floor tile", () => {
  expect(solidTilesOf(arena)(1, 1)).toBe(false);
});

it("does not block a raised floor tile, since only walls count here", () => {
  expect(solidTilesOf(arena)(2, 1)).toBe(false);
});

it("blocks everything beyond the arena's edge", () => {
  expect(solidTilesOf(arena)(-1, 1)).toBe(true);
  expect(solidTilesOf(arena)(5, 1)).toBe(true);
});
