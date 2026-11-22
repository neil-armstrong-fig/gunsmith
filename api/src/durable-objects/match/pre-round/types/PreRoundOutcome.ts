import type {Seat} from "@gunsmith/engine/seat/types/Seat";
import type {ArenaOutcome} from "@src/durable-objects/match/pre-round/types/ArenaOutcome";
import type {ChosenWeapons} from "@src/durable-objects/match/pre-round/types/ChosenWeapons";
import type {WeaponPair} from "@src/durable-objects/match/pre-round/types/WeaponPair";

/** What the pre-round decided, once it has: the arena the match is played in, how it was settled, and the weapons each seat carries (and what each put forward, for the reveal). */
export interface PreRoundOutcome extends ArenaOutcome {
  weapons: Record<Seat, WeaponPair>;
  chosen: Record<Seat, ChosenWeapons>;
}
