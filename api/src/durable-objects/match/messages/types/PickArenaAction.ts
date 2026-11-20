import type {SeatPick} from "@src/durable-objects/match/pre-round/types/SeatPick";

/** A seat picks one of the two arenas shown, random, or nothing. */
export interface PickArenaAction {
  kind: "pickArena";
  pick: SeatPick;
}
