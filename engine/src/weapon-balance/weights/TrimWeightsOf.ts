import {TRIM_WEIGHTS} from "@gunsmith/engine/weapon-balance/weights/TrimWeights";
import type {StatName} from "@gunsmith/engine/power-rating/types/StatName";
import type {StatNumbers} from "@gunsmith/engine/power-rating/types/StatNumbers";
import type {StatPreference} from "@gunsmith/engine/weapon-balance/types/StatPreference";

/** How hard to trim each stat, given what the player wants. A stat they both favour and would sacrifice counts as neither. */
export function trimWeightsOf(preference: StatPreference): StatNumbers {
  return {
    damage: weightOf("damage", preference),
    fireRate: weightOf("fireRate", preference),
    bulletSpeed: weightOf("bulletSpeed", preference),
    magazineSize: weightOf("magazineSize", preference),
    reloadSpeed: weightOf("reloadSpeed", preference),
    reserve: weightOf("reserve", preference),
    visionCone: weightOf("visionCone", preference),
    visionRange: weightOf("visionRange", preference),
  };
}

function weightOf(stat: StatName, preference: StatPreference): number {
  const favoured = preference.favoured.includes(stat);
  const sacrificed = preference.sacrificed.includes(stat);
  if (favoured === sacrificed) {
    return TRIM_WEIGHTS.neutral;
  }

  if (favoured) {
    return TRIM_WEIGHTS.favoured;
  }

  return TRIM_WEIGHTS.sacrificed;
}
