import {arenaFrom} from "@gunsmith/engine/arena/ArenaFrom";
import type {Point} from "@gunsmith/engine/geometry/types/Point";
import {routeDistancesFrom} from "@gunsmith/engine/pickup/placement/RouteDistancesFrom";

const room = arenaFrom(["#######", "#.....#", "#.##..#", "#.....#", "#######"]);
const withStair = arenaFrom(["#########", "#...>111#", "#...#111#", "#########"]);
const noStair = arenaFrom(["#########", "#...1111#", "#...1111#", "#########"]);

it("is nothing steps from the tile the walker stands on", () => {
  expect(distanceTo(routeDistancesFrom(room, {x: 1.5, y: 1.5}), 7, {x: 1, y: 1})).toBe(0);
});

it("counts one step to each tile beside it, not across a diagonal", () => {
  const distances = routeDistancesFrom(room, {x: 1.5, y: 1.5});

  expect(distanceTo(distances, 7, {x: 2, y: 1})).toBe(1);
  expect(distanceTo(distances, 7, {x: 1, y: 2})).toBe(1);
  expect(distanceTo(distances, 7, {x: 2, y: 2})).toBeUndefined();
  expect(distanceTo(distances, 7, {x: 3, y: 3})).toBe(4);
});

it("goes round a wall, so the way there is longer than the straight line", () => {
  const distances = routeDistancesFrom(room, {x: 1.5, y: 2.5});

  expect(distanceTo(distances, 7, {x: 4, y: 2})).toBe(5);
});

it("has no distance to a wall", () => {
  expect(distanceTo(routeDistancesFrom(room, {x: 1.5, y: 1.5}), 7, {x: 0, y: 0})).toBeUndefined();
});

it("reaches a platform by its stair and has no distance to one with no stair", () => {
  expect(distanceTo(routeDistancesFrom(withStair, {x: 1.5, y: 1.5}), 9, {x: 6, y: 1})).toBeDefined();
  expect(distanceTo(routeDistancesFrom(noStair, {x: 1.5, y: 1.5}), 9, {x: 6, y: 1})).toBeUndefined();
});

it("is the same standing anywhere on the same tile", () => {
  expect(routeDistancesFrom(room, {x: 1.1, y: 1.9})).toEqual(routeDistancesFrom(room, {x: 1.9, y: 1.1}));
});

function distanceTo(distances: ReadonlyMap<number, number>, arenaWidth: number, tile: Point): number | undefined {
  return distances.get(tile.y * arenaWidth + tile.x);
}
