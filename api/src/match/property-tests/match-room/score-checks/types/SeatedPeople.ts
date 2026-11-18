import type {Seat} from "@gunsmith/engine/seat/types/Seat";
import type {MatchRoom} from "@src/match/room/MatchRoom";

/** A room and the token each of its seats was given, so a person who left can come back. */
export interface SeatedPeople {
  room: MatchRoom;
  tokens: Record<Seat, string>;
}
