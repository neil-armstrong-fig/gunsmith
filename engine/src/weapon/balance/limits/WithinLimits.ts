import {withinDamageCap} from "@gunsmith/engine/weapon/balance/limits/WithinDamageCap";
import {withinPowerBudget} from "@gunsmith/engine/weapon/balance/limits/WithinPowerBudget";
import type {WeaponStats} from "@gunsmith/engine/weapon/power-rating/types/WeaponStats";

/** Whether a weapon is inside both limits: the power budget, and the most damage it may deal in a second. */
export function withinLimits(stats: WeaponStats): boolean {
  return withinPowerBudget(stats) && withinDamageCap(stats);
}
