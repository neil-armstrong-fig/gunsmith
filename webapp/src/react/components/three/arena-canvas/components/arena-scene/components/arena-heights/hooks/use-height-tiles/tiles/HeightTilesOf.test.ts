import {arenaFrom} from "@gunsmith/engine/arena/ArenaFrom";
import {heightTilesOf} from "@src/react/components/three/arena-canvas/components/arena-scene/components/arena-heights/hooks/use-height-tiles/tiles/HeightTilesOf";

it("finds nothing in an arena of low ground and walls", () => {
  expect(heightTilesOf(arenaFrom(["###", "#.#", "###"]))).toEqual({floors: [], stairs: []});
});

it("finds each tile of raised floor with its level, south to north and west to east", () => {
  const arena = arenaFrom(["#####", "#.12#", "#.1.#", "#####"]);

  expect(heightTilesOf(arena).floors).toEqual([
    {x: 2, y: 1, level: 1},
    {x: 2, y: 2, level: 1},
    {x: 3, y: 2, level: 2},
  ]);
});

it("finds a stair with the level of its low end and the way it climbs, and does not count it as floor", () => {
  const arena = arenaFrom(["#####", "#.>1#", "#####"]);

  expect(heightTilesOf(arena).stairs).toEqual([{x: 2, y: 1, level: 0, uphill: "east"}]);
  expect(heightTilesOf(arena).floors).toEqual([{x: 3, y: 1, level: 1}]);
});

it("does not count a stair between the second and third levels as floor either", () => {
  const arena = arenaFrom(["#####", "#1>2#", "#####"]);

  expect(heightTilesOf(arena).stairs).toEqual([{x: 2, y: 1, level: 1, uphill: "east"}]);
  expect(heightTilesOf(arena).floors).toEqual([
    {x: 1, y: 1, level: 1},
    {x: 3, y: 1, level: 2},
  ]);
});
