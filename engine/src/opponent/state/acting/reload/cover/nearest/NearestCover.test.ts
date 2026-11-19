import {arenaFrom} from "@gunsmith/engine/arena/ArenaFrom";
import {solidTilesOf} from "@gunsmith/engine/arena/SolidTilesOf";
import type {Point} from "@gunsmith/engine/geometry/types/Point";
import {hasClearLine} from "@gunsmith/engine/vision/sight/HasClearLine";
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

describe("on flat ground", () => {
  it("takes a place the threat cannot see", () => {
    const cover = nearestCover(room, {from: FROM, threat: THREAT, candidates: [{x: 4.5, y: 4.5}]});

    expect(cover).toEqual({x: 4.5, y: 4.5});
  });

  it("does not take a place behind a low cover block, which the threat sees over", () => {
    const lowBlock = arenaFrom([
      "##############",
      "#............#",
      "#.....cc.....#",
      "#.....cc.....#",
      "#.....cc.....#",
      "#.....cc.....#",
      "#.....cc.....#",
      "#............#",
      "##############",
    ]);
    const behindIt = {x: 4.5, y: 4.5};

    expect(nearestCover(room, {from: FROM, threat: THREAT, candidates: [behindIt]})).toEqual(behindIt);
    expect(nearestCover(lowBlock, {from: FROM, threat: THREAT, candidates: [behindIt]})).toBeUndefined();
  });

  it("passes over places the threat can see", () => {
    const candidates = [
      {x: 9.5, y: 4.5},
      {x: 9.5, y: 1.5},
    ];
    expect(candidates.every(point => hasClearLine(solidTilesOf(room), THREAT, point))).toBe(true);

    expect(nearestCover(room, {from: FROM, threat: THREAT, candidates})).toBeUndefined();
  });

  it("passes over a place the threat cannot see but that cannot be walked to in a straight line", () => {
    const threat = {x: 3.5, y: 1.5};
    const behindTheBlock = {x: 10.5, y: 4.5};
    expect(hasClearLine(solidTilesOf(room), threat, behindTheBlock)).toBe(false);

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
});

describe("across a drop", () => {
  // Low ground in the east, with a pillar (column 14, rows 2 to 4) to hide behind, and a platform in the west, one level up, reached
  // only by the stair at the top of the drop (column 9, the first row drawn). Rows run north to south as drawn, so the stair is at y 5.
  const terraced = arenaFrom([
    "####################",
    "#11111111<.........#",
    "#11111111.....#....#",
    "#11111111.....#....#",
    "#11111111.....#....#",
    "#11111111..........#",
    "####################",
  ]);
  const LOW_THREAT = {x: 17.5, y: 3.5};
  const LOW_FROM = {x: 10.5, y: 3.5};

  it("takes a platform as cover from a threat on the low ground, which cannot see up onto it", () => {
    const threat = {x: 17.5, y: 1.5};
    const platform = {x: 6.5, y: 1.5};
    expect(hasClearLine(solidTilesOf(terraced), threat, platform)).toBe(true);

    expect(nearestCover(terraced, {from: {x: 10.5, y: 1.5}, threat, candidates: [platform]})).toEqual(platform);
  });

  it("does not take the low ground as cover from a threat on a platform, which sees down over it", () => {
    const onThePlatform = {x: 2.5, y: 3.5};
    const lowGround = {x: 11.5, y: 2.5};

    expect(
      nearestCover(terraced, {from: {x: 6.5, y: 3.5}, threat: onThePlatform, candidates: [lowGround]}),
    ).toBeUndefined();
  });

  it("prefers cover it can walk to soonest over a nearer place across the drop that takes a walk round by the stair", () => {
    const acrossTheDrop = {x: 8.5, y: 3.5};
    const behindThePillar = {x: 13.5, y: 3.5};
    const crowFlies = (point: Point): number => Math.hypot(point.x - LOW_FROM.x, point.y - LOW_FROM.y);
    expect(crowFlies(acrossTheDrop)).toBeLessThan(crowFlies(behindThePillar));

    const cover = nearestCover(terraced, {
      from: LOW_FROM,
      threat: LOW_THREAT,
      candidates: [acrossTheDrop, behindThePillar],
    });

    expect(cover).toEqual(behindThePillar);
  });
});
