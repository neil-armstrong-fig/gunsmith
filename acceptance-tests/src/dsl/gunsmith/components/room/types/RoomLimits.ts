/** How long a room waits for a player, in seconds, when a spec wants it shorter than the real thing (30 and 60). A limit left out is the room's own; the time to choose is none. */
export interface RoomLimits {
  /** How long a player who has left has to come back before the round is forfeited. */
  reconnectSeconds?: number;
  /** How long a player who is still there may ask for nothing new before the round is forfeited. */
  idleSeconds?: number;
  /** How long the two players have to choose their arena once both have sat, before the match begins on the defaults. None (0) unless the spec is about choosing. */
  preRoundSeconds?: number;
  /** How long the decided arena and both players' weapons are shown before the match begins, unless both ask to begin sooner. None (0) unless the spec is about the reveal. */
  revealSeconds?: number;
  /** How long the round is fought before the ring starts to close. None given: the room's real ring (45 s), which a spec that does not mention the ring never meets. */
  ringDelaySeconds?: number;
  /** How long the ring then takes to close. None given: the real 30 s. */
  ringClosingSeconds?: number;
  /** The seed the room's rounds start from, where a spec needs to know the places. None given: 21, the duel's top-row and bottom-row pair in sight of each other. */
  startSeed?: number;
  /** Whether the room offers only the day's five built-in arenas, as a real room does. None given: every built-in, so a room with no time to choose is on the Duel whatever the date, and its match counts no plays. */
  daysArenas?: boolean;
}
