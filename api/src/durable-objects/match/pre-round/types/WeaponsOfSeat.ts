import type {WeaponView} from "@src/durable-objects/match/pre-round/types/WeaponView";

/** The weapons step as a seat is told it: the pair put forward (once it has, or once it is locked in) and whether it is locked in. */
export interface WeaponsOfSeat {
  choices?: readonly [WeaponView, WeaponView];
  locked: boolean;
}
