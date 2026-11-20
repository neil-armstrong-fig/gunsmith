import type {World} from "@gunsmith/engine/game-loop/types/World";
import type {CarriedWeapon} from "@gunsmith/engine/loadout/types/CarriedWeapon";
import type {Seat} from "@gunsmith/engine/seat/types/Seat";
import type {Weapon} from "@gunsmith/engine/weapon/types/Weapon";
import type {WeaponPair} from "@src/durable-objects/match/pre-round/types/WeaponPair";

/** `world` with each seat's fighter carrying the weapons it locked in, both full, the first in hand. The first seat is the world's player and the second its opponent. */
export function worldWithWeapons(world: World, weapons: Record<Seat, WeaponPair>): World {
  if (!world.opponent) {
    return {...world, player: {...world.player, loadout: loadoutOf(weapons.first), equippedIndex: 0}};
  }

  return {
    ...world,
    player: {...world.player, loadout: loadoutOf(weapons.first), equippedIndex: 0},
    opponent: {...world.opponent, loadout: loadoutOf(weapons.second), equippedIndex: 0},
  };
}

function loadoutOf(pair: WeaponPair): readonly CarriedWeapon[] {
  return [fullCarriedWeapon(pair.first), fullCarriedWeapon(pair.second)];
}

function fullCarriedWeapon(weapon: Weapon): CarriedWeapon {
  return {weapon, rounds: weapon.magazineSize, reserve: weapon.startingReserve};
}
