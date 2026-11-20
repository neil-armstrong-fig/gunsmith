import type {SeatPick} from "@src/durable-objects/match/pre-round/types/SeatPick";
import type {WeaponsOfSeat} from "@src/durable-objects/match/pre-round/types/WeaponsOfSeat";

/** What the pre-round holds for one seat: the built-in arena's name it has put forward (once it has chosen), whether that is locked in, its pick, and its weapons step. */
export interface PreRoundSeat {
  arena?: string;
  locked: boolean;
  pick?: SeatPick;
  weapons: WeaponsOfSeat;
}
