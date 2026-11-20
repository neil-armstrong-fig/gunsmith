import type {SeatPick} from "@src/durable-objects/match/pre-round/types/SeatPick";

/** What the pre-round holds for one seat: the built-in arena's name it has put forward (once it has chosen), whether it is locked in, and its pick. */
export interface PreRoundSeat {
  arena?: string;
  locked: boolean;
  pick?: SeatPick;
}
