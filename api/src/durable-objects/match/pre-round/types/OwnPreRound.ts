import type {SeatPick} from "@src/durable-objects/match/pre-round/types/SeatPick";

/** What a seat is told about itself: the arena it has in mind (or `undefined`), whether it is locked in, and its pick once picking. */
export interface OwnPreRound {
  arena?: string;
  locked: boolean;
  pick?: SeatPick;
}
