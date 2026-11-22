import type {StatRange} from "@gunsmith/engine/power-rating/types/StatRange";
import type {WeaponStats} from "@gunsmith/engine/power-rating/types/WeaponStats";

/** One range for each of a weapon's eight numbers. */
export type WeaponStatRanges = Record<keyof WeaponStats, StatRange>;
