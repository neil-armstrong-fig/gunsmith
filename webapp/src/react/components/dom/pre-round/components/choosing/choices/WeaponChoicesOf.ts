import {MARKSMAN_RIFLE} from "@gunsmith/engine/weapon/weapons/MarksmanRifle";
import {RIFLE} from "@gunsmith/engine/weapon/weapons/Rifle";
import {SUBMACHINE_GUN} from "@gunsmith/engine/weapon/weapons/SubmachineGun";
import type {WeaponChoice} from "@src/react/components/dom/pre-round/components/choosing/choices/types/WeaponChoice";
import type {ShelfWeapon} from "@src/store/shelf/types/ShelfWeapon";

const BUILT_IN_CHOICES: readonly WeaponChoice[] = [RIFLE, MARKSMAN_RIFLE, SUBMACHINE_GUN].map(weapon => ({
  id: weapon.identity?.key ?? "",
  weapon,
}));

/** What a player may take into the match for a slot: the built-in weapons, then every weapon on the shelf in the order it was saved. */
export function weaponChoicesOf(saved: readonly ShelfWeapon[]): WeaponChoice[] {
  return [...BUILT_IN_CHOICES, ...saved.map(item => ({id: item.id, weapon: item.weapon}))];
}
