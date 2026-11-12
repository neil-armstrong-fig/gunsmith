import type {Player} from "@gunsmith/engine/player/types/Player";
import {equippedWeapon} from "@gunsmith/engine/loadout/EquippedWeapon";
import {withEquippedWeapon} from "@gunsmith/engine/loadout/WithEquippedWeapon";

/**
 * One step of reloading the weapon in hand. A reload starts when it is asked for, the magazine is not full and the
 * reserve is not empty, with the whole reload time still to go (it starts counting down on the next step, as a shot's
 * cool-down does). A reload under way counts down by `seconds`, and asking again does not start it over. When the time
 * is used up the magazine takes what it needs from the reserve, or what the reserve has if that is less.
 */
export function reloadWeapon(player: Player, wantsReload: boolean, seconds: number): Player {
  const carried = equippedWeapon(player);
  const remaining = player.reloadRemainingSeconds;
  if (remaining === undefined) {
    if (wantsReload && carried.rounds < carried.weapon.magazineSize && carried.reserve > 0) {
      return {...player, reloadRemainingSeconds: carried.weapon.reloadSeconds};
    }

    return player;
  }

  if (remaining - seconds > 0) {
    return {...player, reloadRemainingSeconds: remaining - seconds};
  }

  const moved = Math.min(carried.weapon.magazineSize - carried.rounds, carried.reserve);
  const refilled = {...carried, rounds: carried.rounds + moved, reserve: carried.reserve - moved};

  return {...withEquippedWeapon(player, refilled), reloadRemainingSeconds: undefined};
}
