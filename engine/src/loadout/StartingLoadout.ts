import type {CarriedWeapon} from "@gunsmith/engine/loadout/types/CarriedWeapon";
import {MARKSMAN_RIFLE} from "@gunsmith/engine/weapon/weapons/MarksmanRifle";
import {RIFLE} from "@gunsmith/engine/weapon/weapons/Rifle";

/** What a player carries at the start of a match: the rifle in slot 1 and the marksman rifle in slot 2, both full. */
export const STARTING_LOADOUT: readonly CarriedWeapon[] = [RIFLE, MARKSMAN_RIFLE].map(weapon => ({
  weapon,
  rounds: weapon.magazineSize,
  reserve: weapon.startingReserve,
}));
