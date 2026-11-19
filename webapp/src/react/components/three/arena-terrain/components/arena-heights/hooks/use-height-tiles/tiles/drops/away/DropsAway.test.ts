import {arenaFrom} from "@gunsmith/engine/arena/ArenaFrom";
import {dropsAway} from "@src/react/components/three/arena-terrain/components/arena-heights/hooks/use-height-tiles/tiles/drops/away/DropsAway";

// A platform tile at (2, 1) with low ground to its west, a wall to its north and south, and a stair on its east side climbing west onto it from low ground.
const arena = arenaFrom(["######", "#.1<.#", "######"]);
const FLOOR = {x: 2, y: 1, level: 1};

it("drops where the neighbour is open ground on a lower level", () => {
  expect(dropsAway(arena, FLOOR, "west")).toBe(true);
});

it("does not drop against a wall", () => {
  expect(dropsAway(arena, FLOOR, "north")).toBe(false);
  expect(dropsAway(arena, FLOOR, "south")).toBe(false);
});

it("drops towards a low cover block, which is low ground with a block on it and no wall", () => {
  expect(dropsAway(arenaFrom(["#####", "#c1.#", "#####"]), {x: 2, y: 1, level: 1}, "west")).toBe(true);
});

it("does not drop on the side a stair arrives, since that is the way up", () => {
  expect(dropsAway(arena, FLOOR, "east")).toBe(false);
});

it("does not drop towards ground on the same level or a higher one", () => {
  const level = arenaFrom(["####", "#11#", "####"]);

  expect(dropsAway(level, {x: 1, y: 1, level: 1}, "east")).toBe(false);
  expect(dropsAway(level, {x: 2, y: 1, level: 1}, "west")).toBe(false);
  expect(dropsAway(arenaFrom(["####", "#12#", "####"]), {x: 1, y: 1, level: 1}, "east")).toBe(false);
});
