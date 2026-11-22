import type {ArenaEdit} from "@gunsmith/engine/arena-repair/types/ArenaEdit";

/** A drawing after the repair, and what was done to it, in the order it was done. No edits means the drawing was left as it was. */
export interface ArenaRepair {
  rows: string[];
  edits: ArenaEdit[];
}
