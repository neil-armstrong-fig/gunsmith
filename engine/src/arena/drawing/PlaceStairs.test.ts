import {placeStairs} from "@gunsmith/engine/arena/drawing/PlaceStairs";
import type {DrawnArena} from "@gunsmith/engine/arena/types/DrawnArena";

it("gives a stair the level of the floor behind it", () => {
  const arena = row([1, 0, 2]);

  placeStairs(arena);

  expect(arena.levels).toEqual([1, 1, 2]);
});

it("names where a stair is when its far landing is not one level higher", () => {
  expect(() => placeStairs(row([0, 0, 0]))).toThrow("column 2, row 1");
  expect(() => placeStairs(row([0, 0, 2]))).toThrow("one level higher");
});

it("leaves an arena with no stair as it is", () => {
  const arena: DrawnArena = {
    width: 2,
    height: 1,
    solid: [false, false],
    cover: [false, false],
    levels: [0, 1],
    stairs: [undefined, undefined],
  };

  placeStairs(arena);

  expect(arena.levels).toEqual([0, 1]);
});

it("counts the row from the top of the drawing, as it is drawn, in that message", () => {
  const arena: DrawnArena = {
    width: 3,
    height: 2,
    solid: [false, false, false, false, false, false],
    cover: [false, false, false, false, false, false],
    levels: [0, 0, 0, 0, 0, 0],
    stairs: [undefined, "east", undefined, undefined, undefined, undefined],
  };

  expect(() => placeStairs(arena)).toThrow("column 2, row 2");
});

// One row, west to east: floor, a stair climbing east, raised floor.
function row(levels: number[]): DrawnArena {
  return {
    width: 3,
    height: 1,
    solid: [false, false, false],
    cover: [false, false, false],
    levels,
    stairs: [undefined, "east", undefined],
  };
}
