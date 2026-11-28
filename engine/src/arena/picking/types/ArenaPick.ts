import type {ArenaChoice} from "@gunsmith/engine/arena/picking/types/ArenaChoice";

/** One player's answer when both arenas are shown to them. */
export interface ArenaPick {
  playerId: string;
  choice: ArenaChoice;
}
