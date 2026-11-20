import type {Weapon} from "@gunsmith/engine/weapon/types/Weapon";
import {MARKSMAN_RIFLE} from "@gunsmith/engine/weapon/weapons/MarksmanRifle";
import {RIFLE} from "@gunsmith/engine/weapon/weapons/Rifle";
import {SUBMACHINE_GUN} from "@gunsmith/engine/weapon/weapons/SubmachineGun";

// Stands in for the engine's `BUILT_IN_WEAPONS` (asked for in HANDOFF, beside `BUILT_IN_ARENAS`): replace this list with it when it lands.
const BUILT_IN_WEAPONS: readonly Weapon[] = [RIFLE, MARKSMAN_RIFLE, SUBMACHINE_GUN];

/** The built-in weapon with this key, or `undefined` for anything else. */
export function builtInWeaponKeyed(key: string): Weapon | undefined {
  return BUILT_IN_WEAPONS.find(weapon => weapon.identity?.key === key);
}
