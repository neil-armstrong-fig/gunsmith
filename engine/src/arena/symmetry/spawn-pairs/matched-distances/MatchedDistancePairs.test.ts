import {arenaFrom} from "@gunsmith/engine/arena/ArenaFrom";
import {matchedDistancePairs} from "@gunsmith/engine/arena/symmetry/spawn-pairs/matched-distances/MatchedDistancePairs";

// Floor from x = 1 to 6, the middle tile x = 4. Walking from it, x = 3 and 5 are one step away, 2 and 6 two, and 1 is three:
// 1 has no match, so the ends are never level.
const CORRIDOR = arenaFrom(["#########", "#......##", "#########"]);

// A platform of four tiles from x = 3 to 6 with a stair up at each end (x = 2 and 7), and ground beyond them at x = 1 and 8.
// The middle tile is x = 5, on the platform. The ground tiles are 4 and 3 steps from it, the stairs 3 and 2, the platform 2 to 0.
const PLATFORM = arenaFrom(["##########", "#.>1111<.#", "##########"]);

// The centre tile (3, 2) is a wall, so the middle is the nearest floor to it, and of the four tiles one step away, the one with
// the lowest place in the drawing (3, 1). A wall at (1, 3) keeps the arena from being the same either way up.
const WALLED_CENTRE = arenaFrom(["#######", "##....#", "#..#..#", "#.....#", "#######"]);

it("pairs the tiles that are the same walk from the middle, and drops a pair nearer than the minimum", () => {
  expect(matchedDistancePairs(CORRIDOR, 4)).toEqual([{first: {x: 2.5, y: 1.5}, second: {x: 6.5, y: 1.5}}]);
});

it("lists every pair at the best score, the one with the lower place first, in drawing order", () => {
  expect(matchedDistancePairs(CORRIDOR, 2)).toEqual([
    {first: {x: 2.5, y: 1.5}, second: {x: 6.5, y: 1.5}},
    {first: {x: 3.5, y: 1.5}, second: {x: 5.5, y: 1.5}},
  ]);
});

it("takes the pair one step out of level when no level pair is far enough apart", () => {
  expect(matchedDistancePairs(CORRIDOR, 5)).toEqual([{first: {x: 1.5, y: 1.5}, second: {x: 6.5, y: 1.5}}]);
});

it("takes the pair furthest apart when none is as far as the minimum", () => {
  expect(matchedDistancePairs(CORRIDOR, 100)).toEqual([{first: {x: 1.5, y: 1.5}, second: {x: 6.5, y: 1.5}}]);
});

it("never pairs the middle tile with itself", () => {
  const tiles = matchedDistancePairs(CORRIDOR, 0).flatMap(pair => [pair.first.x, pair.second.x]);

  expect(tiles).not.toContain(4.5);
  expect(tiles).toContain(3.5);
});

it("pairs only tiles on the same level, though a tile on the platform is as far from the middle as one on the ground", () => {
  expect(matchedDistancePairs(PLATFORM, 5)).toEqual([{first: {x: 1.5, y: 1.5}, second: {x: 8.5, y: 1.5}}]);
});

it("leaves out a stair, which nobody starts on", () => {
  // The stair at x = 2 is the same walk from the middle as the ground at x = 8, so counted it would be the nearest pair.
  const tiles = matchedDistancePairs(PLATFORM, 5).flatMap(pair => [pair.first.x, pair.second.x]);

  expect(tiles).not.toContain(2.5);
  expect(tiles).not.toContain(7.5);
});

it("measures from the nearest floor tile to a walled centre, the lowest of those equally near", () => {
  expect(matchedDistancePairs(WALLED_CENTRE, 4)).toEqual([
    {first: {x: 1.5, y: 1.5}, second: {x: 5.5, y: 1.5}},
    {first: {x: 1.5, y: 1.5}, second: {x: 4.5, y: 2.5}},
    {first: {x: 5.5, y: 1.5}, second: {x: 2.5, y: 2.5}},
    {first: {x: 1.5, y: 2.5}, second: {x: 5.5, y: 2.5}},
    {first: {x: 1.5, y: 2.5}, second: {x: 4.5, y: 3.5}},
    {first: {x: 2.5, y: 2.5}, second: {x: 4.5, y: 2.5}},
    {first: {x: 5.5, y: 2.5}, second: {x: 2.5, y: 3.5}},
  ]);
});

it("lists pairs that are not level in drawing order too", () => {
  // The middle is (3, 2); these pairs are two walks apart from it and at least four steps apart, found with an independent flood fill.
  const arena = arenaFrom(["#######", "#.#...#", "###...#", "#.#.#.#", "#######"]);
  const other = arenaFrom(["#######", "#...#.#", "#....##", "#.#####", "#######"]);

  expect(matchedDistancePairs(arena, 4)).toEqual([
    {first: {x: 3.5, y: 1.5}, second: {x: 5.5, y: 1.5}},
    {first: {x: 3.5, y: 1.5}, second: {x: 5.5, y: 3.5}},
    {first: {x: 5.5, y: 1.5}, second: {x: 3.5, y: 3.5}},
  ]);
  expect(matchedDistancePairs(other, 4)).toEqual([
    {first: {x: 1.5, y: 1.5}, second: {x: 4.5, y: 2.5}},
    {first: {x: 1.5, y: 1.5}, second: {x: 3.5, y: 3.5}},
    {first: {x: 4.5, y: 2.5}, second: {x: 1.5, y: 3.5}},
  ]);
});

it("falls back to the longest walk between two tiles on one level, not to a longer one up a stair", () => {
  // The ground tiles at x = 1 to 3 are two steps apart at most, but the platform tile at x = 5 is five steps from x = 1.
  const arena = arenaFrom(["#######", "#...>1#", "#######"]);

  expect(matchedDistancePairs(arena, 100)).toEqual([{first: {x: 1.5, y: 1.5}, second: {x: 3.5, y: 1.5}}]);
});

it("has no pair for an arena with fewer than two tiles to stand on", () => {
  expect(matchedDistancePairs(arenaFrom(["###", "#.#", "###"]), 1)).toEqual([]);
});
