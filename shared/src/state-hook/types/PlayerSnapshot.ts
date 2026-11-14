/** Where the player's centre is, in tiles, and which way they face. `x` grows to the east and `y` to the north. */
export interface PlayerSnapshot {
  x: number;
  y: number;
  /** The way the player faces, in degrees: 0 is east, 90 is north, and it runs from -180 to 180. */
  aimDegrees: number;
  /** Which level of the arena the player stands on: 0 is the low ground, and on a stair it is half way between two. */
  level: number;
  /** What is left; at zero the round is lost. */
  health: number;
}
