/** How long a room waits for a player, in seconds, when a spec wants it shorter than the real thing (30 and 60). A limit left out is the room's own. */
export interface RoomLimits {
  /** How long a player who has left has to come back before the round is forfeited. */
  reconnectSeconds?: number;
  /** How long a player who is still there may ask for nothing new before the round is forfeited. */
  idleSeconds?: number;
}
