import {arenaFrom} from "@gunsmith/engine/arena/ArenaFrom";
import {wallTilesOf} from "@src/react/components/three/arena-canvas/components/arena-scene/components/arena-walls/hooks/use-wall-tiles/tiles/WallTilesOf";

it("lists every wall tile", () => {
  expect(wallTilesOf(arenaFrom(["###", "#.#", "###"]))).toHaveLength(8);
});

it("lists none for an arena of open floor", () => {
  expect(wallTilesOf(arenaFrom(["...", "..."]))).toEqual([]);
});

it("does not list floor tiles", () => {
  const tiles = wallTilesOf(arenaFrom(["###", "#.#", "###"]));

  expect(tiles).not.toContainEqual({x: 1, y: 1});
});

it("gives each wall tile's position with y growing to the north, as the engine does", () => {
  // The wall is the top-left tile of the drawing, which is x 0 and the northernmost row, y 2.
  expect(wallTilesOf(arenaFrom(["#..", "...", "..."]))).toEqual([{x: 0, y: 2}]);
});

it("lists tiles along the whole width and height", () => {
  expect(wallTilesOf(arenaFrom([".#", "..", "#."]))).toEqual([
    {x: 0, y: 0},
    {x: 1, y: 2},
  ]);
});
