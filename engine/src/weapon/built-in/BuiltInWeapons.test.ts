import {BUILT_IN_WEAPONS} from "@gunsmith/engine/weapon/built-in/BuiltInWeapons";
import {STAT_RANGES} from "@gunsmith/engine/weapon/power-rating/ranges/StatRanges";
import type {WeaponStats} from "@gunsmith/engine/weapon/power-rating/types/WeaponStats";
import type {Weapon} from "@gunsmith/engine/weapon/types/Weapon";

const STATS: readonly (keyof WeaponStats)[] = [
  "bulletDamage",
  "fireIntervalSeconds",
  "bulletSpeed",
  "magazineSize",
  "reloadSeconds",
  "startingReserve",
];
const KEYS = BUILT_IN_WEAPONS.map(weapon => weapon.identity?.key);

it("has the rifle, the marksman rifle and the submachine gun, in that order, because a pre-round lists them as they come", () => {
  expect(KEYS).toEqual(["rifle", "marksman-rifle", "submachine-gun"]);
});

it("names every weapon, because a player picks one by its key and reads its name", () => {
  expect(BUILT_IN_WEAPONS.filter(weapon => !weapon.identity?.key || !weapon.identity.name)).toEqual([]);
});

it("gives each weapon a key and a name of its own, because two the same would be one choice", () => {
  const names = BUILT_IN_WEAPONS.map(weapon => weapon.identity?.name);

  expect(new Set(KEYS).size).toBe(KEYS.length);
  expect(new Set(names).size).toBe(names.length);
});

it.each(KEYS)("keeps each of %s's six numbers within the stat ranges a made weapon is held to", key => {
  expect(statsOutOfRange(weaponKeyed(key))).toEqual([]);
});

function statsOutOfRange(weapon: Weapon): (keyof WeaponStats)[] {
  return STATS.filter(stat => weapon[stat] < STAT_RANGES[stat].min || weapon[stat] > STAT_RANGES[stat].max);
}

function weaponKeyed(key: string | undefined): Weapon {
  const weapon = BUILT_IN_WEAPONS.find(candidate => candidate.identity?.key === key);
  if (!weapon) {
    throw new Error(`No built-in weapon is keyed ${key}.`);
  }

  return weapon;
}
