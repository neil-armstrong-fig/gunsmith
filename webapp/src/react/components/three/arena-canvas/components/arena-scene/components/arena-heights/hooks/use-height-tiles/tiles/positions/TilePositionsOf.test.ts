import {arenaFrom} from "@gunsmith/engine/arena/ArenaFrom";
import {tilePositionsOf} from "@src/react/components/three/arena-canvas/components/arena-scene/components/arena-heights/hooks/use-height-tiles/tiles/positions/TilePositionsOf";

it("lists every tile once, south to north and west to east, walls included", () => {
  expect(tilePositionsOf(arenaFrom(["###", "#.#"]))).toEqual([
    {x: 0, y: 0},
    {x: 1, y: 0},
    {x: 2, y: 0},
    {x: 0, y: 1},
    {x: 1, y: 1},
    {x: 2, y: 1},
  ]);
});

it("lists nothing for an arena with no tiles", () => {
  expect(tilePositionsOf({width: 0, height: 0, solid: [], cover: [], levels: [], stairs: []})).toEqual([]);
});
