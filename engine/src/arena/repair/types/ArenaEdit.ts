import type {ArenaEditKind} from "@gunsmith/engine/arena/repair/types/ArenaEditKind";

/** One change the repair made to a drawing, and how many tiles it changed. */
export interface ArenaEdit {
  kind: ArenaEditKind;
  tiles: number;
}
