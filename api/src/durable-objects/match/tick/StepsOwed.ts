import type {StepsOwed} from "@src/durable-objects/match/tick/types/StepsOwed";
import {MATCH_TICK} from "@src/durable-objects/match/tick/MatchTick";

/** Never more than this many steps at once: a stalled clock is not played back in one burst. */
const MOST_STEPS_AT_ONCE = 6;

/**
 * Turns the real time since the last tick into whole engine steps, carrying the remainder to the next tick, as the browser's loop
 * does. A timer fires a little late and unevenly, so a match that stepped once per timer fire would run slow; counting the
 * time keeps the simulation at the engine's own speed whatever the timer does.
 */
export function stepsOwed(leftoverSeconds: number, elapsedSeconds: number): StepsOwed {
  const available = leftoverSeconds + Math.max(0, elapsedSeconds);
  const whole = Math.floor(available / MATCH_TICK.stepSeconds + 1e-9);

  // The steps past the limit are dropped, not kept for the next tick: only the part of a step left over is carried.
  return {
    steps: Math.min(MOST_STEPS_AT_ONCE, whole),
    leftoverSeconds: Math.max(0, available - whole * MATCH_TICK.stepSeconds),
  };
}
