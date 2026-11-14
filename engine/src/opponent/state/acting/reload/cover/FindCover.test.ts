import {arenaFrom} from "@gunsmith/engine/arena/ArenaFrom";
import {findCover} from "@gunsmith/engine/opponent/state/acting/reload/cover/FindCover";
import {DIFFICULTY} from "@gunsmith/engine/opponent/Difficulty";
import {hasClearLine} from "@gunsmith/engine/opponent/sight/HasClearLine";

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

it("finds a place out of the threat's sight that can be walked to, within reach", () => {
  let found = 0;
  let seed = 1;
  for (let index = 0; index < 60; index++) {
    const draw = findCover(room, {from: FROM, threat: THREAT, seed});
    seed = draw.seed;
    if (draw.cover) {
      found++;
      expect(hasClearLine(room, THREAT, draw.cover)).toBe(false);
      expect(hasClearLine(room, FROM, draw.cover)).toBe(true);
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
