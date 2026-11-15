import type {StatNumbers} from "@gunsmith/engine/power-rating/types/StatNumbers";

/** A yes or no about some goodness, such as whether the weapon it describes is inside a limit. */
export type GoodnessTest = (goodness: StatNumbers) => boolean;
