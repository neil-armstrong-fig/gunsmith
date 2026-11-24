import type {Weapon} from "@gunsmith/engine/weapon/types/Weapon";
import type {ChosenWeapon} from "@src/durable-objects/match/pre-round/types/ChosenWeapon";
import type {ChosenWeapons} from "@src/durable-objects/match/pre-round/types/ChosenWeapons";
import type {WeaponPair} from "@src/durable-objects/match/pre-round/types/WeaponPair";
import {builtInWeaponKeyed} from "@src/durable-objects/match/pre-round/weapons/BuiltInWeaponKeyed";
import {DEFAULT_WEAPONS} from "@src/durable-objects/match/pre-round/weapons/DefaultWeapons";

/** The two weapons a seat carries: what it chose, or the defaults if it chose none. A built-in key the room does not know (`chooseWeapons` never lets one in) is the rifle. */
export function weaponPairOf(chosen: ChosenWeapons | undefined): WeaponPair {
  const [first, second] = chosen ?? [DEFAULT_WEAPONS[1], DEFAULT_WEAPONS[2]];

  return {first: weaponOf(first), second: weaponOf(second)};
}

function weaponOf(choice: ChosenWeapon): Weapon {
  if (choice.kind === "saved") {
    return choice.weapon;
  }

  const weapon = builtInWeaponKeyed(choice.key) ?? builtInWeaponKeyed("rifle");
  if (!weapon) {
    throw new Error("The rifle is not a built-in weapon.");
  }

  return weapon;
}
