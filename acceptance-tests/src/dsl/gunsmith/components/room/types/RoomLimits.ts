/** How long a room waits for a player, in seconds, when a spec wants it shorter than the real thing (30 and 60). A limit left out is the room's own; the time to choose is none. */
export interface RoomLimits {
  /** How long a player who has left has to come back before the round is forfeited. */
  reconnectSeconds?: number;
  /** How long a player who is still there may ask for nothing new before the round is forfeited. */
  idleSeconds?: number;
  /** How long the two players have to choose their arena once both have sat, before the match begins on the defaults. None (0) unless the spec is about choosing. */
  preRoundSeconds?: number;
}
