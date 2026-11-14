import {landingIndex} from "@gunsmith/engine/arena/drawing/stairs/LandingIndex";
import type {DrawnArena} from "@gunsmith/engine/arena/types/DrawnArena";

// Three by two. Row 0 (south) is floor, a stair, a wall; row 1 is floor, floor, floor.
const arena: DrawnArena = {
  width: 3,
  height: 2,
  solid: [false, false, true, false, false, false],
  levels: [0, 0, 0, 0, 0, 0],
  stairs: [undefined, "east", undefined, undefined, undefined, undefined],
};

it("gives the index of a plain floor tile", () => {
  expect(landingIndex(arena, {x: 0, y: 0})).toBe(0);
  expect(landingIndex(arena, {x: 2, y: 1})).toBe(5);
});

it("gives nothing for a wall", () => {
  expect(landingIndex(arena, {x: 2, y: 0})).toBeUndefined();
});

it("gives nothing for a stair", () => {
  expect(landingIndex(arena, {x: 1, y: 0})).toBeUndefined();
});

it("gives nothing beyond any of the four edges, and does not wrap onto the next row", () => {
  expect(landingIndex(arena, {x: -1, y: 1})).toBeUndefined();
  expect(landingIndex(arena, {x: 3, y: 0})).toBeUndefined();
  expect(landingIndex(arena, {x: 0, y: -1})).toBeUndefined();
  expect(landingIndex(arena, {x: 0, y: 2})).toBeUndefined();
});
