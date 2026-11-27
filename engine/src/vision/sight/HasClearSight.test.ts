import {arenaFrom} from "@gunsmith/engine/arena/ArenaFrom";
import type {Eye} from "@gunsmith/engine/height/types/Eye";
import {hasClearSight} from "@gunsmith/engine/vision/sight/HasClearSight";

const LOW: Eye = {eyeLevel: 0, crouching: false};
const RAISED: Eye = {eyeLevel: 1, crouching: false};
const TOP: Eye = {eyeLevel: 2, crouching: false};

describe("past one platform", () => {
  // Low ground at x 1 to 3, a platform one level up at x 4 to 8 (its west face at x = 4), low ground again at x 9.
  const ledge = arenaFrom(["###########", "#...11111.#", "###########"]);

  it("sees a fighter at the platform's edge from the low ground", () => {
    expect(hasClearSight(ledge, {from: {x: 1.5, y: 1.5}, eye: LOW, to: {x: 4.5, y: 1.5}})).toBe(true);
  });

  it("does not see a fighter stepped back from the edge from the low ground", () => {
    expect(hasClearSight(ledge, {from: {x: 1.5, y: 1.5}, eye: LOW, to: {x: 6.5, y: 1.5}})).toBe(false);
  });

  it("sees a fighter just inside a tile of the edge, and not one a whole tile in", () => {
    expect(hasClearSight(ledge, {from: {x: 1.5, y: 1.5}, eye: LOW, to: {x: 4.95, y: 1.5}})).toBe(true);
    expect(hasClearSight(ledge, {from: {x: 1.5, y: 1.5}, eye: LOW, to: {x: 5, y: 1.5}})).toBe(false);
  });

  it("sees the low ground from the platform's edge", () => {
    expect(hasClearSight(ledge, {from: {x: 4.5, y: 1.5}, eye: RAISED, to: {x: 2.5, y: 1.5}})).toBe(true);
  });

  it("does not see the low ground from deep on the platform", () => {
    expect(hasClearSight(ledge, {from: {x: 6.5, y: 1.5}, eye: RAISED, to: {x: 2.5, y: 1.5}})).toBe(false);
  });

  it("sees the low ground below the far edge from that edge", () => {
    expect(hasClearSight(ledge, {from: {x: 8.5, y: 1.5}, eye: RAISED, to: {x: 9.5, y: 1.5}})).toBe(true);
  });

  it("sees the same level from the platform, edge to edge", () => {
    expect(hasClearSight(ledge, {from: {x: 4.5, y: 1.5}, eye: RAISED, to: {x: 8.5, y: 1.5}})).toBe(true);
  });

  it("does not see the low ground beyond the platform from the low ground", () => {
    expect(hasClearSight(ledge, {from: {x: 1.5, y: 1.5}, eye: LOW, to: {x: 9.5, y: 1.5}})).toBe(false);
  });

  it("still stops at a wall between two levels", () => {
    const walled = arenaFrom(["###########", "#..#11111.#", "###########"]);

    expect(hasClearSight(walled, {from: {x: 1.5, y: 1.5}, eye: LOW, to: {x: 4.5, y: 1.5}})).toBe(false);
  });
});

describe("two levels up", () => {
  // Low ground at x 1 and 2, a deck one level up at x 3 to 5 (its face at x = 3), a top two levels up at x 6 and 7 (its face at
  // x = 6), and low ground again at x 8 and 9.
  const tower = arenaFrom(["###########", "#..11122..#", "###########"]);

  it("sees a fighter at the deck's edge from the low ground", () => {
    expect(hasClearSight(tower, {from: {x: 1.5, y: 1.5}, eye: LOW, to: {x: 3.5, y: 1.5}})).toBe(true);
  });

  it("does not see a fighter at the top's edge from the low ground, across the deck", () => {
    expect(hasClearSight(tower, {from: {x: 1.5, y: 1.5}, eye: LOW, to: {x: 6.5, y: 1.5}})).toBe(false);
  });

  it("does not see the low ground across the deck from the top's edge", () => {
    expect(hasClearSight(tower, {from: {x: 6.5, y: 1.5}, eye: TOP, to: {x: 1.5, y: 1.5}})).toBe(false);
  });

  it("sees the deck from the top's edge", () => {
    expect(hasClearSight(tower, {from: {x: 6.5, y: 1.5}, eye: TOP, to: {x: 4.5, y: 1.5}})).toBe(true);
  });
});

describe("on a stair", () => {
  // Low ground at x 1 and 2, a stair at x 3 climbing east onto a platform at x 4 to 6.
  const stair = arenaFrom(["#########", "#..>111.#", "#########"]);

  it("judges a fighter on a stair by its upper level, so from below it is seen though the platform is not", () => {
    expect(hasClearSight(stair, {from: {x: 1.5, y: 1.5}, eye: LOW, to: {x: 3.5, y: 1.5}})).toBe(true);
    expect(hasClearSight(stair, {from: {x: 1.5, y: 1.5}, eye: LOW, to: {x: 5.5, y: 1.5}})).toBe(false);
  });
});

describe("past low cover", () => {
  // Low ground at x 1 to 3 with a cover block at x 2, a platform at x 4 to 6.
  const yard = arenaFrom(["#########", "#.c.111.#", "#########"]);

  it("lets a crouched viewer on higher ground see over low cover anywhere on the line", () => {
    expect(hasClearSight(yard, {from: {x: 4.5, y: 1.5}, eye: {...RAISED, crouching: true}, to: {x: 1.5, y: 1.5}})).toBe(
      true,
    );
  });

  it("stops a crouched viewer on the low ground at low cover looking up at the edge", () => {
    expect(hasClearSight(yard, {from: {x: 1.5, y: 1.5}, eye: {...LOW, crouching: true}, to: {x: 4.5, y: 1.5}})).toBe(
      false,
    );
    expect(hasClearSight(yard, {from: {x: 1.5, y: 1.5}, eye: LOW, to: {x: 4.5, y: 1.5}})).toBe(true);
  });
});
