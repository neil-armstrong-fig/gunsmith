import type {SeatPick} from "@src/online/types/pre-round/SeatPick";
import type {ArenaView} from "@src/online/types/pre-round/ArenaView";
import type {WeaponsOfSeat} from "@src/online/types/pre-round/WeaponsOfSeat";

/** What the server tells a seat about itself while choosing: the arena it has in mind, whether it is locked in, its pick, its weapons step and, in the reveal, whether it has asked to begin the match. */
export interface OwnPreRound {
  arena?: ArenaView;
  locked: boolean;
  pick?: SeatPick;
  weapons: WeaponsOfSeat;
  /** While the decided arena and weapons are shown: whether this seat has asked to begin the match. */
  ready?: boolean;
}
