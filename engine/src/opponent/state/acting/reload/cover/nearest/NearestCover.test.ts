import {arenaFrom} from "@gunsmith/engine/arena/ArenaFrom";
import {hasClearLine} from "@gunsmith/engine/vision/HasClearLine";
import {nearestCover} from "@gunsmith/engine/opponent/state/acting/reload/cover/nearest/NearestCover";

// A wall block stands in the middle of the room, tiles x 6 to 7 and y 2 to 6, with a clear row of floor above and below it.
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
const FROM = {x: 3.5, y: 4.5};
const THREAT = {x: 10.5, y: 4.5};

it("takes a place the threat cannot see", () => {
  const cover = nearestCover(room, {from: FROM, threat: THREAT, candidates: [{x: 4.5, y: 4.5}]});

  expect(cover).toEqual({x: 4.5, y: 4.5});
});

it("passes over places the threat can see", () => {
  const candidates = [
    {x: 9.5, y: 4.5},
    {x: 9.5, y: 1.5},
  ];
  expect(candidates.every(point => hasClearLine(room, THREAT, point))).toBe(true);

  expect(nearestCover(room, {from: FROM, threat: THREAT, candidates})).toBeUndefined();
});

it("passes over a place the threat cannot see but that cannot be walked to in a straight line", () => {
  const threat = {x: 3.5, y: 1.5};
  const behindTheBlock = {x: 10.5, y: 4.5};
  expect(hasClearLine(room, threat, behindTheBlock)).toBe(false);

  expect(nearestCover(room, {from: FROM, threat, candidates: [behindTheBlock]})).toBeUndefined();
});

it("chooses the nearest of several places that qualify", () => {
  const cover = nearestCover(room, {
    from: FROM,
    threat: THREAT,
    candidates: [
      {x: 1.5, y: 4.5},
      {x: 2.5, y: 4.5},
      {x: 4.5, y: 3.5},
    ],
  });

  expect(cover).toEqual({x: 2.5, y: 4.5});
});

it("takes the first of two equally near places", () => {
  const cover = nearestCover(room, {
    from: FROM,
    threat: THREAT,
    candidates: [
      {x: 4.5, y: 3.5},
      {x: 4.5, y: 5.5},
    ],
  });

  expect(cover).toEqual({x: 4.5, y: 3.5});
});

it("finds nothing among no candidates", () => {
  expect(nearestCover(room, {from: FROM, threat: THREAT, candidates: []})).toBeUndefined();
});
