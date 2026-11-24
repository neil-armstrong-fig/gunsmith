import {parseStoredWeapon} from "@gunsmith/engine/library-items/ParseStoredWeapon";
import type {Weapon} from "@gunsmith/engine/weapon/types/Weapon";
import {appearanceToDraw} from "@src/assets/weapon-drawings/appearance-to-draw/AppearanceToDraw";
import {weaponAppearances} from "@src/assets/weapon-drawings/appearances/WeaponAppearances";

export function parseAccountWeapon(stored: unknown, appearance: unknown): Weapon | undefined {
  const weapon = parseStoredWeapon(stored);
  if (!weapon) return undefined;

  weaponAppearances.set(weapon, appearanceToDraw(appearance));
  return weapon;
}
