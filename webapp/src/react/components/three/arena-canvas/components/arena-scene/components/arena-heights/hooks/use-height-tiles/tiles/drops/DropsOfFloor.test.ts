import {arenaFrom} from "@gunsmith/engine/arena/ArenaFrom";
import {dropsOfFloor} from "@src/react/components/three/arena-canvas/components/arena-scene/components/arena-heights/hooks/use-height-tiles/tiles/drops/DropsOfFloor";

it("gives an edge for each side the tile drops away on, in the tile's own place", () => {
  const arena = arenaFrom(["######", "#....#", "#..1.#", "#....#", "######"]);

  expect(dropsOfFloor(arena, {x: 3, y: 2, level: 1})).toEqual([
    {x: 3, y: 2, facing: "west"},
    {x: 3, y: 2, facing: "east"},
    {x: 3, y: 2, facing: "south"},
    {x: 3, y: 2, facing: "north"},
  ]);
});

it("gives none for a tile that drops nowhere", () => {
  expect(dropsOfFloor(arenaFrom(["####", "#11#", "####"]), {x: 1, y: 1, level: 1})).toEqual([]);
});
