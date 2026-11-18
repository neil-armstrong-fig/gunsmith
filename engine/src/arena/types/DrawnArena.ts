import type {TileStair} from "@gunsmith/engine/arena/types/TileStair";

/** An arena while it is being read off its drawing, when its lists are still being filled in. */
export interface DrawnArena {
  width: number;
  height: number;
  solid: boolean[];
  cover: boolean[];
  levels: number[];
  stairs: TileStair[];
}
