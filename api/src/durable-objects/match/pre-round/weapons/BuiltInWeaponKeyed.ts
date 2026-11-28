import {BUILT_IN_WEAPONS} from "@gunsmith/engine/weapon/built-in/BuiltInWeapons";
import type {Weapon} from "@gunsmith/engine/weapon/types/Weapon";

/** The built-in weapon with this key, or `undefined` for anything else. */
export function builtInWeaponKeyed(key: string): Weapon | undefined {
  return BUILT_IN_WEAPONS.find(weapon => weapon.identity?.key === key);
}
