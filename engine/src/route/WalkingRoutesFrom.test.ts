import {arenaFrom} from "@gunsmith/engine/arena/ArenaFrom";
import type {WalkStep} from "@gunsmith/engine/route/types/WalkStep";
import {tileKeyOf} from "@gunsmith/engine/route/TileKeyOf";
import {walkingRoutesFrom} from "@gunsmith/engine/route/WalkingRoutesFrom";

const terraced = arenaFrom(["#######", "#..>11#", "#..#11#", "#######"]);

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
