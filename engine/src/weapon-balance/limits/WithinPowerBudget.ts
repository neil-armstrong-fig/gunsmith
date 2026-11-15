import {POWER_BUDGET} from "@gunsmith/engine/weapon-balance/limits/power-budget/PowerBudget";
import {powerRatingOf} from "@gunsmith/engine/power-rating/PowerRatingOf";
import type {WeaponStats} from "@gunsmith/engine/power-rating/types/WeaponStats";

/** Whether a weapon's power rating is no more than the budget. */
export function withinPowerBudget(stats: WeaponStats): boolean {
  return powerRatingOf(stats) <= POWER_BUDGET;
}
