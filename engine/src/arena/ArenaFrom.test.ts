import {arenaFrom} from "@gunsmith/engine/arena/ArenaFrom";
import {isCover} from "@gunsmith/engine/arena/IsCover";
import {isSolid} from "@gunsmith/engine/arena/IsSolid";
import {levelOfTile} from "@gunsmith/engine/arena/LevelOfTile";
import {stairOfTile} from "@gunsmith/engine/arena/StairOfTile";

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

it("reads every plain floor as the low ground, level 0", () => {
  const arena = arenaFrom(["###", "#.#", "###"]);

  expect(levelOfTile(arena, 1, 1)).toBe(0);
});

it("reads a digit as raised floor at that level, up to level 2", () => {
  const arena = arenaFrom(["#####", "#.12#", "#####"]);

  expect(levelOfTile(arena, 1, 1)).toBe(0);
  expect(levelOfTile(arena, 2, 1)).toBe(1);
  expect(levelOfTile(arena, 3, 1)).toBe(2);
});

it("walks on raised floor: a digit is not a wall", () => {
  const arena = arenaFrom(["####", "#.1#", "####"]);

  expect(isSolid(arena, 2, 1)).toBe(false);
});

it("refuses a level beyond the third", () => {
  expect(() => arenaFrom(["#3#"])).toThrow("'3'");
});

it("reads an arrow as a stair that climbs the way it points, at the level of its low end", () => {
  const east = arenaFrom(["#####", "#.>1#", "#####"]);
  const west = arenaFrom(["#####", "#1<.#", "#####"]);
  const north = arenaFrom(["###", "#1#", "#^#", "#.#", "###"]);
  const south = arenaFrom(["###", "#.#", "#v#", "#1#", "###"]);

  expect(stairOfTile(east, 2, 1)).toBe("east");
  expect(stairOfTile(west, 2, 1)).toBe("west");
  expect(stairOfTile(north, 1, 2)).toBe("north");
  expect(stairOfTile(south, 1, 2)).toBe("south");
  expect(levelOfTile(east, 2, 1)).toBe(0);
  expect(levelOfTile(west, 2, 1)).toBe(0);
});

it("gives a stair between the first and second level the first level, so each end is a landing", () => {
  const arena = arenaFrom(["######", "#1>2.#", "######"]);

  expect(levelOfTile(arena, 2, 1)).toBe(1);
});

it("is not a stair where the arena has none", () => {
  const arena = arenaFrom(["###", "#.#", "###"]);

  expect(stairOfTile(arena, 1, 1)).toBeUndefined();
});

it("refuses a stair with a wall behind it", () => {
  expect(() => arenaFrom(["####", "##>1", "####"])).toThrow("plain floor");
});

it("refuses a stair with a wall ahead of it", () => {
  expect(() => arenaFrom(["####", "#.>#", "####"])).toThrow("plain floor");
});

it("refuses a stair whose far end is on the same level as its near end", () => {
  expect(() => arenaFrom(["#####", "#.>.#", "#####"])).toThrow("one level higher");
});

it("refuses a stair that climbs two levels at once", () => {
  expect(() => arenaFrom(["#####", "#.>2#", "#####"])).toThrow("one level higher");
});

it("refuses a stair that climbs the wrong way, the high end behind it", () => {
  expect(() => arenaFrom(["#####", "#1>.#", "#####"])).toThrow("one level higher");
});

it("refuses a stair whose landing is another stair", () => {
  expect(() => arenaFrom(["######", "#.>>1#", "######"])).toThrow("plain floor");
});

it("refuses a stair at the edge of the drawing, with no landing beyond it", () => {
  expect(() => arenaFrom([".>"])).toThrow("plain floor");
});

it("refuses raised floor beside a stair's middle, which would let a walker skip its landing", () => {
  expect(() => arenaFrom(["#####", "#.1.#", "#.>1#", "#...#", "#####"])).toThrow("beside");
});

it("accepts a stair between walls, and a stair beside low ground", () => {
  expect(() => arenaFrom(["#####", "#.>1#", "#####"])).not.toThrow();
  expect(() => arenaFrom(["#####", "#...#", "#.>1#", "#...#", "#####"])).not.toThrow();
});

it("reads a c as a cover block: solid, on the low ground and not a stair", () => {
  const arena = arenaFrom(["###", "#c#", "###"]);

  expect(isSolid(arena, 1, 1)).toBe(true);
  expect(isCover(arena, 1, 1)).toBe(true);
  expect(levelOfTile(arena, 1, 1)).toBe(0);
  expect(stairOfTile(arena, 1, 1)).toBeUndefined();
});

it("does not read a wall or floor as cover", () => {
  const arena = arenaFrom(["###", "#.#", "###"]);

  expect(isCover(arena, 0, 0)).toBe(false);
  expect(isCover(arena, 1, 1)).toBe(false);
});

it("lets a cover block stand beside a stair's middle, where raised floor may not", () => {
  expect(() => arenaFrom(["#####", "#.c.#", "#.>1#", "#####"])).not.toThrow();
});
