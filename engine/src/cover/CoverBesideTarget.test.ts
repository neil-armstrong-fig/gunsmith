import {arenaFrom} from "@gunsmith/engine/arena/ArenaFrom";
import {coverBesideTarget} from "@gunsmith/engine/cover/CoverBesideTarget";
import {COVER_REACH_TILES} from "@gunsmith/engine/cover/CoverReach";

// One row of low ground, x 1 to 11, with a cover block at x 7 and a wall at x 3.
const row = arenaFrom(["#############", "#..#...c....#", "#############"]);

it("is true when a cover block stands on the line right beside the target", () => {
  expect(coverBesideTarget(row, {x: 5.5, y: 1.5}, {x: 8.5, y: 1.5})).toBe(true);
});

it("is false when the only cover on the line is farther from the target than the reach, near the viewer instead", () => {
  expect(COVER_REACH_TILES).toBeLessThan(4);
  expect(coverBesideTarget(row, {x: 6.5, y: 1.5}, {x: 11.5, y: 1.5})).toBe(false);
});

it("is false when no cover stands on the line", () => {
  expect(coverBesideTarget(row, {x: 8.5, y: 1.5}, {x: 11.5, y: 1.5})).toBe(false);
});

it("is false for a wall beside the target, which hides by blocking sight and is not cover", () => {
  expect(coverBesideTarget(row, {x: 1.5, y: 1.5}, {x: 4.5, y: 1.5})).toBe(false);
  expect(coverBesideTarget(row, {x: 5.5, y: 1.5}, {x: 2.5, y: 1.5})).toBe(false);
});

it("is false when the cover is beside the line, not on it", () => {
  const sideways = arenaFrom(["#########", "#.......#", "#...c...#", "#.......#", "#########"]);

  expect(coverBesideTarget(sideways, {x: 1.5, y: 1.5}, {x: 7.5, y: 1.5})).toBe(false);
});

it("is true for a diagonal line that crosses the cover block beside the target", () => {
  const diagonal = arenaFrom(["#########", "#.......#", "#.......#", "#...c...#", "#.......#", "#########"]);

  expect(coverBesideTarget(diagonal, {x: 1.5, y: 1.5}, {x: 5.5, y: 2.5})).toBe(true);
});

it("is true when the viewer stands right against the far side of the block from the target", () => {
  expect(coverBesideTarget(row, {x: 6.9, y: 1.5}, {x: 8.1, y: 1.5})).toBe(true);
});
