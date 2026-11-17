import type {Uphill} from "@gunsmith/engine/arena/types/Uphill";

/** What stands beside a stair's middle, for `CheckStairFlanks`' tests: a wall, or floor at a level, or another stair. Plain floor at level 0 when nothing is said. */
export interface FlankTile {
  wall?: boolean;
  level?: number;
  stair?: Uphill;
}
