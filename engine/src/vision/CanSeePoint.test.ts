import {arenaFrom} from "@gunsmith/engine/arena/ArenaFrom";
import {canSeePoint} from "@gunsmith/engine/vision/CanSeePoint";
import type {Cone} from "@gunsmith/engine/vision/types/Cone";

// Floor is x 1 to 9 and y 1 to 3, with a one-tile pillar at x 5, y 2.
const hall = arenaFrom(["###########", "#.........#", "#....#....#", "#.........#", "###########"]);
const open = arenaFrom(["###########", "#.........#", "#.........#", "#.........#", "###########"]);

const EAST: Cone = {apex: {x: 1.5, y: 2.5}, aim: {x: 1, y: 0}, halfAngleRadians: Math.PI / 4, range: 6};

it("sees a point inside the cone with nothing in the way", () => {
  expect(canSeePoint(open, EAST, {x: 5.5, y: 2.5})).toBe(true);
});

it("does not see a point outside the cone, though nothing is in the way", () => {
  expect(canSeePoint(open, {...EAST, aim: {x: -1, y: 0}}, {x: 5.5, y: 2.5})).toBe(false);
});

it("does not see a point beyond the range, though nothing is in the way", () => {
  expect(canSeePoint(open, EAST, {x: 8.5, y: 2.5})).toBe(false);
});

it("does not see a point inside the cone with a wall in the way", () => {
  expect(canSeePoint(hall, {...EAST, apex: {x: 1.5, y: 2.5}}, {x: 6.5, y: 2.5})).toBe(false);
});

it("sees past the wall when the line goes round it", () => {
  expect(canSeePoint(hall, {...EAST, apex: {x: 1.5, y: 1.5}}, {x: 6.5, y: 1.5})).toBe(true);
});
