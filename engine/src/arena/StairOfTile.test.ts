import {arenaFrom} from "@gunsmith/engine/arena/ArenaFrom";
import {stairOfTile} from "@gunsmith/engine/arena/StairOfTile";

const arena = arenaFrom(["#####", "#.>1#", "#####"]);

it("says which way a stair climbs", () => {
  expect(stairOfTile(arena, 2, 1)).toBe("east");
});

it("finds no stair on floor or wall", () => {
  expect(stairOfTile(arena, 1, 1)).toBeUndefined();
  expect(stairOfTile(arena, 0, 0)).toBeUndefined();
});

it("does not read the next row's tile for a tile just beyond the east or west edge", () => {
  const stairsAtTheEdges = arenaFrom(["1##", "^#1", ".#^", "##."]);

  expect(stairOfTile(stairsAtTheEdges, 0, 2)).toBe("north");
  expect(stairOfTile(stairsAtTheEdges, 2, 1)).toBe("north");
  expect(stairOfTile(stairsAtTheEdges, -1, 2)).toBeUndefined();
  expect(stairOfTile(stairsAtTheEdges, 3, 1)).toBeUndefined();
});

it("finds no stair beyond the arena's edge", () => {
  expect(stairOfTile(arena, -1, 1)).toBeUndefined();
  expect(stairOfTile(arena, 5, 1)).toBeUndefined();
  expect(stairOfTile(arena, 1, 3)).toBeUndefined();
  expect(stairOfTile(arena, 1, -1)).toBeUndefined();
});
