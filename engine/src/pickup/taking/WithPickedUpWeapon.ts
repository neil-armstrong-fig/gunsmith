import type {Player} from "@gunsmith/engine/player/types/Player";
import type {Weapon} from "@gunsmith/engine/weapon/types/Weapon";

/**
 * The fighter after taking `weapon`: it replaces the weapon in hand, whichever slot that is, and stays in hand with a full
 * magazine and its starting reserve, and a reload in progress is cancelled. The weapon it replaces is thrown away, not left on
 * the floor. The other slot, the cool-down and the health are untouched.
 */
export function withPickedUpWeapon(fighter: Player, weapon: Weapon): Player {
  const slotIndex = Math.min(fighter.equippedIndex, fighter.loadout.length);
  const loadout = [
    ...fighter.loadout.slice(0, slotIndex),
    {weapon, rounds: weapon.magazineSize, reserve: weapon.startingReserve},
    ...fighter.loadout.slice(slotIndex + 1),
  ];

  return {...fighter, loadout, equippedIndex: slotIndex, reloadRemainingSeconds: undefined};
}
