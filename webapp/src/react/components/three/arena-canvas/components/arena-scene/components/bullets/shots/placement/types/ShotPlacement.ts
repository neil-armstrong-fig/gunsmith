/** Where a shot's flat picture goes: where its centre is in the arena's tiles, and how far it is turned from facing east, in radians (anticlockwise, as the arena's `y` grows north). */
export interface ShotPlacement {
  x: number;
  y: number;
  angle: number;
}
