import {arenaFrom} from "@gunsmith/engine/arena/ArenaFrom";
import type {Point} from "@gunsmith/engine/geometry/types/Point";
import {movePlayer} from "@gunsmith/engine/player/MovePlayer";
import {PLAYER_RADIUS} from "@gunsmith/engine/player/PlayerRadius";
import {CROUCH_SPEED_FACTOR} from "@gunsmith/engine/player/walking/CrouchSpeedFactor";
import {PLAYER_SPEED} from "@gunsmith/engine/player/walking/PlayerSpeed";

const arena = arenaFrom(["###########", "#.........#", "#.........#", "#.........#", "###########"]);
const START = {x: 2, y: 2};

it("walks the player speed times the seconds, standing", () => {
  const walked = movePlayer(arena, {position: START, direction: {x: 1, y: 0}, seconds: 0.1, crouching: false});

  expect(walked.x - START.x).toBeCloseTo(PLAYER_SPEED * 0.1, 9);
});

it("walks the crouch factor of that far, crouching", () => {
  const walked = movePlayer(arena, {position: START, direction: {x: 1, y: 0}, seconds: 0.1, crouching: true});

  expect(walked.x - START.x).toBeCloseTo(PLAYER_SPEED * CROUCH_SPEED_FACTOR * 0.1, 9);
});

it("makes crouching a substantial slowdown, not a nudge", () => {
  expect(CROUCH_SPEED_FACTOR).toBeGreaterThan(0);
  expect(CROUCH_SPEED_FACTOR).toBeLessThan(0.6);
});

it("goes no faster crouching on a diagonal, or when asked for more than full speed", () => {
  const walked = movePlayer(arena, {position: START, direction: {x: 3, y: 3}, seconds: 0.1, crouching: true});

  expect(Math.hypot(walked.x - START.x, walked.y - START.y)).toBeCloseTo(PLAYER_SPEED * CROUCH_SPEED_FACTOR * 0.1, 9);
});

it("is still stopped by a wall, crouching", () => {
  const nextToWall = {x: 9.5, y: 2};
  const walked = movePlayer(arena, {position: nextToWall, direction: {x: 1, y: 0}, seconds: 0.1, crouching: true});

  expect(walked.x).toBeLessThan(9.7);
});

// A platform one level up fills x 4 to 6; one stair, at (3, 4), climbs onto it. Above and below the stair's row the
// platform's edge is a drop onto the low ground.
const hills = arenaFrom([
  "########",
  "#...111#",
  "#...111#",
  "#...111#",
  "#..>111#",
  "#...111#",
  "#...111#",
  "#...111#",
  "########",
]);
const TICK_SECONDS = 1 / 60;

function walkFor(from: Point, direction: Point, seconds: number): Point {
  let position = from;

  for (let elapsed = 0; elapsed < seconds; elapsed += TICK_SECONDS) {
    position = movePlayer(hills, {position, direction, seconds: TICK_SECONDS, crouching: false});
  }

  return position;
}

it("stops a walker on the low ground at a platform's edge, as a wall does", () => {
  const walked = walkFor({x: 2.5, y: 6.5}, {x: 1, y: 0}, 1);

  expect(walked.x).toBeCloseTo(4 - PLAYER_RADIUS, 6);
});

it("lets a walker climb a stair onto the platform", () => {
  const walked = walkFor({x: 1.5, y: 4.5}, {x: 1, y: 0}, 1);

  expect(walked.x).toBeGreaterThan(5);
  expect(walked.y).toBeCloseTo(4.5, 6);
});

it("lets a walker come down the stair from the platform, onto the low ground", () => {
  const walked = walkFor({x: 5.5, y: 4.5}, {x: -1, y: 0}, 1);

  expect(walked.x).toBeLessThan(3);
});

it("stops a walker on the platform at its edge above the low ground, as a wall does", () => {
  const walked = walkFor({x: 5.5, y: 6.5}, {x: -1, y: 0}, 1);

  expect(walked.x).toBeCloseTo(4 + PLAYER_RADIUS, 6);
});

it("slides a walker along a platform's edge instead of sticking to it", () => {
  const walked = walkFor({x: 3.2, y: 5.6}, {x: 1, y: 1}, 0.3);

  expect(walked.x).toBeLessThanOrEqual(4 - PLAYER_RADIUS + 1e-6);
  expect(walked.y).toBeGreaterThan(6.5);
});

it("does not let a walker climb beside the stair, even on a diagonal", () => {
  const walked = walkFor({x: 2.5, y: 6.5}, {x: 1, y: -0.2}, 1);

  expect(walked.x).toBeLessThan(4);
});

it("judges a walker from where they stood, so one long step cannot jump the drop onto a platform", () => {
  const walked = movePlayer(hills, {
    position: {x: 3.5, y: 6.5},
    direction: {x: 1, y: 0},
    seconds: 0.1,
    crouching: false,
  });

  expect(walked.x).toBeCloseTo(4 - PLAYER_RADIUS, 6);
});
