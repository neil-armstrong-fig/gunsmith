import {arenaFrom} from "@gunsmith/engine/arena/ArenaFrom";
import {isSolid} from "@gunsmith/engine/arena/IsSolid";

it("reads the width and height off the rows", () => {
  const arena = arenaFrom(["####", "#..#", "#..#"]);

  expect(arena.width).toBe(4);
  expect(arena.height).toBe(3);
});

it("puts the first row at the top, so y grows to the north", () => {
  const arena = arenaFrom(["#...", "....", "...."]);

  expect(isSolid(arena, 0, 2)).toBe(true);
  expect(isSolid(arena, 0, 0)).toBe(false);
});

it("refuses rows of different lengths", () => {
  expect(() => arenaFrom(["###", "##"])).toThrow("same length");
});

it("refuses a character that is neither a wall nor floor", () => {
  expect(() => arenaFrom(["#?#"])).toThrow("'?'");
});

it("refuses an empty arena", () => {
  expect(() => arenaFrom([])).toThrow("at least one row");
});
