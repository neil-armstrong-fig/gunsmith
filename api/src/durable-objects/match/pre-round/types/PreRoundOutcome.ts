import type {Seat} from "@gunsmith/engine/seat/types/Seat";
import type {ArenaOutcome} from "@src/durable-objects/match/pre-round/types/ArenaOutcome";
import type {WeaponPair} from "@src/durable-objects/match/pre-round/types/WeaponPair";

/** What the pre-round decided, once it has: the arena the match is played in, how it was settled, and the weapons each seat carries. */
export interface PreRoundOutcome extends ArenaOutcome {
  weapons: Record<Seat, WeaponPair>;
}
