import type {Seat} from "@gunsmith/engine/seat/types/Seat";

/** What a browser is sent once, as it takes a seat: which seat it has, and the arena's layout, which every seat knows. */
export interface JoinedMessage {
  kind: "joined";
  seat: Seat;
  arena: readonly string[];
}
