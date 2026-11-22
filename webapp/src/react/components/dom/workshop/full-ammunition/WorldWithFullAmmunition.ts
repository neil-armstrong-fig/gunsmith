import type {World} from "@gunsmith/engine/game-loop/types/World";
import type {CarriedWeapon} from "@gunsmith/engine/loadout/types/CarriedWeapon";

/**
 * The world with the magazine and the reserve of every weapon the player carries full again, each by its own sizes: what the workshop gives
 * for free, when it opens and when the range is reset. A reload in progress is ended, since the magazine it was filling is full. The weapon in hand
 * stays in hand and everything else stands as it was.
 */
export function worldWithFullAmmunition(world: World): World {
  return {
    ...world,
    player: {
      ...world.player,
      loadout: world.player.loadout.map(filled),
      reloadRemainingSeconds: undefined,
    },
  };
}

function filled({weapon}: CarriedWeapon): CarriedWeapon {
  return {weapon, rounds: weapon.magazineSize, reserve: weapon.startingReserve};
}
