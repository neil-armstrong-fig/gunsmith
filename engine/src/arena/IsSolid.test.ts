import {arenaFrom} from "@gunsmith/engine/arena/ArenaFrom";
import {isSolid} from "@gunsmith/engine/arena/IsSolid";

const arena = arenaFrom(["###", "#.#", "###"]);

it("is true for a wall tile", () => {
  expect(isSolid(arena, 0, 0)).toBe(true);
});

it("is false for a floor tile", () => {
  expect(isSolid(arena, 1, 1)).toBe(false);
});

it("treats everything outside the arena as solid", () => {
  expect(isSolid(arena, -1, 1)).toBe(true);
  expect(isSolid(arena, 3, 1)).toBe(true);
  expect(isSolid(arena, 1, -1)).toBe(true);
  expect(isSolid(arena, 1, 3)).toBe(true);
});

it("treats the tile past the east edge as solid even when the next row starts with floor", () => {
  const open = arenaFrom(["...", "..."]);

  expect(isSolid(open, 3, 0)).toBe(true);
  expect(isSolid(open, 3, 1)).toBe(true);
});

it("treats the row past the north edge as solid", () => {
  const open = arenaFrom(["...", "..."]);

  expect(isSolid(open, 0, 2)).toBe(true);
});
