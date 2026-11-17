import {arenaFrom} from "@gunsmith/engine/arena/ArenaFrom";
import type {Point} from "@gunsmith/engine/geometry/types/Point";
import {tilePathBetween} from "@gunsmith/engine/route/TilePathBetween";

// A low ground to the west, a platform one level up to the east, and one stair between them at column 4, the top row of the floor.
const withStair = arenaFrom(["##########", "#...>1111#", "#....1111#", "##########"]);
const noStair = arenaFrom(["##########", "#....1111#", "#....1111#", "##########"]);

it("is the tile the walker stands on, when the goal is on the same tile", () => {
  expect(keysOf(tilePathBetween(withStair, {x: 1.2, y: 1.3}, {x: 1.8, y: 1.9}))).toEqual(["1.5,1.5"]);
});

it("runs from one tile to the next in straight steps, from the middle of the first tile to the middle of the last", () => {
  expect(keysOf(tilePathBetween(withStair, {x: 1.5, y: 1.5}, {x: 3.5, y: 1.5}))).toEqual([
    "1.5,1.5",
    "2.5,1.5",
    "3.5,1.5",
  ]);
});

it("goes round a wall rather than through it, by the shortest way", () => {
  const pillar = arenaFrom(["#####", "#...#", "#.#.#", "#...#", "#####"]);

  expect(keysOf(tilePathBetween(pillar, {x: 1.5, y: 2.5}, {x: 3.5, y: 2.5}))).toHaveLength(5);
});

it("climbs a platform by its stair, since a drop is a wall", () => {
  const path = keysOf(tilePathBetween(withStair, {x: 1.5, y: 1.5}, {x: 7.5, y: 1.5}));

  expect(path).toContain("4.5,2.5");
  expect(path?.at(0)).toBe("1.5,1.5");
  expect(path?.at(-1)).toBe("7.5,1.5");
  expect(path).toHaveLength(9);
});

it("comes back down by the stair", () => {
  const path = keysOf(tilePathBetween(withStair, {x: 7.5, y: 1.5}, {x: 1.5, y: 1.5}));

  expect(path).toContain("4.5,2.5");
  expect(path?.at(-1)).toBe("1.5,1.5");
});

it("has no path to a platform with no stair", () => {
  expect(tilePathBetween(noStair, {x: 1.5, y: 1.5}, {x: 7.5, y: 1.5})).toBeUndefined();
});

it("has no path to a wall, or to the outside", () => {
  expect(tilePathBetween(withStair, {x: 1.5, y: 1.5}, {x: 0.5, y: 0.5})).toBeUndefined();
  expect(tilePathBetween(withStair, {x: 1.5, y: 1.5}, {x: 40.5, y: 1.5})).toBeUndefined();
});

it("gives the same path each time it is asked", () => {
  const first = tilePathBetween(withStair, {x: 1.5, y: 1.5}, {x: 7.5, y: 2.5});

  expect(tilePathBetween(withStair, {x: 1.5, y: 1.5}, {x: 7.5, y: 2.5})).toEqual(first);
});

function keysOf(path: readonly Point[] | undefined): string[] | undefined {
  return path?.map(tile => `${tile.x},${tile.y}`);
}
