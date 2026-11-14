import {arenaFrom} from "@gunsmith/engine/arena/ArenaFrom";
import {solidTilesOf} from "@gunsmith/engine/arena/SolidTilesOf";
import {hasClearLine} from "@gunsmith/engine/vision/sight/HasClearLine";

// Floor is x 1 to 5 and y 1 to 3, with a one-tile pillar at x 3, y 2.
const hall = arenaFrom(["#######", "#.....#", "#..#..#", "#.....#", "#######"]);

it("sees along a row with nothing in the way", () => {
  expect(hasClearLine(solidTilesOf(hall), {x: 1.5, y: 1.5}, {x: 5.5, y: 1.5})).toBe(true);
});

it("does not see through a pillar", () => {
  expect(hasClearLine(solidTilesOf(hall), {x: 1.5, y: 2.5}, {x: 5.5, y: 2.5})).toBe(false);
});

it("does not see through a pillar the other way round", () => {
  expect(hasClearLine(solidTilesOf(hall), {x: 5.5, y: 2.5}, {x: 1.5, y: 2.5})).toBe(false);
});

it("sees at an angle round a pillar that is not on the line", () => {
  expect(hasClearLine(solidTilesOf(hall), {x: 1.5, y: 1.5}, {x: 5.5, y: 2})).toBe(true);
});

it("does not see through a pillar at an angle", () => {
  expect(hasClearLine(solidTilesOf(hall), {x: 1.5, y: 1.5}, {x: 4.5, y: 3.5})).toBe(false);
});

it("sees a target in the same place", () => {
  expect(hasClearLine(solidTilesOf(hall), {x: 1.5, y: 1.5}, {x: 1.5, y: 1.5})).toBe(true);
});

it("does not see a target that stands in a wall", () => {
  expect(hasClearLine(solidTilesOf(hall), {x: 1.5, y: 1.5}, {x: 3.5, y: 2.5})).toBe(false);
});

it("sees steeply to the north-east, where nothing is in the way", () => {
  expect(hasClearLine(solidTilesOf(hall), {x: 1.5, y: 1.5}, {x: 2.5, y: 3.5})).toBe(true);
});

it("sees steeply to the south-east, where nothing is in the way", () => {
  expect(hasClearLine(solidTilesOf(hall), {x: 1.5, y: 3.5}, {x: 2.5, y: 1.5})).toBe(true);
});

it("sees straight up a column", () => {
  expect(hasClearLine(solidTilesOf(hall), {x: 1.5, y: 1.5}, {x: 1.5, y: 3.5})).toBe(true);
});

it("does not see through the outer wall", () => {
  expect(hasClearLine(solidTilesOf(hall), {x: 1.5, y: 1.5}, {x: 1.5, y: 5.5})).toBe(false);
});
