import {BUILT_IN_WEAPONS} from "@gunsmith/engine/weapon/built-in/BuiltInWeapons";
import type {WeaponChoice} from "@src/react/components/dom/pre-round/components/choosing/choices/types/WeaponChoice";
import type {ShelfWeapon} from "@src/store/shelf/types/ShelfWeapon";

const BUILT_IN_CHOICES: readonly WeaponChoice[] = BUILT_IN_WEAPONS.map(weapon => ({
  id: weapon.identity?.key ?? "",
  weapon,
}));

/** What a player may take into the match for a slot: the built-in weapons, then every weapon on the shelf in the order it was saved. */
export function weaponChoicesOf(saved: readonly ShelfWeapon[]): WeaponChoice[] {
  return [...BUILT_IN_CHOICES, ...saved.map(item => ({id: item.id, weapon: item.weapon}))];
}
