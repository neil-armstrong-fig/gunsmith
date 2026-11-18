import type {TileStair} from "@gunsmith/engine/arena/types/TileStair";

/**
 * The tiles a match is played on. A tile is solid (a wall, or a low cover block) or open floor, `y` grows to the north, and
 * open floor is on one of up to three levels. A stair is the only way from one level to the next.
 */
export interface Arena {
  width: number;
  height: number;
  /** One entry per tile, `y` rows of `width` entries, row 0 being the southernmost. Cover blocks are solid: nobody walks through one. */
  solid: readonly boolean[];
  /** Which tiles are low cover blocks, in the same order: always a subset of `solid`, on the low ground. A standing fighter sees and shoots over one, a crouched one does not. */
  cover: readonly boolean[];
  /** The level of each tile, in the same order: 0 is the low ground. A stair has the level of its low end. */
  levels: readonly number[];
  /** Which way the stair on each tile climbs, in the same order, or `undefined` where the tile is not a stair. */
  stairs: readonly TileStair[];
}
