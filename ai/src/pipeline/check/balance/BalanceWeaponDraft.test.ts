import {balanceWeaponDraft} from "@gunsmith/ai/pipeline/check/balance/BalanceWeaponDraft";
import type {WeaponDraft} from "@gunsmith/ai/pipeline/weapon/WeaponDraft";
import {powerRatingOf} from "@gunsmith/engine/power-rating/PowerRatingOf";
import {POWER_BUDGET} from "@gunsmith/engine/weapon-balance/limits/power-budget/PowerBudget";

const RIFLE: WeaponDraft = {
  name: "Proof Rifle",
  bulletDamage: 25,
  fireIntervalSeconds: 0.2,
  bulletSpeed: 20,
  magazineSize: 12,
  reloadSeconds: 1.5,
  startingReserve: 36,
};

const MAXIMUM: WeaponDraft = {
  name: "Everything",
  bulletDamage: 100,
  fireIntervalSeconds: 0.05,
  bulletSpeed: 60,
  magazineSize: 60,
  reloadSeconds: 0.5,
  startingReserve: 200,
};

const NO_PREFERENCE = {favoured: [], sacrificed: []};

it("leaves a weapon inside the limits as it is", () => {
  expect(balanceWeaponDraft(RIFLE, NO_PREFERENCE)).toEqual(RIFLE);
});

it("brings a weapon over the limits inside them, and keeps its name", () => {
  const balanced = balanceWeaponDraft(MAXIMUM, NO_PREFERENCE);

  expect(balanced.name).toBe("Everything");
  expect(powerRatingOf(balanced)).toBeLessThanOrEqual(POWER_BUDGET);
});

it("follows the preference: the favoured stat ends higher than it does with no preference", () => {
  const neutral = balanceWeaponDraft(MAXIMUM, NO_PREFERENCE);
  const favouring = balanceWeaponDraft(MAXIMUM, {favoured: ["reserve"], sacrificed: []});

  expect(favouring.startingReserve).toBeGreaterThan(neutral.startingReserve);
});

it("hands back a weapon with exactly the draft's fields, no more", () => {
  expect(Object.keys(balanceWeaponDraft(MAXIMUM, NO_PREFERENCE)).sort()).toEqual(Object.keys(MAXIMUM).sort());
});

it("does not change the weapon it was given", () => {
  const given = {...MAXIMUM};

  balanceWeaponDraft(given, NO_PREFERENCE);

  expect(given).toEqual(MAXIMUM);
});
