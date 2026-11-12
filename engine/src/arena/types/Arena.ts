/** The tiles a match is played on. A tile is solid (a wall) or open floor, and `y` grows to the north. */
export interface Arena {
  width: number;
  height: number;
  /** One entry per tile, `y` rows of `width` entries, row 0 being the southernmost. */
  solid: readonly boolean[];
}
