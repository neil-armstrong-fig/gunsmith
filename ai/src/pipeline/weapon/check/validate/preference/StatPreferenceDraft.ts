import {z} from "zod";
import {STAT_NAMES} from "@gunsmith/engine/weapon/power-rating/types/StatName";

const statList = z.array(z.enum(STAT_NAMES)).max(STAT_NAMES.length).default([]);

/**
 * What the model says about where the player wants the weapon's strength to go: the stats the request wants high and the stats it
 * would give up. DRAFT, local to `ai/` like the weapon's schema. Strict, so a stray field or a stat the weapon does not have is
 * refused (and sent to `repair`) and not quietly dropped. A missing preference, or a missing list, is no preference, which the
 * balancer meets by trimming every stat evenly. A stat in both lists is accepted: the balancer counts it as neither, so nothing is
 * lost by not refusing it. The names are the engine's (`STAT_NAMES`), the one list the balancer reads.
 */
export const statPreferenceDraftSchema = z
  .object({favoured: statList, sacrificed: statList})
  .strict()
  .default({favoured: [], sacrificed: []});
