import {arenaFrom} from "@gunsmith/engine/arena/ArenaFrom";
import {spawnPairsOf} from "@gunsmith/engine/arena/symmetry/spawn-pairs/SpawnPairsOf";

const CORRIDOR = arenaFrom(["#######", "#.....#", "#######"]);

describe("on one level", () => {
  it("pairs each tile with the tile a half turn takes it to, the one with the lower place first, in drawing order", () => {
    expect(spawnPairsOf(CORRIDOR, 1)).toEqual([
      {first: {x: 1.5, y: 1.5}, second: {x: 5.5, y: 1.5}},
      {first: {x: 2.5, y: 1.5}, second: {x: 4.5, y: 1.5}},
    ]);
  });

  it("never pairs the centre tile with itself", () => {
    expect(spawnPairsOf(CORRIDOR, 0).map(pair => pair.first.x)).not.toContain(3.5);
  });

  it("keeps a pair exactly the minimum number of steps apart and drops one a step nearer", () => {
    expect(spawnPairsOf(CORRIDOR, 4)).toHaveLength(1);
    expect(spawnPairsOf(CORRIDOR, 5)).toEqual([]);
  });

  it("returns no pair for an arena with nowhere far enough apart", () => {
    expect(spawnPairsOf(CORRIDOR, 100)).toEqual([]);
  });

  it("leaves out a pair that has a wall at one end, though the other end is floor", () => {
    const oneWall = arenaFrom(["#####", "#...#", "#..##", "#####"]);

    const tiles = spawnPairsOf(oneWall, 1).flatMap(pair => [pair.first, pair.second]);

    expect(tiles).not.toContainEqual({x: 1.5, y: 2.5});
    expect(tiles).not.toContainEqual({x: 3.5, y: 1.5});
    expect(tiles).toContainEqual({x: 2.5, y: 1.5});
  });

  it("leaves out a pair that cannot walk to each other", () => {
    const cutOff = arenaFrom(["#######", "#..#..#", "#######"]);

    expect(spawnPairsOf(cutOff, 1)).toEqual([]);
  });

  it("leaves out a stair tile and the tile a half turn takes it to", () => {
    const platform = arenaFrom(["#######", "#.>1<.#", "#######"]);

    const tiles = spawnPairsOf(platform, 1).flatMap(pair => [pair.first.x, pair.second.x]);

    expect(tiles).not.toContain(2.5);
    expect(tiles).not.toContain(4.5);
    expect(tiles).toContain(1.5);
  });
});

describe("across levels", () => {
  // A stair on (1, 3) climbing north to a landing on (1, 4). The tile a half turn takes (1, 2) to is the stair, and the one it takes
  // (1, 1) to is the landing, a level up. Every tile can be walked to from every other, and no pair of them is a place to start.
  const STAIR_BETWEEN = arenaFrom(["###", "#1#", "#^#", "#.#", "#.#", "###"]);

  it("leaves out a pair whose second end is a stair, though the first is floor", () => {
    expect(spawnPairsOf(STAIR_BETWEEN, 1)).not.toContainEqual({first: {x: 1.5, y: 2.5}, second: {x: 1.5, y: 3.5}});
  });

  it("leaves out a pair on different levels, though a stair lets one walk between them", () => {
    expect(spawnPairsOf(STAIR_BETWEEN, 1)).not.toContainEqual({first: {x: 1.5, y: 1.5}, second: {x: 1.5, y: 4.5}});
  });

  it("leaves out a pair on different levels", () => {
    const uneven = arenaFrom(["######", "#1..2#", "######"]);

    expect(spawnPairsOf(uneven, 1).map(pair => pair.first.x)).toEqual([2.5]);
  });
});
