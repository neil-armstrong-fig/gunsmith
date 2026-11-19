import type {World} from "@gunsmith/engine/game-loop/types/World";
import type {CarriedWeapon} from "@gunsmith/engine/loadout/types/CarriedWeapon";
import type {Weapon} from "@gunsmith/engine/weapon/types/Weapon";

/**
 * The world with `weapon` in the player's second slot and in hand, its magazine and reserve full: what pressing Try it in the workshop does.
 * The first slot keeps its weapon, a reload in progress is ended, and everything else stands as it was, so a weapon already on trial is replaced by the next.
 */
export function worldWithWeaponOnTrial(world: World, weapon: Weapon): World {
  const carried: CarriedWeapon = {weapon, rounds: weapon.magazineSize, reserve: weapon.startingReserve};

  return {
    ...world,
    player: {
      ...world.player,
      loadout: [...world.player.loadout.slice(0, 1), carried],
      equippedIndex: 1,
      reloadRemainingSeconds: undefined,
    },
  };
}
