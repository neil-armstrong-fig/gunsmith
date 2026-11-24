import type {ChosenArena} from "@src/durable-objects/match/pre-round/types/ChosenArena";
import type {SeatPick} from "@src/durable-objects/match/pre-round/types/SeatPick";
import type {SeatWeaponsStep} from "@src/durable-objects/match/pre-round/types/SeatWeaponsStep";

/** What the pre-round holds for one seat: the arena it has put forward (once it has chosen), whether that is locked in, its pick, its weapons step and whether it has asked to begin the match. */
export interface PreRoundSeat {
  arena?: ChosenArena;
  locked: boolean;
  pick?: SeatPick;
  weapons: SeatWeaponsStep;
  /** Whether the seat has asked to begin the match while the decided arena and weapons are shown. */
  ready: boolean;
}
