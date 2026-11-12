import type {Arena} from "@gunsmith/engine/arena/types/Arena";
import type {Point} from "@gunsmith/engine/geometry/types/Point";
import type {Viewport} from "@src/react/components/three/arena-canvas/components/arena-scene/camera/types/Viewport";
import {zoomToFit} from "@src/react/components/three/arena-canvas/components/arena-scene/camera/ZoomToFit";

/**
 * The place in the arena, in tiles, under a pixel of the window (measured from its top-left corner). The camera keeps the
 * arena's centre in the middle of the window at `zoomToFit` pixels to the tile, and screen y grows downwards where the
 * arena's y grows north. `ArenaScene` fits the camera with the same two numbers, so the two cannot drift apart.
 */
export function arenaPointAtPixel(pixel: Point, arena: Arena, viewport: Viewport): Point {
  const pixelsPerTile = zoomToFit(arena, viewport);

  return {
    x: arena.width / 2 + (pixel.x - viewport.width / 2) / pixelsPerTile,
    y: arena.height / 2 - (pixel.y - viewport.height / 2) / pixelsPerTile,
  };
}
