import type {WeaponKeys} from "@src/online/types/pre-round/WeaponKeys";

/** The weapons step for a seat, as the server says it: the pair put forward (the other seat's only once both are locked in) and whether it is locked in. */
export interface WeaponsOfSeat {
  keys?: WeaponKeys;
  locked: boolean;
}
