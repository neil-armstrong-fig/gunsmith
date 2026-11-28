import {STAT_RANGES} from "@gunsmith/engine/weapon/power-rating/ranges/StatRanges";
import {z} from "zod";

/**
 * What a weapon read back from the browser must be: the six stats and the vision cone's width and reach within the engine's own ranges (`STAT_RANGES`, the one home of
 * them, which `ai/`'s schema is built from too), a magazine and a reserve that are whole, and an identity, when there is one, of two pieces of text. Anything else stored beside the weapon's own fields is dropped, so it cannot travel with it.
 */
export const weaponSchema = z.object({
  identity: z.object({key: z.string(), name: z.string()}).optional(),
  fireIntervalSeconds: z.number().min(STAT_RANGES.fireIntervalSeconds.min).max(STAT_RANGES.fireIntervalSeconds.max),
  bulletDamage: z.number().min(STAT_RANGES.bulletDamage.min).max(STAT_RANGES.bulletDamage.max),
  bulletSpeed: z.number().min(STAT_RANGES.bulletSpeed.min).max(STAT_RANGES.bulletSpeed.max),
  magazineSize: z.number().int().min(STAT_RANGES.magazineSize.min).max(STAT_RANGES.magazineSize.max),
  reloadSeconds: z.number().min(STAT_RANGES.reloadSeconds.min).max(STAT_RANGES.reloadSeconds.max),
  startingReserve: z.number().int().min(STAT_RANGES.startingReserve.min).max(STAT_RANGES.startingReserve.max),
  visionDegrees: z.number().min(STAT_RANGES.visionDegrees.min).max(STAT_RANGES.visionDegrees.max),
  visionRange: z.number().min(STAT_RANGES.visionRange.min).max(STAT_RANGES.visionRange.max),
});
