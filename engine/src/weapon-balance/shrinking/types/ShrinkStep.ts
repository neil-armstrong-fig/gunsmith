import type {GoodnessTest} from "@gunsmith/engine/weapon-balance/shrinking/types/GoodnessTest";
import type {StatName} from "@gunsmith/engine/power-rating/types/StatName";

/** One limit to trim to: the stats that may be taken from to reach it, and the test that says it has been reached. */
export interface ShrinkStep {
  stats: readonly StatName[];
  reached: GoodnessTest;
}
