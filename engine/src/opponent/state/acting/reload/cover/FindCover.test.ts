import {arenaFrom} from "@gunsmith/engine/arena/ArenaFrom";
import {solidTilesOf} from "@gunsmith/engine/arena/SolidTilesOf";
import {findCover} from "@gunsmith/engine/opponent/state/acting/reload/cover/FindCover";
import {DIFFICULTY} from "@gunsmith/engine/opponent/Difficulty";
import {hasClearLine} from "@gunsmith/engine/vision/sight/HasClearLine";

const room = arenaFrom([
  "##############",
  "#............#",
  "#.....##.....#",
  "#.....##.....#",
  "#.....##.....#",
  "#.....##.....#",
  "#.....##.....#",
  "#............#",
  "##############",
]);
const open = arenaFrom(["##########", "#........#", "#........#", "#........#", "#........#", "##########"]);
const FROM = {x: 3.5, y: 4.5};
const THREAT = {x: 10.5, y: 4.5};

describe("in the usual room", () => {
  it("finds a place out of the threat's sight that can be walked to, within reach", () => {
    let found = 0;
    let seed = 1;
    for (let index = 0; index < 60; index++) {
      const draw = findCover(room, {from: FROM, threat: THREAT, seed});
      seed = draw.seed;
      if (draw.cover) {
        found++;
        expect(hasClearLine(solidTilesOf(room), THREAT, draw.cover)).toBe(false);
        expect(hasClearLine(solidTilesOf(room), FROM, draw.cover)).toBe(true);
        expect(Math.hypot(draw.cover.x - FROM.x, draw.cover.y - FROM.y)).toBeLessThanOrEqual(DIFFICULTY.coverReach);
      }
    }

    expect(found).toBeGreaterThan(40);
  });

  it("finds nothing in an open room, where there is nowhere to hide", () => {
    let seed = 1;
    for (let index = 0; index < 60; index++) {
      const draw = findCover(open, {from: {x: 2.5, y: 2.5}, threat: {x: 7.5, y: 2.5}, seed});
      seed = draw.seed;

      expect(draw.cover).toBeUndefined();
    }
  });

  it("gives the same answer for the same seed", () => {
    expect(findCover(room, {from: FROM, threat: THREAT, seed: 77})).toEqual(
      findCover(room, {from: FROM, threat: THREAT, seed: 77}),
    );
  });

  it("moves the seed on, so the next look is a different one", () => {
    expect(findCover(room, {from: FROM, threat: THREAT, seed: 77}).seed).not.toBe(77);
  });
});

describe("in a long hall", () => {
  // A long hall with a wall block in the middle that leaves only the bottom row clear. Whoever stands west of the block
  // cannot see anything hidden behind it, but the only such places are farther than the opponent will look.
  const blockRow = `#${".".repeat(19)}##${".".repeat(17)}#`;
  const longHall = arenaFrom([
    "#".repeat(40),
    blockRow,
    blockRow,
    blockRow,
    blockRow,
    `#${".".repeat(38)}#`,
    "#".repeat(40),
  ]);

  it("does not look for cover beyond its reach, though there is some farther off", () => {
    let seed = 1;
    for (let index = 0; index < 60; index++) {
      const draw = findCover(longHall, {from: {x: 12.5, y: 1.5}, threat: {x: 10.5, y: 3.5}, seed});
      seed = draw.seed;

      expect(draw.cover).toBeUndefined();
    }
  });
});

describe("in an open room with one low cover block", () => {
  // Five rows of open floor with a low cover block in the middle of the middle row: nothing else hides anyone, and a standing
  // threat sees over the block, so the one place to hide is the tile right behind it, where a crouched fighter is out of sight.
  const coverRoom = arenaFrom([
    "###########",
    "#.........#",
    "#.........#",
    "#....c....#",
    "#.........#",
    "#.........#",
    "###########",
  ]);
  const rightBehindTheBlock = {x: 4.5, y: 3.5};

  it("finds the tile right behind the block whatever the seed", () => {
    let seed = 1;
    for (let index = 0; index < 60; index++) {
      const draw = findCover(coverRoom, {from: {x: 1.5, y: 3.5}, threat: {x: 8.5, y: 3.5}, seed});
      seed = draw.seed;

      expect(draw.cover).toEqual(rightBehindTheBlock);
    }
  });

  it("does not look behind a block beyond its reach", () => {
    const longRoom = arenaFrom([
      "#".repeat(22),
      `#${".".repeat(20)}#`,
      `#${".".repeat(15)}c${".".repeat(4)}#`,
      `#${".".repeat(20)}#`,
      "#".repeat(22),
    ]);
    const from = {x: 1.5, y: 2.5};
    expect(16.5 - from.x).toBeGreaterThan(DIFFICULTY.coverReach + 1);

    let seed = 1;
    for (let index = 0; index < 60; index++) {
      const draw = findCover(longRoom, {from, threat: {x: 20.5, y: 2.5}, seed});
      seed = draw.seed;

      expect(draw.cover).toBeUndefined();
    }
  });
});
