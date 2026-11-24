import type {ArenaView} from "@src/online/types/pre-round/ArenaView";
import type {WeaponsOfSeat} from "@src/online/types/pre-round/WeaponsOfSeat";

/** What the server lets a seat know of the other while choosing: flags, their arena's name once both are locked in, and their weapons step (each weapon only once both seats have locked in its slot). */
export interface OpponentPreRound {
  locked: boolean;
  picked: boolean;
  arena?: ArenaView;
  weapons: WeaponsOfSeat;
  /** While the decided arena and weapons are shown: whether the other seat has asked to begin the match. */
  ready?: boolean;
}
