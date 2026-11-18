import {arenaFrom} from "@gunsmith/engine/arena/ArenaFrom";
import {startingWorld} from "@gunsmith/engine/game-loop/StartingWorld";
import type {Player} from "@gunsmith/engine/player/types/Player";
import {canSee} from "@gunsmith/engine/opponent/sight/CanSee";
import {RIFLE} from "@gunsmith/engine/weapon/weapons/Rifle";

const hall = arenaFrom([
  "########################################",
  "#......................................#",
  "#......................................#",
  "#......................................#",
  "########################################",
]);
const walled = arenaFrom(["###########", "#....#....#", "#....#....#", "###########"]);

it("sees a player in front of it within its weapon's range", () => {
  expect(
    canSee(hall, opponentAt(2.5, 2.5), {position: {x: 2.5 + RIFLE.visionRange - 1, y: 2.5}, crouching: false}),
  ).toBe(true);
});

it("sees a player exactly at its weapon's range", () => {
  expect(canSee(hall, opponentAt(2.5, 2.5), {position: {x: 2.5 + RIFLE.visionRange, y: 2.5}, crouching: false})).toBe(
    true,
  );
});

it("does not see a player beyond its weapon's range, though no wall is in the way", () => {
  expect(
    canSee(hall, opponentAt(2.5, 2.5), {position: {x: 2.5 + RIFLE.visionRange + 0.5, y: 2.5}, crouching: false}),
  ).toBe(false);
});

it("does not see a player behind it, however near", () => {
  expect(canSee(hall, opponentAt(10.5, 2.5), {position: {x: 7.5, y: 2.5}, crouching: false})).toBe(false);
});

it("sees that player once it turns round", () => {
  expect(canSee(hall, opponentAt(10.5, 2.5, {x: -1, y: 0}), {position: {x: 7.5, y: 2.5}, crouching: false})).toBe(true);
});

it("does not see a player behind a wall, however near", () => {
  expect(canSee(walled, opponentAt(3.5, 1.5), {position: {x: 7.5, y: 1.5}, crouching: false})).toBe(false);
});

it("sees a player on the same spot", () => {
  expect(canSee(hall, opponentAt(2.5, 2.5), {position: {x: 2.5, y: 2.5}, crouching: false})).toBe(true);
});

// The opponent stands on the low ground at x = 2.5 with a platform one level up from x = 6 to x = 10.
const platformAhead = arenaFrom(["###############", "#....11111....#", "#....11111....#", "###############"]);

it("does not see a player on a platform when it stands on the low ground below, though the player is in front of it and in range", () => {
  expect(canSee(platformAhead, opponentAt(2.5, 2.5), {position: {x: 7.5, y: 2.5}, crouching: false})).toBe(false);
});

it("sees a player on the low ground when it stands on the platform", () => {
  expect(canSee(platformAhead, opponentAt(7.5, 2.5), {position: {x: 12.5, y: 2.5}, crouching: false})).toBe(true);
});

// A cover block at x = 4 on the opponent's row.
const withCover = arenaFrom(["###########", "#...c.....#", "###########"]);

it("sees a player standing behind a cover block, since it sees over it", () => {
  expect(canSee(withCover, opponentAt(1.5, 1.5), {position: {x: 5.5, y: 1.5}, crouching: false})).toBe(true);
});

it("does not see a player crouching behind a cover block", () => {
  expect(canSee(withCover, opponentAt(1.5, 1.5), {position: {x: 5.5, y: 1.5}, crouching: true})).toBe(false);
});

it("sees a player crouching in the open, away from the block", () => {
  expect(canSee(withCover, opponentAt(1.5, 1.5), {position: {x: 9.5, y: 1.5}, crouching: true})).toBe(true);
});

// An opponent at `position`, facing east with the rifle in hand.
function opponentAt(x: number, y: number, aim = {x: 1, y: 0}): Player {
  const opponent = startingWorld(hall, [], {x, y}).opponent;
  if (!opponent) {
    throw new Error("The world has no opponent.");
  }

  return {...opponent, aim};
}
