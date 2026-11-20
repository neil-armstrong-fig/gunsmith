import type {WeaponKeys} from "@src/durable-objects/match/pre-round/types/WeaponKeys";

/** The weapons step for one seat: the pair it has put forward (once it has, or once it is locked in) and whether it is locked in. */
export interface WeaponsOfSeat {
  keys?: WeaponKeys;
  locked: boolean;
}
