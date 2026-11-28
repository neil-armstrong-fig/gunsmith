import type {StatPreference} from "@gunsmith/engine/weapon/balance/types/StatPreference";
import type {WeaponStats} from "@gunsmith/engine/weapon/power-rating/types/WeaponStats";

/** A weapon as inferred from a request, and what the player wants from it. */
export interface BalanceRequest {
  stats: WeaponStats;
  preference: StatPreference;
}
