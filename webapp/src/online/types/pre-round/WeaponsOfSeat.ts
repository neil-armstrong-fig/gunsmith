import type {WeaponSlotView} from "@src/online/types/pre-round/WeaponSlotView";

/**
 * The weapons step for a seat, as the server says it, slot 1 then slot 2. This seat's own weapon shows as soon as it is put forward; the other
 * seat's weapon in a slot only once **both** have locked in that slot, so the other's first weapon appears when this seat has locked in its own.
 */
export interface WeaponsOfSeat {
  slots: readonly [WeaponSlotView, WeaponSlotView];
}
