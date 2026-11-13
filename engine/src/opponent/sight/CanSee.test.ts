import {arenaFrom} from "@gunsmith/engine/arena/ArenaFrom";
import {DIFFICULTY} from "@gunsmith/engine/opponent/Difficulty";
import {canSee} from "@gunsmith/engine/opponent/sight/CanSee";

const hall = arenaFrom([
  "########################################",
  "#......................................#",
  "#......................................#",
  "#......................................#",
  "########################################",
]);
const walled = arenaFrom(["###########", "#....#....#", "#....#....#", "###########"]);

it("sees a player in the open within its sight range", () => {
  expect(canSee(hall, {x: 2.5, y: 2.5}, {x: 2.5 + DIFFICULTY.sightRange - 1, y: 2.5})).toBe(true);
});

it("sees a player exactly at its sight range", () => {
  expect(canSee(hall, {x: 2.5, y: 2.5}, {x: 2.5 + DIFFICULTY.sightRange, y: 2.5})).toBe(true);
});

it("does not see a player beyond its sight range, though no wall is in the way", () => {
  expect(canSee(hall, {x: 2.5, y: 2.5}, {x: 2.5 + DIFFICULTY.sightRange + 0.5, y: 2.5})).toBe(false);
});

it("does not see a player behind a wall, however near", () => {
  expect(canSee(walled, {x: 3.5, y: 1.5}, {x: 7.5, y: 1.5})).toBe(false);
});

it("sees a player on the same spot", () => {
  expect(canSee(hall, {x: 2.5, y: 2.5}, {x: 2.5, y: 2.5})).toBe(true);
});
