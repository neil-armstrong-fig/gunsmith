import type {WeaponsOfSeat} from "@src/online/types/pre-round/WeaponsOfSeat";

/** What the server lets a seat know of the other while choosing: flags, their arena's name once both are locked in, and their weapons step (the pair only once both seats have locked in their weapons). */
export interface OpponentPreRound {
  locked: boolean;
  picked: boolean;
  arena?: string;
  weapons: WeaponsOfSeat;
}
