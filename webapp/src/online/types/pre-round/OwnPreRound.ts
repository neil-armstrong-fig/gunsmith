import type {SeatPick} from "@src/online/types/pre-round/SeatPick";
import type {ArenaView} from "@src/online/types/pre-round/ArenaView";
import type {WeaponsOfSeat} from "@src/online/types/pre-round/WeaponsOfSeat";

/** What the server tells a seat about itself while choosing: the arena it has in mind, whether it is locked in, its pick, and its weapons step. */
export interface OwnPreRound {
  arena?: ArenaView;
  locked: boolean;
  pick?: SeatPick;
  weapons: WeaponsOfSeat;
}
