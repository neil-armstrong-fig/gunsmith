/** A target the player's bullet hit, to be marked where it stood: its place in tiles and a number that rises with every mark, so the screen can tell a new one from one it has seen. */
export interface HitMark {
  sequence: number;
  x: number;
  y: number;
}
