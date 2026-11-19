import {arenaFrom} from "@gunsmith/engine/arena/ArenaFrom";
import {canSeePoint} from "@gunsmith/engine/vision/sight/CanSeePoint";
import type {Cone} from "@gunsmith/engine/vision/types/Cone";

// Floor is x 1 to 9 and y 1 to 3, with a one-tile pillar at x 5, y 2.
const hall = arenaFrom(["###########", "#.........#", "#....#....#", "#.........#", "###########"]);
const open = arenaFrom(["###########", "#.........#", "#.........#", "#.........#", "###########"]);

const EAST: Cone = {
  apex: {x: 1.5, y: 2.5},
  aim: {x: 1, y: 0},
  halfAngleRadians: Math.PI / 4,
  range: 6,
  eyeLevel: 0,
  crouching: false,
};

describe("on one level", () => {
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
});

describe("across levels", () => {
  // Low ground at x 1 to 3, a platform one level up at x 4 to 8, low ground again at x 9.
  const ledge = arenaFrom(["###########", "#...11111.#", "###########"]);
  const FROM_LOW: Cone = {...EAST, apex: {x: 1.5, y: 1.5}, range: 10};
  const FROM_PLATFORM: Cone = {...FROM_LOW, apex: {x: 5.5, y: 1.5}, eyeLevel: 1};

  it("does not see a point on a platform from the low ground, though nothing but the platform is in the way", () => {
    expect(canSeePoint(ledge, FROM_LOW, {x: 6.5, y: 1.5})).toBe(false);
  });

  it("does not see the platform's near edge from the low ground either", () => {
    expect(canSeePoint(ledge, FROM_LOW, {x: 4.5, y: 1.5})).toBe(false);
  });

  it("does not see low ground behind a platform's edge from the low ground", () => {
    expect(canSeePoint(ledge, FROM_LOW, {x: 9.5, y: 1.5})).toBe(false);
  });

  it("sees low ground in front of a platform from the low ground", () => {
    expect(canSeePoint(ledge, FROM_LOW, {x: 3.5, y: 1.5})).toBe(true);
  });

  it("sees low ground below the platform from the platform", () => {
    expect(canSeePoint(ledge, FROM_PLATFORM, {x: 9.5, y: 1.5})).toBe(true);
    expect(canSeePoint(ledge, {...FROM_PLATFORM, aim: {x: -1, y: 0}}, {x: 2.5, y: 1.5})).toBe(true);
  });

  it("sees a point on the same level from the platform", () => {
    expect(canSeePoint(ledge, FROM_PLATFORM, {x: 8.5, y: 1.5})).toBe(true);
  });

  it("looks from the cone's eye level, not from the tile under its apex", () => {
    expect(canSeePoint(ledge, {...FROM_LOW, eyeLevel: 1}, {x: 6.5, y: 1.5})).toBe(true);
  });

  it("still stops at a wall from a platform", () => {
    const walled = arenaFrom(["###########", "#...11#11.#", "###########"]);

    expect(canSeePoint(walled, FROM_PLATFORM, {x: 8.5, y: 1.5})).toBe(false);
  });
});
