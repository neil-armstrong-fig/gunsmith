import {balanceWeaponDraft} from "@gunsmith/ai/pipeline/weapon/check/balance/BalanceWeaponDraft";
import type {WeaponDraft} from "@gunsmith/ai/pipeline/weapon/draft/WeaponDraft";
import {powerRatingOf} from "@gunsmith/engine/weapon/power-rating/PowerRatingOf";
import {POWER_BUDGET} from "@gunsmith/engine/weapon/balance/limits/power-budget/PowerBudget";

const RIFLE: WeaponDraft = {
  name: "Proof Rifle",
  bulletDamage: 25,
  fireIntervalSeconds: 0.2,
  bulletSpeed: 20,
  magazineSize: 12,
  reloadSeconds: 1.5,
  startingReserve: 36,
  visionDegrees: 90,
  visionRange: 12,
};

const MAXIMUM: WeaponDraft = {
  name: "Everything",
  bulletDamage: 100,
  fireIntervalSeconds: 0.05,
  bulletSpeed: 60,
  magazineSize: 60,
  reloadSeconds: 0.5,
  startingReserve: 200,
  visionDegrees: 130,
  visionRange: 20,
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

it("brings a stat past its range to the end of the range, then balances: a magazine of 100 against 60 comes back as 60", () => {
  const balanced = balanceWeaponDraft({...RIFLE, magazineSize: 100}, NO_PREFERENCE);

  expect(balanced).toEqual({...RIFLE, magazineSize: 60});
});

it("brings a stat that is too weak up to the floor, so a weapon that deals 0 damage deals 1", () => {
  expect(balanceWeaponDraft({...RIFLE, bulletDamage: 0}, NO_PREFERENCE)).toEqual({...RIFLE, bulletDamage: 1});
});

it("follows a preference for vision: a favoured range ends longer and a sacrificed cone narrower than with no preference", () => {
  const neutral = balanceWeaponDraft(MAXIMUM, NO_PREFERENCE);
  const favouring = balanceWeaponDraft(MAXIMUM, {favoured: ["visionRange"], sacrificed: []});
  const sacrificing = balanceWeaponDraft(MAXIMUM, {favoured: [], sacrificed: ["visionCone"]});

  expect(favouring.visionRange).toBeGreaterThan(neutral.visionRange);
  expect(sacrificing.visionDegrees).toBeLessThan(neutral.visionDegrees);
});

it("brings a vision past its range back to the end of it, as it does every stat", () => {
  const balanced = balanceWeaponDraft({...RIFLE, visionDegrees: 400, visionRange: 90}, NO_PREFERENCE);

  expect(balanced.visionDegrees).toBe(130);
  expect(balanced.visionRange).toBe(20);
});
