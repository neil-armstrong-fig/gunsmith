import {arenaFrom} from "@gunsmith/engine/arena/ArenaFrom";
import type {Point} from "@gunsmith/engine/geometry/types/Point";
import {tilesReachableFrom} from "@gunsmith/engine/ring/centre/reach/TilesReachableFrom";

function tileKeys(tiles: readonly Point[]): string[] {
  return tiles.map(tile => `${tile.x},${tile.y}`).sort();
}

it("reaches every open tile of a room from where the walker stands, and no wall", () => {
  const room = arenaFrom(["####", "#..#", "#..#", "####"]);

  expect(tileKeys(tilesReachableFrom(room, {x: 1.5, y: 1.5}))).toEqual(["1.5,1.5", "1.5,2.5", "2.5,1.5", "2.5,2.5"]);
});

it("does not reach the far side of a wall", () => {
  const divided = arenaFrom(["#####", "#.#.#", "#####"]);

  expect(tileKeys(tilesReachableFrom(divided, {x: 1.5, y: 1.5}))).toEqual(["1.5,1.5"]);
});

it("reaches a platform by its stair", () => {
  const withStair = arenaFrom(["#######", "#..>11#", "#..#11#", "#######"]);

  expect(tileKeys(tilesReachableFrom(withStair, {x: 1.5, y: 1.5}))).toContain("5.5,1.5");
});

it("does not reach a platform that has no stair, since a drop is a wall, though no wall stands between", () => {
  const noStair = arenaFrom(["#######", "#..111#", "#..111#", "#######"]);
  const reached = tileKeys(tilesReachableFrom(noStair, {x: 1.5, y: 1.5}));

  expect(reached).not.toContain("3.5,1.5");
  expect(reached).not.toContain("5.5,2.5");
  expect(reached).toHaveLength(4);
});

it("reaches the low ground back down from the platform, as the stair works both ways", () => {
  const withStair = arenaFrom(["#######", "#..>11#", "#..#11#", "#######"]);

  expect(tileKeys(tilesReachableFrom(withStair, {x: 5.5, y: 1.5}))).toContain("1.5,1.5");
});
