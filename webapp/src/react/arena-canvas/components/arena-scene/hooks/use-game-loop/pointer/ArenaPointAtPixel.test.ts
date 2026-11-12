import {arenaFrom} from "@gunsmith/engine/arena/ArenaFrom";
import {arenaPointAtPixel} from "@src/react/arena-canvas/components/arena-scene/hooks/use-game-loop/pointer/ArenaPointAtPixel";

// A 4 by 4 arena in a 400 by 400 window is drawn 100 pixels to the tile, with the arena's centre, (2, 2), at (200, 200).
const arena = arenaFrom(["####", "#..#", "#..#", "####"]);
const viewport = {width: 400, height: 400};

it("finds the arena's centre under the middle of the window", () => {
  expect(arenaPointAtPixel({x: 200, y: 200}, arena, viewport)).toEqual({x: 2, y: 2});
});

it("finds a point to the east when the mouse is to the right of the middle", () => {
  expect(arenaPointAtPixel({x: 300, y: 200}, arena, viewport)).toEqual({x: 3, y: 2});
});

it("finds a point to the north when the mouse is above the middle, because screen y grows downwards", () => {
  expect(arenaPointAtPixel({x: 200, y: 100}, arena, viewport)).toEqual({x: 2, y: 3});
});

it("finds the arena's south-west corner at the bottom left when the window is the arena's shape", () => {
  expect(arenaPointAtPixel({x: 0, y: 400}, arena, viewport)).toEqual({x: 0, y: 0});
});

it("allows for the empty space either side of an arena that is narrower than the window", () => {
  // 800 wide, 400 high: 100 pixels to the tile still, so the arena starts 200 pixels in.
  expect(arenaPointAtPixel({x: 200, y: 400}, arena, {width: 800, height: 400})).toEqual({x: 0, y: 0});
});
