import {arenaFrom} from "@gunsmith/engine/arena/ArenaFrom";
import type {Arena} from "@gunsmith/engine/arena/types/Arena";
import type {Point} from "@gunsmith/engine/geometry/types/Point";
import {routeWaypoint} from "@gunsmith/engine/opponent/steering/RouteWaypoint";

// Low ground in the west, a platform one level up in the east, one stair between them at column 4 of the upper floor row.
const withStair = arenaFrom(["##########", "#...>1111#", "#....1111#", "##########"]);
const noStair = arenaFrom(["##########", "#....1111#", "#....1111#", "##########"]);
const PILLARED = arenaFrom(["#######", "#.....#", "#..#..#", "#.....#", "#######"]);

it("is the goal itself in an arena with no stair, even with a wall in the way: it has other ways of getting round", () => {
  expect(routeWaypoint(PILLARED, {x: 1.5, y: 2.5}, {x: 5.5, y: 2.5})).toEqual({x: 5.5, y: 2.5});
});

it("is the goal itself on the same level with a clear walk, even in an arena with a stair", () => {
  expect(routeWaypoint(withStair, {x: 1.5, y: 1.5}, {x: 3.5, y: 1.5})).toEqual({x: 3.5, y: 1.5});
  expect(routeWaypoint(withStair, {x: 5.5, y: 1.5}, {x: 8.5, y: 2.5})).toEqual({x: 8.5, y: 2.5});
});

it("is the next tile along the way to a platform, not the platform, from the low ground", () => {
  expect(routeWaypoint(withStair, {x: 1.5, y: 1.5}, {x: 7.5, y: 1.5})).toEqual({x: 2.5, y: 1.5});
});

it("reaches a platform goal by way of the stair, and ends on the goal", () => {
  const hops = hopsFrom(withStair, {x: 1.5, y: 1.5}, {x: 7.5, y: 1.5});

  expect(hops).toContainEqual({x: 4.5, y: 2.5});
  expect(hops.at(-1)).toEqual({x: 7.5, y: 1.5});
  expect(hops.length).toBeLessThanOrEqual(9);
});

it("goes down a stair to the low ground too", () => {
  const hops = hopsFrom(withStair, {x: 7.5, y: 1.5}, {x: 1.5, y: 1.5});

  expect(hops).toContainEqual({x: 4.5, y: 2.5});
  expect(hops.at(-1)).toEqual({x: 1.5, y: 1.5});
});

it("climbs from the middle of the stair as well, though the walker is neither up nor down", () => {
  const hops = hopsFrom(withStair, {x: 4.5, y: 2.5}, {x: 8.5, y: 2.5});

  expect(hops[0]).toEqual({x: 5.5, y: 2.5});
  expect(hops.at(-1)).toEqual({x: 8.5, y: 2.5});
});

it("goes round a raised strip that lies across a straight walk between two spots on the same low ground, by its stairs", () => {
  const strip = arenaFrom(["############", "#...>11<...#", "#....11....#", "############"]);

  expect(routeWaypoint(strip, {x: 4.5, y: 1.5}, {x: 9.5, y: 1.5})).toEqual({x: 4.5, y: 2.5});
});

it("is the goal itself, not the middle of its tile, once the goal is on the very next tile", () => {
  expect(routeWaypoint(withStair, {x: 4.5, y: 2.5}, {x: 5.3, y: 2.2})).toEqual({x: 5.3, y: 2.2});
});

it("is the goal itself, as before, when there is no way there at all", () => {
  expect(routeWaypoint(noStair, {x: 1.5, y: 1.5}, {x: 7.5, y: 1.5})).toEqual({x: 7.5, y: 1.5});
});

it("is the goal itself on the goal's own tile", () => {
  expect(routeWaypoint(withStair, {x: 1.2, y: 1.2}, {x: 1.8, y: 1.9})).toEqual({x: 1.8, y: 1.9});
});

it("gives the same answer each time it is asked", () => {
  const ask = (): Point => routeWaypoint(withStair, {x: 2.2, y: 1.7}, {x: 7.5, y: 2.5});

  expect(ask()).toEqual(ask());
});

// Walks the route a tile at a time, the way the opponent does a step at a time, and returns the places it aimed for.
function hopsFrom(arena: Arena, start: Point, goal: Point): Point[] {
  const hops: Point[] = [];
  let at = start;
  for (let hop = 0; hop < 30; hop++) {
    const next = routeWaypoint(arena, at, goal);
    hops.push(next);
    if (next.x === goal.x && next.y === goal.y) {
      break;
    }
    at = next;
  }

  return hops;
}
