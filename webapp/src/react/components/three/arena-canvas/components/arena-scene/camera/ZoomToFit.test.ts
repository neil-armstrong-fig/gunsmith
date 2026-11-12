import {arenaFrom} from "@gunsmith/engine/arena/ArenaFrom";
import {zoomToFit} from "@src/react/components/three/arena-canvas/components/arena-scene/camera/ZoomToFit";

const arena = arenaFrom(["####", "#..#", "#..#", "####"]);

it("fits the arena to a wide window by its height", () => {
  expect(zoomToFit(arena, {width: 1000, height: 400})).toBe(100);
});

it("fits the arena to a tall window by its width", () => {
  expect(zoomToFit(arena, {width: 400, height: 1000})).toBe(100);
});

it("fits a wide arena to the window's width", () => {
  const wide = arenaFrom(["########", "#......#", "########"]);

  expect(zoomToFit(wide, {width: 800, height: 800})).toBe(100);
});
