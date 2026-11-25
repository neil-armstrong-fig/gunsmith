import type {WeaponSlotView} from "@src/durable-objects/match/pre-round/types/WeaponSlotView";

/**
 * The weapons step as a seat is told it, slot 1 then slot 2. A seat's own weapon shows as soon as it is put forward. The other seat's
 * weapon in a slot shows only once **both** seats have locked in that slot, so a seat sees the other's first weapon once it has locked in
 * its own, before it chooses its second.
 */
export interface WeaponsOfSeat {
  slots: readonly [WeaponSlotView, WeaponSlotView];
}
