import {POWER_BUDGET} from "@gunsmith/engine/weapon/balance/limits/power-budget/PowerBudget";
import {powerRatingOf} from "@gunsmith/engine/weapon/power-rating/PowerRatingOf";
import {MARKSMAN_RIFLE_STATS} from "@gunsmith/engine/weapon/power-rating/testing/MarksmanRifleStats";
import {withinPowerBudget} from "@gunsmith/engine/weapon/balance/limits/WithinPowerBudget";
import {RIFLE_STATS} from "@gunsmith/engine/weapon/power-rating/testing/RifleStats";
import {STRONGEST_STATS} from "@gunsmith/engine/weapon/power-rating/testing/StrongestStats";
import {WEAKEST_STATS} from "@gunsmith/engine/weapon/power-rating/testing/WeakestStats";

it("is true for the rifle and for the weakest weapon", () => {
  expect(withinPowerBudget(RIFLE_STATS)).toBe(true);
  expect(withinPowerBudget(WEAKEST_STATS)).toBe(true);
});

it("is false for the strongest weapon", () => {
  expect(withinPowerBudget(STRONGEST_STATS)).toBe(false);
});

it("does not look at the damage a second: a very quick, very hard hitter with little else is inside the budget", () => {
  expect(withinPowerBudget({...WEAKEST_STATS, bulletDamage: 100, fireIntervalSeconds: 0.2})).toBe(true);
});

it("leaves the rifle and the marksman rifle room to spare under the budget, so tuning it a little does not trip them", () => {
  expect(powerRatingOf(RIFLE_STATS)).toBeLessThan(POWER_BUDGET - 0.05);
  expect(powerRatingOf(MARKSMAN_RIFLE_STATS)).toBeLessThan(POWER_BUDGET - 0.05);
});
