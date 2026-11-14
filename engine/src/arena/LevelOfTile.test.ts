import {arenaFrom} from "@gunsmith/engine/arena/ArenaFrom";
import {levelOfTile} from "@gunsmith/engine/arena/LevelOfTile";

const arena = arenaFrom(["#####", "#.>1#", "#####"]);

it("says which level a tile is on", () => {
  expect(levelOfTile(arena, 1, 1)).toBe(0);
  expect(levelOfTile(arena, 3, 1)).toBe(1);
});

it("gives a stair the level of its low end", () => {
  expect(levelOfTile(arena, 2, 1)).toBe(0);
});

it("does not read the next row's tile for a tile just beyond the east or west edge", () => {
  const raisedAtTheEnds = arenaFrom(["1..", "..1"]);

  expect(levelOfTile(raisedAtTheEnds, -1, 1)).toBe(0);
  expect(levelOfTile(raisedAtTheEnds, 3, 0)).toBe(0);
});

it("counts everything beyond the arena's edge as the low ground", () => {
  expect(levelOfTile(arena, -1, 1)).toBe(0);
  expect(levelOfTile(arena, 1, 9)).toBe(0);
  expect(levelOfTile(arena, 9, 1)).toBe(0);
  expect(levelOfTile(arena, 1, -1)).toBe(0);
});
