import {arenaFrom} from "@gunsmith/engine/arena/ArenaFrom";
import {isCover} from "@gunsmith/engine/arena/IsCover";
import {isSolid} from "@gunsmith/engine/arena/IsSolid";

const ARENA = arenaFrom(["#####", "#.c.#", "#.>1#", "#####"]);

it("is true for a tile drawn as a cover block", () => {
  expect(isCover(ARENA, 2, 2)).toBe(true);
});

it("is false for a wall, for floor and for a stair", () => {
  expect(isCover(ARENA, 0, 0)).toBe(false);
  expect(isCover(ARENA, 1, 2)).toBe(false);
  expect(isCover(ARENA, 2, 1)).toBe(false);
});

it("is false beyond the arena's edge, which is a wall and not a block", () => {
  expect(isCover(ARENA, -1, 2)).toBe(false);
  expect(isCover(ARENA, 2, 4)).toBe(false);
  expect(isCover(ARENA, 5, 2)).toBe(false);
});

it("is also solid, so that whatever treats a wall as unwalkable treats a cover block so too", () => {
  expect(isSolid(ARENA, 2, 2)).toBe(true);
});
