import type {Point} from "@gunsmith/engine/geometry/types/Point";

/** What `cameraPositionOf` is asked: where the camera sits when still, how far the picture is to be moved, and how many pixels a tile is. */
export interface CameraRequest {
  /** The arena's centre, in tiles: where the camera looks when nothing shakes it. */
  centre: Point;
  /** How far the picture is to move, in screen pixels (`x` to the right, `y` downwards). */
  shake: Point;
  /** Pixels to the tile, as the camera is zoomed. */
  zoom: number;
}
