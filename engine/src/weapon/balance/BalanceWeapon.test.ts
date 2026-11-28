import {balanceWeapon} from "@gunsmith/engine/weapon/balance/BalanceWeapon";
import {MAX_DAMAGE_PER_SECOND} from "@gunsmith/engine/weapon/balance/limits/damage-cap/MaxDamagePerSecond";
import {powerRatingOf} from "@gunsmith/engine/weapon/power-rating/PowerRatingOf";
import {POWER_BUDGET} from "@gunsmith/engine/weapon/balance/limits/power-budget/PowerBudget";
import {MARKSMAN_RIFLE_STATS} from "@gunsmith/engine/weapon/power-rating/testing/MarksmanRifleStats";
import {RIFLE_STATS} from "@gunsmith/engine/weapon/power-rating/testing/RifleStats";
import {STRONGEST_STATS} from "@gunsmith/engine/weapon/power-rating/testing/StrongestStats";
import {WEAKEST_STATS} from "@gunsmith/engine/weapon/power-rating/testing/WeakestStats";
import type {StatPreference} from "@gunsmith/engine/weapon/balance/types/StatPreference";
import type {WeaponStats} from "@gunsmith/engine/weapon/power-rating/types/WeaponStats";

const NO_PREFERENCE: StatPreference = {favoured: [], sacrificed: []};

it("leaves the rifle as it is", () => {
  expect(balanceWeapon({stats: RIFLE_STATS, preference: NO_PREFERENCE})).toEqual(RIFLE_STATS);
});

it("leaves the marksman rifle as it is", () => {
  expect(balanceWeapon({stats: MARKSMAN_RIFLE_STATS, preference: NO_PREFERENCE})).toEqual(MARKSMAN_RIFLE_STATS);
});

it("leaves a weak weapon as it is, whatever the player prefers, because it never makes one stronger", () => {
  const preference: StatPreference = {favoured: ["damage", "fireRate"], sacrificed: ["reserve"]};

  expect(balanceWeapon({stats: WEAKEST_STATS, preference})).toEqual(WEAKEST_STATS);
});

it("returns a new object even when it changes nothing, so a caller never shares the one it passed in", () => {
  const balanced = balanceWeapon({stats: RIFLE_STATS, preference: NO_PREFERENCE});

  expect(balanced).not.toBe(RIFLE_STATS);
});

it("does not change the stats it was given", () => {
  const given: WeaponStats = {...STRONGEST_STATS};

  balanceWeapon({stats: given, preference: NO_PREFERENCE});

  expect(given).toEqual(STRONGEST_STATS);
});

it("brings a weapon with everything at its maximum inside the power budget", () => {
  const balanced = balanceWeapon({stats: STRONGEST_STATS, preference: NO_PREFERENCE});

  expect(powerRatingOf(balanced)).toBeLessThanOrEqual(POWER_BUDGET);
});

it("takes something off every stat of a weapon with everything at its maximum when the player has no preference", () => {
  const balanced = balanceWeapon({stats: STRONGEST_STATS, preference: NO_PREFERENCE});

  expect(balanced.bulletDamage).toBeLessThan(STRONGEST_STATS.bulletDamage);
  expect(balanced.fireIntervalSeconds).toBeGreaterThan(STRONGEST_STATS.fireIntervalSeconds);
  expect(balanced.bulletSpeed).toBeLessThan(STRONGEST_STATS.bulletSpeed);
  expect(balanced.magazineSize).toBeLessThan(STRONGEST_STATS.magazineSize);
  expect(balanced.reloadSeconds).toBeGreaterThan(STRONGEST_STATS.reloadSeconds);
  expect(balanced.startingReserve).toBeLessThan(STRONGEST_STATS.startingReserve);
  expect(balanced.visionDegrees).toBeLessThan(STRONGEST_STATS.visionDegrees);
  expect(balanced.visionRange).toBeLessThan(STRONGEST_STATS.visionRange);
});

it("leaves a weapon with the widest and longest vision as it is when its power rating allows it", () => {
  const farSeeing: WeaponStats = {...RIFLE_STATS, visionDegrees: 130, visionRange: 20};

  expect(powerRatingOf(farSeeing)).toBeLessThan(POWER_BUDGET);
  expect(balanceWeapon({stats: farSeeing, preference: NO_PREFERENCE})).toEqual(farSeeing);
});

it("keeps a favoured vision range longer than it would be with no preference", () => {
  const neutral = balanceWeapon({stats: STRONGEST_STATS, preference: NO_PREFERENCE});
  const favouring = balanceWeapon({stats: STRONGEST_STATS, preference: {favoured: ["visionRange"], sacrificed: []}});

  expect(favouring.visionRange).toBeGreaterThan(neutral.visionRange);
});

it("narrows a sacrificed vision cone more than it would with no preference, and leaves the vision range wider", () => {
  const neutral = balanceWeapon({stats: STRONGEST_STATS, preference: NO_PREFERENCE});
  const sacrificing = balanceWeapon({stats: STRONGEST_STATS, preference: {favoured: [], sacrificed: ["visionCone"]}});

  expect(sacrificing.visionDegrees).toBeLessThan(neutral.visionDegrees);
  expect(sacrificing.visionRange).toBeGreaterThan(neutral.visionRange);
});

it("makes sight cost something: a weapon that gives up its vision keeps more damage than one that wants all of it", () => {
  const nearSighted: WeaponStats = {...STRONGEST_STATS, visionDegrees: 50, visionRange: 6};
  const farSighted = balanceWeapon({stats: STRONGEST_STATS, preference: NO_PREFERENCE});

  expect(balanceWeapon({stats: nearSighted, preference: NO_PREFERENCE}).bulletDamage).toBeGreaterThan(
    farSighted.bulletDamage,
  );
});

it("keeps a favoured stat higher than it would be with no preference", () => {
  const neutral = balanceWeapon({stats: STRONGEST_STATS, preference: NO_PREFERENCE});
  const favouring = balanceWeapon({stats: STRONGEST_STATS, preference: {favoured: ["damage"], sacrificed: []}});

  expect(favouring.bulletDamage).toBeGreaterThan(neutral.bulletDamage);
});

it("costs a sacrificed stat more than it would with no preference", () => {
  const neutral = balanceWeapon({stats: STRONGEST_STATS, preference: NO_PREFERENCE});
  const sacrificing = balanceWeapon({stats: STRONGEST_STATS, preference: {favoured: [], sacrificed: ["magazineSize"]}});

  expect(sacrificing.magazineSize).toBeLessThan(neutral.magazineSize);
});

it("pays for a favoured stat with the others, so the weapon is no stronger overall", () => {
  const favouring = balanceWeapon({stats: STRONGEST_STATS, preference: {favoured: ["damage"], sacrificed: []}});

  expect(powerRatingOf(favouring)).toBeLessThanOrEqual(POWER_BUDGET);
  expect(favouring.bulletSpeed).toBeLessThan(STRONGEST_STATS.bulletSpeed);
});

it("treats a stat that is both favoured and sacrificed as if the player had said nothing about it", () => {
  const overlapping = balanceWeapon({
    stats: STRONGEST_STATS,
    preference: {favoured: ["damage"], sacrificed: ["damage"]},
  });

  expect(overlapping).toEqual(balanceWeapon({stats: STRONGEST_STATS, preference: NO_PREFERENCE}));
});

it("trims a weapon for the damage-per-second cap even when its power rating is low", () => {
  const quickAndHard: WeaponStats = {...WEAKEST_STATS, bulletDamage: 100, fireIntervalSeconds: 0.2};

  expect(powerRatingOf(quickAndHard)).toBeLessThan(POWER_BUDGET);

  const balanced = balanceWeapon({stats: quickAndHard, preference: NO_PREFERENCE});

  expect(balanced.bulletDamage / balanced.fireIntervalSeconds).toBeLessThanOrEqual(MAX_DAMAGE_PER_SECOND);
});

it("gives a favoured stat the cost of the cap last: favoured damage keeps more of it than favoured fire rate does", () => {
  const quickAndHard: WeaponStats = {...WEAKEST_STATS, bulletDamage: 100, fireIntervalSeconds: 0.2};
  const favouringDamage = balanceWeapon({stats: quickAndHard, preference: {favoured: ["damage"], sacrificed: []}});
  const favouringFireRate = balanceWeapon({stats: quickAndHard, preference: {favoured: ["fireRate"], sacrificed: []}});

  expect(favouringDamage.bulletDamage).toBeGreaterThan(favouringFireRate.bulletDamage);
  expect(favouringDamage.fireIntervalSeconds).toBeGreaterThan(favouringFireRate.fireIntervalSeconds);
});

it("still brings a weapon inside the limits when the player favours every stat", () => {
  const everything: StatPreference = {
    favoured: [
      "damage",
      "fireRate",
      "bulletSpeed",
      "magazineSize",
      "reloadSpeed",
      "reserve",
      "visionCone",
      "visionRange",
    ],
    sacrificed: [],
  };

  expect(powerRatingOf(balanceWeapon({stats: STRONGEST_STATS, preference: everything}))).toBeLessThanOrEqual(
    POWER_BUDGET,
  );
});

it("keeps the magazine and the reserve as whole rounds", () => {
  const balanced = balanceWeapon({stats: STRONGEST_STATS, preference: NO_PREFERENCE});

  expect(Number.isInteger(balanced.magazineSize)).toBe(true);
  expect(Number.isInteger(balanced.startingReserve)).toBe(true);
});

it("gives the same weapon for the same request every time", () => {
  const request = {
    stats: STRONGEST_STATS,
    preference: {favoured: ["reserve" as const], sacrificed: ["damage" as const]},
  };

  expect(balanceWeapon(request)).toEqual(balanceWeapon(request));
});
