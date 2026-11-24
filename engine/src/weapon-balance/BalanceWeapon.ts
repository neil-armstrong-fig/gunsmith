import {roundTowardWeaker} from "@gunsmith/engine/weapon-balance/rounding/RoundTowardWeaker";
import {shrinkToLimits} from "@gunsmith/engine/weapon-balance/shrinking/ShrinkToLimits";
import {trimWeightsOf} from "@gunsmith/engine/weapon-balance/weights/TrimWeightsOf";
import {goodnessOf} from "@gunsmith/engine/power-rating/goodness/GoodnessOf";
import {statsAt} from "@gunsmith/engine/power-rating/goodness/StatsAt";
import {withinLimits} from "@gunsmith/engine/weapon-balance/limits/WithinLimits";
import type {BalanceRequest} from "@gunsmith/engine/weapon-balance/types/BalanceRequest";
import type {WeaponStats} from "@gunsmith/engine/power-rating/types/WeaponStats";

/**
 * Brings a weapon the AI inferred inside the limits (the power budget and the damage-per-second cap) by taking from its stats,
 * and where the player wants it taken from: what they favour gives up least, what they would sacrifice most, and with no
 * preference every stat gives up the same share. It never makes a stat stronger, so a weapon already inside the limits comes
 * back as it was, and a weak request stays weak. Deterministic, and the same request always gives the same weapon: the AI proposes,
 * the engine disposes. This is `powerRatingOf` run backwards.
 */
export function balanceWeapon({stats, preference}: BalanceRequest): WeaponStats {
  if (withinLimits(stats)) {
    return {
      bulletDamage: stats.bulletDamage,
      fireIntervalSeconds: stats.fireIntervalSeconds,
      bulletSpeed: stats.bulletSpeed,
      magazineSize: stats.magazineSize,
      reloadSeconds: stats.reloadSeconds,
      startingReserve: stats.startingReserve,
      visionDegrees: stats.visionDegrees,
      visionRange: stats.visionRange,
    };
  }

  const shrunk = shrinkToLimits(goodnessOf(stats), trimWeightsOf(preference));

  return roundTowardWeaker(statsAt(shrunk));
}
