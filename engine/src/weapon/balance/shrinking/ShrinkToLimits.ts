import {statsAt} from "@gunsmith/engine/weapon/power-rating/goodness/StatsAt";
import {STAT_NAMES} from "@gunsmith/engine/weapon/power-rating/types/StatName";
import {withinDamageCap} from "@gunsmith/engine/weapon/balance/limits/WithinDamageCap";
import {withinPowerBudget} from "@gunsmith/engine/weapon/balance/limits/WithinPowerBudget";
import type {AppliedShrink} from "@gunsmith/engine/weapon/balance/shrinking/types/AppliedShrink";
import type {ShrinkStep} from "@gunsmith/engine/weapon/balance/shrinking/types/ShrinkStep";
import type {StatNumbers} from "@gunsmith/engine/weapon/power-rating/types/StatNumbers";

const BISECTIONS = 100;

/** The damage cap is only about damage and fire rate, so only they pay for it; the budget is about all six. */
const DAMAGE_CAP_STEP: ShrinkStep = {
  stats: ["damage", "fireRate"],
  reached: goodness => withinDamageCap(statsAt(goodness)),
};
const BUDGET_STEP: ShrinkStep = {stats: STAT_NAMES, reached: goodness => withinPowerBudget(statsAt(goodness))};

/**
 * The goodness a weapon is trimmed to when it is over its limits, in two steps: first the power budget, taken from every stat, then
 * the damage-per-second cap, taken from damage and fire rate alone, and only if the budget step left the weapon over it (an even
 * trim to the budget usually does not, so damage and fire rate lose no more than the rest). In each, a stat gives up the same share of what it has, times
 * its weight (`g * (1 - shrink * weight)`, never below 0), and the shrink is the smallest one that reaches the limit, found by
 * halving. A limit already reached needs a shrink of 0, which the halving closes in on, so goodness that is within a limit comes back
 * as it was: this only ever takes away, never adds. A bigger weight costs a stat more.
 */
export function shrinkToLimits(goodness: StatNumbers, weights: StatNumbers): StatNumbers {
  const withinBudget = shrinkUntil(goodness, weights, BUDGET_STEP);

  return shrinkUntil(withinBudget, weights, DAMAGE_CAP_STEP);
}

function shrinkUntil(goodness: StatNumbers, weights: StatNumbers, step: ShrinkStep): StatNumbers {
  // At a shrink of one over the lightest weight every stat the step may take from is down to 0, which reaches any limit here.
  let tooLittle = 0;
  let enough = 1 / Math.min(...step.stats.map(stat => weights[stat]));

  for (let halving = 0; halving < BISECTIONS; halving += 1) {
    const middle = (tooLittle + enough) / 2;
    if (step.reached(shrunkBy(goodness, weights, {step, shrink: middle}))) {
      enough = middle;
    } else {
      tooLittle = middle;
    }
  }

  return shrunkBy(goodness, weights, {step, shrink: enough});
}

function shrunkBy(goodness: StatNumbers, weights: StatNumbers, {step, shrink}: AppliedShrink): StatNumbers {
  const shrunk = {...goodness};

  for (const stat of step.stats) {
    shrunk[stat] = goodness[stat] * (1 - Math.min(1, shrink * weights[stat]));
  }

  return shrunk;
}
