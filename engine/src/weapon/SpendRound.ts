import type {Player} from "@gunsmith/engine/player/types/Player";
import {equippedWeapon} from "@gunsmith/engine/loadout/EquippedWeapon";
import {withEquippedWeapon} from "@gunsmith/engine/loadout/WithEquippedWeapon";

/** The player after a shot: one round gone from the magazine of the weapon they are holding. */
export function spendRound(player: Player): Player {
  const carried = equippedWeapon(player);

  return withEquippedWeapon(player, {...carried, rounds: carried.rounds - 1});
}
