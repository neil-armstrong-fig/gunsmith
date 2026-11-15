import {withinLimits} from "@gunsmith/engine/weapon-balance/limits/WithinLimits";
import {MARKSMAN_RIFLE_STATS} from "@gunsmith/engine/power-rating/testing/MarksmanRifleStats";
import {RIFLE_STATS} from "@gunsmith/engine/power-rating/testing/RifleStats";
import {STRONGEST_STATS} from "@gunsmith/engine/power-rating/testing/StrongestStats";
import {WEAKEST_STATS} from "@gunsmith/engine/power-rating/testing/WeakestStats";

it("is true for the rifle and the marksman rifle", () => {
  expect(withinLimits(RIFLE_STATS)).toBe(true);
  expect(withinLimits(MARKSMAN_RIFLE_STATS)).toBe(true);
});

it("is true for the weakest weapon there can be", () => {
  expect(withinLimits(WEAKEST_STATS)).toBe(true);
});

it("is false for a weapon with every stat at its strongest, which is over the power budget", () => {
  expect(withinLimits(STRONGEST_STATS)).toBe(false);
});

it("is false for a weapon over the damage-per-second cap even when its power rating is low", () => {
  expect(withinLimits({...WEAKEST_STATS, bulletDamage: 100, fireIntervalSeconds: 0.5})).toBe(false);
});

it("is false for a weapon over the power budget even when it is well under the damage-per-second cap", () => {
  // Every stat about two thirds of the way from weakest to strongest: a rating of about 0.66 and 116 damage a second.
  const justOverBudget = {
    bulletDamage: 20.9,
    fireIntervalSeconds: 0.18,
    bulletSpeed: 41.3,
    magazineSize: 15,
    reloadSeconds: 1.1,
    startingReserve: 132,
  };

  expect(withinLimits(justOverBudget)).toBe(false);
});

it("is true for a weapon exactly on the damage-per-second cap", () => {
  expect(withinLimits({...WEAKEST_STATS, bulletDamage: 75, fireIntervalSeconds: 0.5})).toBe(true);
});
