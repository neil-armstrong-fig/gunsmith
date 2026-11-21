import type {RingTiming} from "@gunsmith/engine/ring/types/RingTiming";
import type {ForfeitLimits} from "@src/durable-objects/match/room/types/ForfeitLimits";
import type {SeedMaker} from "@src/durable-objects/match/room/types/SeedMaker";

/**
 * What a room may be made to do differently. Each is what the real room uses unless given: `limits` is how long the room waits for a
 * person, `makeToken` makes the secret each seat is given as it sits down (whoever shows it later is that seat's person), `makeSeed`
 * makes the seed each round's fair start and the arena pick are drawn from, and `preRoundSeconds` is how long the two seats have to
 * choose once both have sat (none: the match begins on the defaults at once), and `ringTiming` is when each round's ring starts to
 * close and how long it takes (the engine's default unless given).
 */
export interface MatchRoomOptions {
  limits?: ForfeitLimits;
  makeToken?: () => string;
  makeSeed?: SeedMaker;
  preRoundSeconds?: number;
  ringTiming?: RingTiming;
}
