import type {ShrinkStep} from "@gunsmith/engine/weapon-balance/shrinking/types/ShrinkStep";

/** How far to shrink the stats of one step: `shrink` times each stat's weight is the share it gives up. */
export interface AppliedShrink {
  step: ShrinkStep;
  shrink: number;
}
