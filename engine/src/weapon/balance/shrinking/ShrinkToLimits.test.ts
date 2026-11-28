import {shrinkToLimits} from "@gunsmith/engine/weapon/balance/shrinking/ShrinkToLimits";
import {statsAt} from "@gunsmith/engine/weapon/power-rating/goodness/StatsAt";
import {POWER_BUDGET} from "@gunsmith/engine/weapon/balance/limits/power-budget/PowerBudget";
import {powerRatingOf} from "@gunsmith/engine/weapon/power-rating/PowerRatingOf";
import {withinLimits} from "@gunsmith/engine/weapon/balance/limits/WithinLimits";
import type {StatNumbers} from "@gunsmith/engine/weapon/power-rating/types/StatNumbers";

const ALL_ONE: StatNumbers = {
  damage: 1,
  fireRate: 1,
  bulletSpeed: 1,
  magazineSize: 1,
  reloadSpeed: 1,
  reserve: 1,
  visionCone: 1,
  visionRange: 1,
};
// Every stat at 0.66 is a power rating of 0.66, over the 0.65 budget, and 118 damage a second, under the cap: only the budget is over.
const JUST_OVER_BUDGET: StatNumbers = {
  damage: 0.66,
  fireRate: 0.66,
  bulletSpeed: 0.66,
  magazineSize: 0.66,
  reloadSpeed: 0.66,
  reserve: 0.66,
  visionCone: 0.66,
  visionRange: 0.66,
};
const EVEN: StatNumbers = ALL_ONE;

it("hands back goodness that is already within the limits unchanged", () => {
  const modest: StatNumbers = {
    damage: 0.4,
    fireRate: 0.4,
    bulletSpeed: 0.4,
    magazineSize: 0.4,
    reloadSpeed: 0.4,
    reserve: 0.4,
    visionCone: 0.4,
    visionRange: 0.4,
  };

  expect(shrinkToLimits(modest, EVEN)).toEqual(modest);
});

it("shrinks goodness that is over the limits until it is exactly on them", () => {
  const shrunk = shrinkToLimits(ALL_ONE, EVEN);

  expect(withinLimits(statsAt(shrunk))).toBe(true);
  expect(powerRatingOf(statsAt(shrunk))).toBeCloseTo(POWER_BUDGET, 6);
});

it("shrinks every stat by the same share when every weight is the same and only the budget is over", () => {
  const shrunk = shrinkToLimits(JUST_OVER_BUDGET, EVEN);

  expect(shrunk.fireRate).toBeCloseTo(shrunk.damage, 9);
  expect(shrunk.reserve).toBeCloseTo(shrunk.damage, 9);
  expect(shrunk.damage).toBeLessThan(JUST_OVER_BUDGET.damage);
});

it("takes the budget first, so a weapon the budget alone brings inside the damage cap loses nothing more", () => {
  // Every stat at 1 is over both limits, but an even shrink to the budget (all about 0.65, 109 damage a second) is under the cap.
  const shrunk = shrinkToLimits(ALL_ONE, EVEN);

  expect(shrunk.damage).toBeCloseTo(shrunk.reserve, 9);
  expect(shrunk.fireRate).toBeCloseTo(shrunk.reserve, 9);
});

it("takes the budget from the two vision stats as it does from the rest", () => {
  const shrunk = shrinkToLimits(JUST_OVER_BUDGET, EVEN);

  expect(shrunk.visionCone).toBeLessThan(JUST_OVER_BUDGET.visionCone);
  expect(shrunk.visionRange).toBeLessThan(JUST_OVER_BUDGET.visionRange);
  expect(shrunk.visionCone).toBeCloseTo(shrunk.damage, 9);
  expect(shrunk.visionRange).toBeCloseTo(shrunk.damage, 9);
});

it("shrinks a stat with a bigger weight more", () => {
  const shrunk = shrinkToLimits(ALL_ONE, {...EVEN, damage: 3, reserve: 0.25});

  expect(shrunk.damage).toBeLessThan(shrunk.fireRate);
  expect(shrunk.reserve).toBeGreaterThan(shrunk.fireRate);
});

it("still gets inside the limits when every stat has a small weight, which needs a bigger shrink", () => {
  const favouredEverywhere: StatNumbers = {
    damage: 0.25,
    fireRate: 0.25,
    bulletSpeed: 0.25,
    magazineSize: 0.25,
    reloadSpeed: 0.25,
    reserve: 0.25,
    visionCone: 0.25,
    visionRange: 0.25,
  };

  expect(withinLimits(statsAt(shrinkToLimits(ALL_ONE, favouredEverywhere)))).toBe(true);
});

it("takes a stat to its weakest and no further when its weight is big enough to run it out", () => {
  const shrunk = shrinkToLimits(ALL_ONE, {...EVEN, damage: 1000});

  expect(shrunk.damage).toBe(0);
  expect(shrunk.fireRate).toBeGreaterThan(0);
  expect(withinLimits(statsAt(shrunk))).toBe(true);
});

it("shrinks for the damage-per-second cap when the power rating is already low enough", () => {
  const quickAndHard: StatNumbers = {
    damage: 1,
    fireRate: 0.7,
    bulletSpeed: 0,
    magazineSize: 0,
    reloadSpeed: 0,
    reserve: 0,
    visionCone: 0,
    visionRange: 0,
  };

  expect(withinLimits(statsAt(quickAndHard))).toBe(false);
  expect(powerRatingOf(statsAt(quickAndHard))).toBeLessThan(POWER_BUDGET);

  const shrunk = shrinkToLimits(quickAndHard, EVEN);

  expect(withinLimits(statsAt(shrunk))).toBe(true);
  expect(shrunk.damage).toBeLessThan(1);
});

it("takes the damage cap from damage and fire rate only, and leaves every other stat alone", () => {
  const quickAndHard: StatNumbers = {
    damage: 1,
    fireRate: 0.7,
    bulletSpeed: 0.3,
    magazineSize: 0.3,
    reloadSpeed: 0.3,
    reserve: 0.3,
    visionCone: 0.3,
    visionRange: 0.3,
  };

  const shrunk = shrinkToLimits(quickAndHard, EVEN);

  expect(shrunk.bulletSpeed).toBe(0.3);
  expect(shrunk.magazineSize).toBe(0.3);
  expect(shrunk.reloadSpeed).toBe(0.3);
  expect(shrunk.reserve).toBe(0.3);
  expect(shrunk.visionCone).toBe(0.3);
  expect(shrunk.visionRange).toBe(0.3);
  expect(shrunk.damage).toBeLessThan(1);
  expect(shrunk.fireRate).toBeLessThan(0.7);
});

it("takes the damage cap from the stat the player would sacrifice before the one they favour", () => {
  const quickAndHard: StatNumbers = {
    damage: 1,
    fireRate: 0.7,
    bulletSpeed: 0.3,
    magazineSize: 0.3,
    reloadSpeed: 0.3,
    reserve: 0.3,
    visionCone: 0.3,
    visionRange: 0.3,
  };

  const favouringDamage = shrinkToLimits(quickAndHard, {...EVEN, damage: 0.25, fireRate: 3});

  expect(favouringDamage.damage / 1).toBeGreaterThan(favouringDamage.fireRate / 0.7);
});

it("does not change the goodness it was given", () => {
  const given: StatNumbers = {...ALL_ONE};

  shrinkToLimits(given, EVEN);

  expect(given).toEqual(ALL_ONE);
});
