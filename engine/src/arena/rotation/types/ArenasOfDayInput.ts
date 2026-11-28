import type {ArenaPlays} from "@gunsmith/engine/arena/rotation/types/ArenaPlays";

/** What the day's set of arenas is worked out from. */
export interface ArenasOfDayInput {
  /** The day the set is for, as a whole number of days since 1 January 1970 UTC. */
  day: number;
  /** Every arena that may be offered, in the order they are listed: a tie goes to the earlier one. */
  arenas: readonly string[];
  /** What has been played, per arena and day. Plays on `day` or later are never counted, so the set holds all day. */
  plays: readonly ArenaPlays[];
}
