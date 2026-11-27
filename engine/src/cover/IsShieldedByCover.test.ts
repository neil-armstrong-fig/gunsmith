import {arenaFrom} from "@gunsmith/engine/arena/ArenaFrom";
import {COVER_REACH_TILES} from "@gunsmith/engine/cover/CoverReach";
import {isShieldedByCover} from "@gunsmith/engine/cover/IsShieldedByCover";

// One row of low ground, x 1 to 11, with a cover block at x 7 and a wall at x 3.
const row = arenaFrom(["#############", "#..#...c....#", "#############"]);
const EAST = {x: 1, y: 0};
const WEST = {x: -1, y: 0};

it("shields a crouched target with a cover block right beside it on the bullet's way", () => {
  expect(isShieldedByCover(row, EAST, {position: {x: 8.5, y: 1.5}, crouching: true})).toBe(true);
});

it("shields a crouched target from a bullet that comes from the other side of the block", () => {
  expect(isShieldedByCover(row, WEST, {position: {x: 6.5, y: 1.5}, crouching: true})).toBe(true);
});

it("shields no one who stands, whatever stands beside them", () => {
  expect(isShieldedByCover(row, EAST, {position: {x: 8.5, y: 1.5}, crouching: false})).toBe(false);
  expect(isShieldedByCover(row, EAST, {position: {x: 8.5, y: 1.5}, crouching: undefined})).toBe(false);
});

it("shields no one in the open", () => {
  expect(isShieldedByCover(row, EAST, {position: {x: 10.5, y: 1.5}, crouching: true})).toBe(false);
});

it("does not shield a target farther behind the block than the reach", () => {
  expect(COVER_REACH_TILES).toBeLessThan(4);
  expect(isShieldedByCover(row, EAST, {position: {x: 11.5, y: 1.5}, crouching: true})).toBe(false);
});

it("does not shield a target the bullet reaches before the block, which lies ahead of them", () => {
  expect(isShieldedByCover(row, EAST, {position: {x: 6.5, y: 1.5}, crouching: true})).toBe(false);
});

it("does not count a wall beside the target as cover", () => {
  expect(isShieldedByCover(row, EAST, {position: {x: 4.5, y: 1.5}, crouching: true})).toBe(false);
  expect(isShieldedByCover(row, WEST, {position: {x: 2.5, y: 1.5}, crouching: true})).toBe(false);
});

it("shields along a diagonal bullet that crosses the block beside the target", () => {
  const diagonal = arenaFrom(["#########", "#.......#", "#.......#", "#...c...#", "#.......#", "#########"]);
  const direction = {x: 4 / Math.hypot(4, 1), y: 1 / Math.hypot(4, 1)};

  expect(isShieldedByCover(diagonal, direction, {position: {x: 5.5, y: 2.5}, crouching: true})).toBe(true);
});

it("does not shield a target the diagonal bullet reaches beside the block rather than behind it", () => {
  const diagonal = arenaFrom(["#########", "#.......#", "#.......#", "#...c...#", "#.......#", "#########"]);
  const direction = {x: 4 / Math.hypot(4, 1), y: 1 / Math.hypot(4, 1)};

  expect(isShieldedByCover(diagonal, direction, {position: {x: 5.5, y: 4.5}, crouching: true})).toBe(false);
});

it("does not shield a crouched target up on a platform with a cover block on the low ground below it", () => {
  // Low ground at x 1 to 3 with a cover block at x 3, and a platform one level up at x 4 to 6.
  const foot = arenaFrom(["########", "#..c111#", "########"]);

  expect(isShieldedByCover(foot, EAST, {position: {x: 4.5, y: 1.5}, crouching: true})).toBe(false);
});
