import {arenaFrom} from "@gunsmith/engine/arena/ArenaFrom";
import {openRegionsOf} from "@gunsmith/engine/arena-validation/regions/OpenRegionsOf";

it("gives one region for a room, its first tile the south-west corner of the floor", () => {
  const regions = openRegionsOf(arenaFrom(["####", "#..#", "#..#", "####"]));

  expect(regions).toHaveLength(1);
  expect(regions[0]?.[0]).toEqual({x: 1.5, y: 1.5});
  expect(regions[0]).toHaveLength(4);
});

it("gives no region for an arena of wall", () => {
  expect(openRegionsOf(arenaFrom(["##", "##"]))).toEqual([]);
});

it("gives a region for each stretch of floor a wall divides, in the order of their first tiles along the rows from the south", () => {
  const regions = openRegionsOf(arenaFrom(["#####", "#.#.#", "#...#", "####."]));

  expect(regions.map(region => region[0])).toEqual([
    {x: 4.5, y: 0.5},
    {x: 1.5, y: 1.5},
  ]);
});

it("splits a platform without a stair from the low ground, and joins one with a stair", () => {
  expect(openRegionsOf(arenaFrom(["######", "#..11#", "#..11#", "######"]))).toHaveLength(2);
  expect(openRegionsOf(arenaFrom(["######", "#.>11#", "#..11#", "######"]))).toHaveLength(1);
});
