import type {StatName} from "@gunsmith/engine/weapon/power-rating/types/StatName";

/** One number for each stat: how good it is (0 for its weakest value, 1 for its strongest), what it is worth, how hard it is trimmed. */
export type StatNumbers = Record<StatName, number>;
