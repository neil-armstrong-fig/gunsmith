import {arenaFrom} from "@gunsmith/engine/arena/ArenaFrom";
import type {Point} from "@gunsmith/engine/geometry/types/Point";
import {walkableNeighbours} from "@gunsmith/engine/route/walking/WalkableNeighbours";

const room = arenaFrom(["#####", "#...#", "#...#", "#...#", "#####"]);
// Low ground in the west, a stair climbing east in the top row, a platform in the east, and a wall under the stair.
const terraced = arenaFrom(["#######", "#..>11#", "#..#11#", "#######"]);

it("gives the middle of the tile east, west, north and south, in that order, for a walker with open floor all round", () => {
  expect(keysOf(walkableNeighbours(room, {x: 2.5, y: 2.5}))).toEqual(["3.5,2.5", "1.5,2.5", "2.5,3.5", "2.5,1.5"]);
});

it("leaves out a wall, and the edge of the arena", () => {
  expect(keysOf(walkableNeighbours(room, {x: 1.5, y: 1.5}))).toEqual(["2.5,1.5", "1.5,2.5"]);
});

it("leaves out a wall, and lets a walker on the low ground onto the stair at its edge", () => {
  expect(keysOf(walkableNeighbours(terraced, {x: 2.5, y: 2.5}))).toEqual(["3.5,2.5", "1.5,2.5", "2.5,1.5"]);
});

it("lets a walker on a stair step onto the floor at either end", () => {
  expect(keysOf(walkableNeighbours(terraced, {x: 3.5, y: 2.5}))).toEqual(["4.5,2.5", "2.5,2.5"]);
});

it("keeps a walker on the platform from stepping down off it anywhere but the stair", () => {
  expect(keysOf(walkableNeighbours(terraced, {x: 4.5, y: 1.5}))).toEqual(["5.5,1.5", "4.5,2.5"]);
});

function keysOf(tiles: readonly Point[]): string[] {
  return tiles.map(tile => `${tile.x},${tile.y}`);
}
