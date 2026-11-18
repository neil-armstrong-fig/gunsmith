import {equippedWeapon} from "@gunsmith/engine/loadout/EquippedWeapon";
import type {Weapon} from "@gunsmith/engine/weapon/types/Weapon";
import type {AmmoReadout} from "@src/store/game/selectors/select-ammo-readout/types/AmmoReadout";
import type {GameStore} from "@src/store/game/types/GameStore";

/**
 * The ammunition display's view of the weapon in hand. It returns a new object each call, so a component uses it as
 * `useGameStore(useShallow(selectAmmoReadout))` and renders only when one of these values changes: a few times a
 * second at most, though the world is replaced every frame.
 */
export function selectAmmoReadout(state: GameStore): AmmoReadout {
  const {player} = state.world;
  const carried = equippedWeapon(player);
  const first = player.loadout[0]?.weapon;
  const second = player.loadout[1]?.weapon;

  return {
    slot: player.equippedIndex + 1,
    selectedName: weaponName(carried.weapon),
    firstName: first && weaponName(first),
    firstIconKey: first?.identity?.key,
    secondName: second && weaponName(second),
    secondIconKey: second?.identity?.key,
    rounds: carried.rounds,
    reserve: carried.reserve,
    magazineSize: carried.weapon.magazineSize,
    reloading: player.reloadRemainingSeconds !== undefined,
    reloadSeconds: carried.weapon.reloadSeconds,
  };
}

function weaponName(weapon: Weapon): string {
  return weapon.identity?.name ?? "Weapon";
}
