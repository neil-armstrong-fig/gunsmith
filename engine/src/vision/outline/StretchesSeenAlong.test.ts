import {arenaFrom} from "@gunsmith/engine/arena/ArenaFrom";
import type {Arena} from "@gunsmith/engine/arena/types/Arena";
import type {Point} from "@gunsmith/engine/geometry/types/Point";
import {stretchesSeenAlong} from "@gunsmith/engine/vision/outline/StretchesSeenAlong";
import type {Cone} from "@gunsmith/engine/vision/types/Cone";

// Floor is x 1 to 8 and y 1 to 3; a wall tile stands at x 5, y 2, so its west face is at x 5.
const room = arenaFrom(["##########", "#........#", "#....#...#", "#........#", "##########"]);
const EAST = {x: 1, y: 0};
const LOOKING: Cone = {
  apex: {x: 1.5, y: 1.5},
  aim: EAST,
  halfAngleRadians: Math.PI / 2,
  range: 4,
  eyeLevel: 0,
  crouching: false,
};

describe("on the flat", () => {
  it("reaches the full range when nothing is in the way", () => {
    expect(reachOf(room, LOOKING, EAST)).toBe(4);
  });

  it("stops at the face of a wall, not a sample inside it", () => {
    const reach = reachOf(room, {...LOOKING, apex: {x: 1.5, y: 2.5}, range: 10}, EAST);

    expect(reach).toBeLessThanOrEqual(3.5);
    expect(reach).toBeGreaterThan(3.5 - 0.005);
  });

  it("stops at the face of a wall met at a slant", () => {
    const angle = Math.PI / 12;
    const reach = reachOf(room, {...LOOKING, range: 10}, {x: Math.cos(angle), y: Math.sin(angle)});

    expect(reach).toBeLessThanOrEqual(3.5 / Math.cos(angle));
    expect(reach).toBeGreaterThan(3.5 / Math.cos(angle) - 0.005);
  });

  it("stops at the outer wall when the range goes past it", () => {
    const reach = reachOf(room, {...LOOKING, range: 20}, EAST);

    expect(reach).toBeLessThanOrEqual(7.5);
    expect(reach).toBeGreaterThan(7.5 - 0.005);
  });
});

describe("between two levels", () => {
  // Low ground at x 1 to 3, a platform one level up at x 4 to 8 (its west face at x = 4), low ground again at x 9 to 12.
  const ledge = arenaFrom(["##############", "#...11111....#", "##############"]);
  const FROM_LOW: Cone = {...LOOKING, range: 12};

  it("reaches one tile onto a platform from the low ground", () => {
    const reach = reachOf(ledge, FROM_LOW, EAST);

    expect(reach).toBeLessThanOrEqual(3.5);
    expect(reach).toBeGreaterThan(3.5 - 0.005);
  });

  it("reaches across the platform and down past its far edge from that edge", () => {
    expect(reachOf(ledge, {...FROM_LOW, apex: {x: 8.5, y: 1.5}, eyeLevel: 1, range: 4}, EAST)).toBe(4);
  });

  it("reaches across the platform but not down past its far edge from its middle", () => {
    const reach = reachOf(ledge, {...FROM_LOW, apex: {x: 6.5, y: 1.5}, eyeLevel: 1, range: 5}, EAST);

    expect(reach).toBeLessThanOrEqual(2.5);
    expect(reach).toBeGreaterThan(2.5 - 0.005);
  });

  it("reaches over a cover block on the low ground from a crouched viewer at the platform's edge", () => {
    const yard = arenaFrom(["##############", "#.c.11111....#", "##############"]);
    const crouched = {...FROM_LOW, apex: {x: 4.5, y: 1.5}, eyeLevel: 1, crouching: true, range: 3.4};

    expect(reachOf(yard, crouched, {x: -1, y: 0})).toBe(3.4);
  });
});

describe("past the corner of a higher block", () => {
  // Low ground with a deck one level up at x 6 to 8 in the row y = 2 (its west face at x = 6) and one tile two levels up just west
  // of it, at (5, 2). The line between a fighter on the low ground at (1.5, 4.5) and one at the deck's edge at (6.3, 2.85) clips
  // that tile's top-right corner, less than a tile from the deck's edge, so it is raised floor above both of them within reach.
  const clipped = arenaFrom(["##########", "#........#", "#........#", "#....2111#", "#........#", "##########"]);
  const LOW = {x: 1.5, y: 4.5};
  const DECK = {x: 6.3, y: 2.85};
  const length = Math.hypot(DECK.x - LOW.x, DECK.y - LOW.y);

  it("stops a look up at the deck's edge where the line enters the deck, past the higher corner", () => {
    const direction = {x: (DECK.x - LOW.x) / length, y: (DECK.y - LOW.y) / length};
    const toTheDeck = (6 - LOW.x) / direction.x;

    expect(reachOf(clipped, {...LOOKING, apex: LOW, range: length}, direction)).toBeLessThanOrEqual(toTheDeck);
  });

  it("stops a look down from the deck's edge before the low ground, past the higher corner", () => {
    const direction = {x: (LOW.x - DECK.x) / length, y: (LOW.y - DECK.y) / length};
    const toTheLowGround = (3 - DECK.y) / direction.y;

    expect(reachOf(clipped, {...LOOKING, apex: DECK, eyeLevel: 1, range: length}, direction)).toBeLessThanOrEqual(
      toTheLowGround,
    );
  });
});

describe("across low ground between two platforms on one level", () => {
  // A platform one level up at x 1 to 3 (its east face at x = 4), low ground at x 4 to 7, a second platform at x 8 to 10 (its west face
  // at x = 8), and low ground again at x 11 and 12.
  const ridges = arenaFrom(["##############", "#111....111..#", "##############"]);
  const DEEP: Cone = {...LOOKING, apex: {x: 1.5, y: 1.5}, eyeLevel: 1, range: 11};

  it("sees the far platform past the low ground it cannot see down onto", () => {
    const stretches = stretchesSeenAlong(ridges, DEEP, EAST);

    expect(stretches).toHaveLength(2);
    expect(stretches[0]?.from).toBe(0);
    expect(stretches[0]?.to).toBeCloseTo(2.5, 2);
    expect(stretches[1]?.from).toBeCloseTo(6.5, 2);
    expect(stretches[1]?.to).toBeCloseTo(9.5, 2);
  });

  it("puts each end of the far stretch on the far platform's faces, seen just inside and not just outside", () => {
    const [, far] = stretchesSeenAlong(ridges, DEEP, EAST);

    expect(far?.from).toBeGreaterThanOrEqual(6.5);
    expect(far?.from).toBeLessThan(6.5 + 0.005);
    expect(far?.to).toBeLessThanOrEqual(9.5);
    expect(far?.to).toBeGreaterThan(9.5 - 0.005);
  });

  it("sees the whole way from the near platform's edge, where the low ground between is in sight", () => {
    expect(stretchesSeenAlong(ridges, {...DEEP, apex: {x: 3.5, y: 1.5}, range: 6}, EAST)).toEqual([{from: 0, to: 6}]);
  });

  it("never sees past a wall, whatever stands on the same level beyond it", () => {
    const walled = arenaFrom(["##############", "#111..#.111..#", "##############"]);

    expect(stretchesSeenAlong(walled, DEEP, EAST)).toHaveLength(1);
  });
});

/** How far along `direction` the viewer sees before sight first stops: the end of the first stretch seen. */
function reachOf(arena: Arena, cone: Cone, direction: Point): number | undefined {
  return stretchesSeenAlong(arena, cone, direction)[0]?.to;
}
