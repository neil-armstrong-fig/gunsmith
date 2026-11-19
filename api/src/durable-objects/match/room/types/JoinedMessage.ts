import type {Seat} from "@gunsmith/engine/seat/types/Seat";

/**
 * What a browser is sent once on every connection: which seat it has, the arena's layout, which every seat knows, and the seat's
 * token, a secret only this browser is told. It shows the token when it reconnects to get the same seat back.
 */
export interface JoinedMessage {
  kind: "joined";
  seat: Seat;
  arena: readonly string[];
  token: string;
}
