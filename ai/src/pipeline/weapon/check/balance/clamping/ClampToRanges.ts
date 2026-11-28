import type {WeaponDraft} from "@gunsmith/ai/pipeline/weapon/draft/WeaponDraft";
import {STAT_RANGES} from "@gunsmith/engine/weapon/power-rating/ranges/StatRanges";
import type {StatRange} from "@gunsmith/engine/weapon/power-rating/types/StatRange";

/**
 * Brings each of the eight numbers to the end of its range when it is past it, on either side (the user's design, 2026-11-16: code clamps
 * a number the model wrote past a range, and a weapon is never useless, so one too weak comes up to the floor and one too strong goes
 * down to the cap). It is range normalisation, not balancing: how strong the weapon is overall is the engine's `balanceWeapon`, which
 * only ever takes away, and runs after this. A stat already inside its range is not touched, and so is a whole number still.
 * Returns a new weapon, with the name as it was.
 */
export function clampToRanges(weapon: WeaponDraft): WeaponDraft {
  return {
    name: weapon.name,
    bulletDamage: clamp(weapon.bulletDamage, STAT_RANGES.bulletDamage),
    fireIntervalSeconds: clamp(weapon.fireIntervalSeconds, STAT_RANGES.fireIntervalSeconds),
    bulletSpeed: clamp(weapon.bulletSpeed, STAT_RANGES.bulletSpeed),
    magazineSize: clamp(weapon.magazineSize, STAT_RANGES.magazineSize),
    reloadSeconds: clamp(weapon.reloadSeconds, STAT_RANGES.reloadSeconds),
    startingReserve: clamp(weapon.startingReserve, STAT_RANGES.startingReserve),
    visionDegrees: clamp(weapon.visionDegrees, STAT_RANGES.visionDegrees),
    visionRange: clamp(weapon.visionRange, STAT_RANGES.visionRange),
  };
}

function clamp(value: number, range: StatRange): number {
  return Math.min(Math.max(value, range.min), range.max);
}
