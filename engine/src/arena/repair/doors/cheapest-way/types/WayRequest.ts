import type {DrawnTile} from "@gunsmith/engine/arena/repair/types/DrawnTile";

/** Where a way is to start (any of these tiles) and where it may end (any of these). */
export interface WayRequest {
  from: readonly DrawnTile[];
  to: readonly DrawnTile[];
}
