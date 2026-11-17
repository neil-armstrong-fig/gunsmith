/** Where a bullet in flight is, in tiles, whose it is and which way it flies. `x` grows to the east and `y` to the north. */
export interface BulletSnapshot {
  x: number;
  y: number;
  /** Whose bullet it is: it hurts the other side. */
  shooter: "player" | "opponent";
  /** The way it flies, in degrees: 0 is east, 90 is north, and it runs from -180 to 180, as `player.aimDegrees` does. */
  directionDegrees: number;
}
