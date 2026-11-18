import {arenaFrom} from "@gunsmith/engine/arena/ArenaFrom";
import {coverTilesOf} from "@src/react/components/three/arena-canvas/components/arena-scene/components/arena-walls/hooks/use-cover-tiles/tiles/CoverTilesOf";

it("lists every low cover block, south to north and west to east within a row", () => {
  expect(coverTilesOf(arenaFrom(["c.c", "...", ".c."]))).toEqual([
    {x: 1, y: 0},
    {x: 0, y: 2},
    {x: 2, y: 2},
  ]);
});

it("does not list walls or floor", () => {
  expect(coverTilesOf(arenaFrom(["###", "#.#", "###"]))).toEqual([]);
});
