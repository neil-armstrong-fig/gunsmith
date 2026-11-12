import {BURST_SECONDS} from "@gunsmith/engine/opponent/burst/BurstSeconds";
import {PAUSE_SECONDS} from "@gunsmith/engine/opponent/burst/PauseSeconds";

/**
 * Whether the opponent is in the burst part of its cycle at this game time: it fires for `BURST_SECONDS`, rests for
 * `PAUSE_SECONDS`, and starts again. Worked out from the clock alone, so the opponent needs no memory of its own.
 */
export function isBursting(elapsedSeconds: number): boolean {
  return elapsedSeconds % (BURST_SECONDS + PAUSE_SECONDS) < BURST_SECONDS;
}
