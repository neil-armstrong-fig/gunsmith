import {arenaFrom} from "@gunsmith/engine/arena/ArenaFrom";
import {canSeeFighter} from "@gunsmith/engine/vision/sight/CanSeeFighter";
import type {Cone} from "@gunsmith/engine/vision/types/Cone";

// Low ground at x 1 to 10, with a cover block at x 4.
const lowRow = arenaFrom(["############", "#...c......#", "############"]);
// A platform one level up at x 1 and 2, a stair at x 3 down to the low ground, and a cover block at x 6.
const platformAndRow = arenaFrom(["#############", "#11<..c.....#", "#############"]);

const FROM_LOW: Cone = {
  apex: {x: 1.5, y: 1.5},
  aim: {x: 1, y: 0},
  halfAngleRadians: Math.PI / 4,
  range: 10,
  eyeLevel: 0,
  crouching: false,
};
const FROM_PLATFORM: Cone = {...FROM_LOW, eyeLevel: 1};

it("sees a standing fighter behind a cover block, since a standing viewer sees over it", () => {
  expect(canSeeFighter(lowRow, FROM_LOW, {position: {x: 5.5, y: 1.5}, crouching: false})).toBe(true);
});

it("does not see a crouched fighter with a cover block right beside them", () => {
  expect(canSeeFighter(lowRow, FROM_LOW, {position: {x: 5.5, y: 1.5}, crouching: true})).toBe(false);
});

it("sees a crouched fighter in the open, farther from the block than its reach", () => {
  expect(canSeeFighter(lowRow, FROM_LOW, {position: {x: 9.5, y: 1.5}, crouching: true})).toBe(true);
});

it("sees a crouched fighter in front of the block, between it and the viewer", () => {
  expect(canSeeFighter(lowRow, FROM_LOW, {position: {x: 3.5, y: 1.5}, crouching: true})).toBe(true);
});

it("does not see a standing fighter behind a cover block when the viewer crouches", () => {
  expect(canSeeFighter(lowRow, {...FROM_LOW, crouching: true}, {position: {x: 5.5, y: 1.5}, crouching: false})).toBe(
    false,
  );
});

it("sees a standing fighter in front of the block when the viewer crouches", () => {
  expect(canSeeFighter(lowRow, {...FROM_LOW, crouching: true}, {position: {x: 3.5, y: 1.5}, crouching: false})).toBe(
    true,
  );
});

it("does not see a fighter outside the cone, whatever the cover", () => {
  expect(canSeeFighter(lowRow, {...FROM_LOW, aim: {x: -1, y: 0}}, {position: {x: 9.5, y: 1.5}, crouching: false})).toBe(
    false,
  );
});

it("does not see a fighter beyond the range, whatever the cover", () => {
  expect(canSeeFighter(lowRow, {...FROM_LOW, range: 6}, {position: {x: 9.5, y: 1.5}, crouching: false})).toBe(false);
});

it("still does not see a fighter behind a wall", () => {
  const walled = arenaFrom(["############", "#...#......#", "############"]);

  expect(canSeeFighter(walled, FROM_LOW, {position: {x: 6.5, y: 1.5}, crouching: false})).toBe(false);
});

it("from higher ground, sees a standing fighter behind cover on the lower ground", () => {
  expect(canSeeFighter(platformAndRow, FROM_PLATFORM, {position: {x: 7.5, y: 1.5}, crouching: false})).toBe(true);
});

it("from higher ground, a crouching viewer still sees over cover on the lower ground", () => {
  const crouchingOnThePlatform = {...FROM_PLATFORM, crouching: true};

  expect(canSeeFighter(platformAndRow, crouchingOnThePlatform, {position: {x: 7.5, y: 1.5}, crouching: false})).toBe(
    true,
  );
});

it("from higher ground, still does not see a crouched fighter with cover right beside them", () => {
  expect(canSeeFighter(platformAndRow, FROM_PLATFORM, {position: {x: 7.5, y: 1.5}, crouching: true})).toBe(false);
});
