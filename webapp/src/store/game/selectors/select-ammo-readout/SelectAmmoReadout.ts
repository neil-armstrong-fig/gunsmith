import {equippedWeapon} from "@gunsmith/engine/loadout/EquippedWeapon";
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

  return {
    slot: player.equippedIndex + 1,
    rounds: carried.rounds,
    reserve: carried.reserve,
    magazineSize: carried.weapon.magazineSize,
    reloading: player.reloadRemainingSeconds !== undefined,
    reloadSeconds: carried.weapon.reloadSeconds,
  };
}
