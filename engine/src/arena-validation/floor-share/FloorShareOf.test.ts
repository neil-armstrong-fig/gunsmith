import {arenaFrom} from "@gunsmith/engine/arena/ArenaFrom";
import {floorShareOf} from "@gunsmith/engine/arena-validation/floor-share/FloorShareOf";

it("is the open tiles over all the tiles, border walls included", () => {
  expect(floorShareOf(arenaFrom(["####", "#..#", "#..#", "####"]))).toBe(0.25);
});

it("is 0 for an arena of nothing but wall", () => {
  expect(floorShareOf(arenaFrom(["###", "###"]))).toBe(0);
});

it("is 1 for an arena with no wall at all", () => {
  expect(floorShareOf(arenaFrom(["..", ".."]))).toBe(1);
});

it("counts a cover block as wall, since nobody walks through it", () => {
  expect(floorShareOf(arenaFrom(["#####", "#.cc#", "#####"]))).toBeCloseTo(1 / 15);
});

it("counts raised floor and a stair as floor", () => {
  expect(floorShareOf(arenaFrom(["#####", "#.>1#", "#####"]))).toBeCloseTo(3 / 15);
});
