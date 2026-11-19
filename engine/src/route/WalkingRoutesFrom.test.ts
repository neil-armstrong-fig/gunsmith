import {arenaFrom} from "@gunsmith/engine/arena/ArenaFrom";
import type {Point} from "@gunsmith/engine/geometry/types/Point";
import type {WalkStep} from "@gunsmith/engine/route/types/WalkStep";
import {tileKeyOf} from "@gunsmith/engine/route/TileKeyOf";
import {walkingRoutesFrom} from "@gunsmith/engine/route/WalkingRoutesFrom";

const terraced = arenaFrom(["#######", "#..>11#", "#..#11#", "#######"]);
const hall = arenaFrom(["##########", "#........#", "#........#", "#........#", "#........#", "##########"]);

it("starts at the middle of the tile the walker stands on, which came from nowhere", () => {
  const routes = walkingRoutesFrom(terraced, {x: 1.2, y: 1.8});

  expect(routes.get(tileKeyOf({x: 1.5, y: 1.5}))).toEqual({tile: {x: 1.5, y: 1.5}, cameFrom: undefined});
});

it("holds every tile the walker can reach, once, keyed by tile, and none they cannot", () => {
  const routes = walkingRoutesFrom(terraced, {x: 1.5, y: 1.5});
  const reachable = [
    [1, 1],
    [2, 1],
    [1, 2],
    [2, 2],
    [3, 2],
    [4, 2],
    [5, 2],
    [4, 1],
    [5, 1],
  ];

  expect([...routes.keys()].sort()).toEqual(
    reachable.map(([x, y]) => tileKeyOf({x: (x ?? 0) + 0.5, y: (y ?? 0) + 0.5})).sort(),
  );
});

it("says which tile each came from: a neighbour, itself in the routes", () => {
  const routes = walkingRoutesFrom(terraced, {x: 1.5, y: 1.5});

  for (const step of routes.values()) {
    if (step.cameFrom) {
      expect(Math.abs(step.tile.x - step.cameFrom.x) + Math.abs(step.tile.y - step.cameFrom.y)).toBe(1);
      expect(routes.has(tileKeyOf(step.cameFrom))).toBe(true);
    }
  }
});

it("finds nearer tiles before farther ones, counted in steps along the way back, so that way is the shortest", () => {
  const routes = walkingRoutesFrom(terraced, {x: 1.5, y: 1.5});
  const depths = [...routes.values()].map(step => depthOf(routes, step));

  expect(depths).toEqual([...depths].sort((a, b) => a - b));
  expect(Math.max(...depths)).toBe(6);
});

it("crosses a drop only by the stair", () => {
  const routes = walkingRoutesFrom(terraced, {x: 1.5, y: 1.5});
  const platform = routes.get(tileKeyOf({x: 5.5, y: 2.5}));

  expect(platform?.cameFrom).toEqual({x: 4.5, y: 2.5});
});

it("stops searching once it has found the goal, so no tile beyond it is visited", () => {
  const goal = {x: 3.5, y: 1.5};
  const routes = walkingRoutesFrom(hall, {x: 1.5, y: 1.5}, goal);

  expect(routes.has(tileKeyOf(goal))).toBe(true);
  expect(routes.has(tileKeyOf({x: 8.5, y: 4.5}))).toBe(false);
  expect(routes.size).toBeLessThan(walkingRoutesFrom(hall, {x: 1.5, y: 1.5}).size);
});

it("reaches a goal the same way whether or not it stops there, for every goal on a flat and a terraced arena", () => {
  for (const arena of [hall, terraced]) {
    const full = walkingRoutesFrom(arena, {x: 1.5, y: 1.5});
    for (const goal of full.values()) {
      const stopped = walkingRoutesFrom(arena, {x: 1.5, y: 1.5}, goal.tile);

      expect(wayBackFrom(stopped, goal.tile)).toEqual(wayBackFrom(full, goal.tile));
    }
  }
});

it("searches everywhere, and finds no goal, when the goal cannot be reached", () => {
  const full = walkingRoutesFrom(terraced, {x: 1.5, y: 1.5});

  expect(walkingRoutesFrom(terraced, {x: 1.5, y: 1.5}, {x: 0.5, y: 0.5})).toEqual(full);
});

it("is done at once when the goal is the tile the walker stands on", () => {
  expect([...walkingRoutesFrom(hall, {x: 1.2, y: 1.8}, {x: 1.9, y: 1.1}).keys()]).toEqual(["1,1"]);
});

function wayBackFrom(routes: ReadonlyMap<string, WalkStep>, goal: Point): string[] {
  const way: string[] = [];
  let current = routes.get(tileKeyOf(goal));
  while (current) {
    way.push(tileKeyOf(current.tile));
    current = current.cameFrom && routes.get(tileKeyOf(current.cameFrom));
  }

  return way;
}

function depthOf(routes: ReadonlyMap<string, WalkStep>, step: WalkStep): number {
  let depth = 0;
  let current = step;
  while (current.cameFrom) {
    depth += 1;
    const previous = routes.get(tileKeyOf(current.cameFrom));
    if (!previous) {
      break;
    }

    current = previous;
  }

  return depth;
}
