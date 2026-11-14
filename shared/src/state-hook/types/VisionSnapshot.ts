/** How far and how wide the player sees in detail right now: the cone the equipped weapon sets, following the aim. */
export interface VisionSnapshot {
  /** The cone's whole width, in degrees. */
  degrees: number;
  /** How far the cone reaches, in tiles. */
  range: number;
}
