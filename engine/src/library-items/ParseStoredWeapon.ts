import {STAT_RANGES} from "@gunsmith/engine/power-rating/ranges/StatRanges";
import {withinLimits} from "@gunsmith/engine/weapon-balance/limits/WithinLimits";
import type {Weapon} from "@gunsmith/engine/weapon/types/Weapon";
import {RIFLE} from "@gunsmith/engine/weapon/weapons/Rifle";
import {z} from "zod";

/** The key every stored weapon carries: the other seat is told a weapon's key, so it is never a library id or anything the player chose. */
const STORED_WEAPON_KEY = "saved";

/**
 * A stored weapon as the weapon pipeline kept it: a name and six numbers, each inside `STAT_RANGES`, the magazine and the reserve
 * whole. Anything else in the object is dropped, so a stray field (a prompt, a vision) cannot travel with the weapon. The name's
 * length and characters were checked when it was made (`ai/`'s `WEAPON_LIMITS`); here it need only be some text.
 */
const storedWeaponSchema = z.object({
  name: z.string().trim().min(1),
  bulletDamage: z.number().min(STAT_RANGES.bulletDamage.min).max(STAT_RANGES.bulletDamage.max),
  fireIntervalSeconds: z.number().min(STAT_RANGES.fireIntervalSeconds.min).max(STAT_RANGES.fireIntervalSeconds.max),
  bulletSpeed: z.number().min(STAT_RANGES.bulletSpeed.min).max(STAT_RANGES.bulletSpeed.max),
  magazineSize: z.number().int().min(STAT_RANGES.magazineSize.min).max(STAT_RANGES.magazineSize.max),
  reloadSeconds: z.number().min(STAT_RANGES.reloadSeconds.min).max(STAT_RANGES.reloadSeconds.max),
  startingReserve: z.number().int().min(STAT_RANGES.startingReserve.min).max(STAT_RANGES.startingReserve.max),
});

/**
 * Turns a weapon read back from the library (`unknown` until here) into one the engine can equip, or `undefined` if it is not one:
 * missing or mistyped fields, a number outside its range, a magazine that is not whole, or numbers that are each in range but
 * together over the limits (`withinLimits`). The stored weapon has no vision, so it takes the rifle's (a tunable, play's to set),
 * and its identity key is `"saved"`. Never throws.
 */
export function parseStoredWeapon(value: unknown): Weapon | undefined {
  const parsed = storedWeaponSchema.safeParse(value);
  if (!parsed.success) {
    return undefined;
  }

  const {name, ...stats} = parsed.data;
  if (!withinLimits(stats)) {
    return undefined;
  }

  return {
    identity: {key: STORED_WEAPON_KEY, name},
    ...stats,
    visionDegrees: RIFLE.visionDegrees,
    visionRange: RIFLE.visionRange,
  };
}
