import type {Point} from "@gunsmith/engine/geometry/types/Point";

/** What `shakeOfCamera` is asked: where the camera looks when still, where it is, and how many pixels a tile is. */
export interface ReadingRequest {
  /** The arena's centre, in tiles. */
  centre: Point;
  /** Where the camera is now, in tiles. */
  position: Point;
  /** Pixels to the tile, as the camera is zoomed. */
  zoom: number;
}
