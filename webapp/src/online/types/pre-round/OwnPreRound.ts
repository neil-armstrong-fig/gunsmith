import type {SeatPick} from "@src/online/types/pre-round/SeatPick";

/** What the server tells a seat about itself while choosing: the arena it has in mind, whether it is locked in, and its pick. */
export interface OwnPreRound {
  arena?: string;
  locked: boolean;
  pick?: SeatPick;
}
