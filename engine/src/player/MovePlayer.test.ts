import {arenaFrom} from "@gunsmith/engine/arena/ArenaFrom";
import {movePlayer} from "@gunsmith/engine/player/MovePlayer";
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
