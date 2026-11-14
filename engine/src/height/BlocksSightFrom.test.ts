import {arenaFrom} from "@gunsmith/engine/arena/ArenaFrom";
import {blocksSightFrom} from "@gunsmith/engine/height/BlocksSightFrom";

// Low ground at x 1, a stair at x 2 up to level 1 at x 3, a stair at x 4 up to level 2 at x 5.
const terraces = arenaFrom(["#######", "#.>1>2#", "#######"]);

it("is stopped by a wall, from any level", () => {
  expect(blocksSightFrom(terraces, 0)(0, 1)).toBe(true);
  expect(blocksSightFrom(terraces, 2)(0, 1)).toBe(true);
});

it("is stopped by everything beyond the arena's edge, from any level", () => {
  expect(blocksSightFrom(terraces, 2)(-1, 1)).toBe(true);
  expect(blocksSightFrom(terraces, 2)(7, 1)).toBe(true);
});

it("is stopped by ground higher than the viewer", () => {
  expect(blocksSightFrom(terraces, 0)(3, 1)).toBe(true);
  expect(blocksSightFrom(terraces, 0)(5, 1)).toBe(true);
  expect(blocksSightFrom(terraces, 1)(5, 1)).toBe(true);
});

it("sees ground on the viewer's own level", () => {
  expect(blocksSightFrom(terraces, 0)(1, 1)).toBe(false);
  expect(blocksSightFrom(terraces, 1)(3, 1)).toBe(false);
  expect(blocksSightFrom(terraces, 2)(5, 1)).toBe(false);
});

it("sees ground lower than the viewer", () => {
  expect(blocksSightFrom(terraces, 1)(1, 1)).toBe(false);
  expect(blocksSightFrom(terraces, 2)(1, 1)).toBe(false);
  expect(blocksSightFrom(terraces, 2)(3, 1)).toBe(false);
});

it("treats a stair as the level of its low end, so it is no higher than the ground it climbs from", () => {
  expect(blocksSightFrom(terraces, 0)(2, 1)).toBe(false);
  expect(blocksSightFrom(terraces, 0)(4, 1)).toBe(true);
  expect(blocksSightFrom(terraces, 1)(4, 1)).toBe(false);
});
