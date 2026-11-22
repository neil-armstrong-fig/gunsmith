import type {DrawnTile} from "@gunsmith/engine/arena-repair/types/DrawnTile";

/** The open floor of a drawing in the pieces a walker can cross: the one that is the arena (the largest, the first of equals) and every other. */
export interface DrawingRegions {
  main: DrawnTile[];
  cutOff: DrawnTile[][];
}
