import type {ArenaView} from "@src/durable-objects/match/pre-round/types/ArenaView";
import type {SeatPick} from "@src/durable-objects/match/pre-round/types/SeatPick";
import type {WeaponsOfSeat} from "@src/durable-objects/match/pre-round/types/WeaponsOfSeat";

/** What a seat is told about itself: the arena it has in mind (or `undefined`), whether it is locked in, its pick once picking, and its weapons step. */
export interface OwnPreRound {
  arena?: ArenaView;
  locked: boolean;
  pick?: SeatPick;
  weapons: WeaponsOfSeat;
}
