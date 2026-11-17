import {BURST_SECONDS} from "@src/sound/burst-window/BurstSeconds";
import type {BurstStep} from "@src/sound/burst-window/types/BurstStep";

/** A sum of 1/60 s steps lands a hair under the tenth of a second it means, so the window is measured with this much give. */
const ROUNDING_SECONDS = 1e-9;

/**
 * Turns a run of steps that each want a sound into one sound per burst. A trigger opens a burst at once, and triggers within `BURST_SECONDS` of that one are
 * merged into it (the window runs from the opening one and is not stretched by the merged ones). Time is the game's own, the seconds each step covers, so nothing
 * here reads a clock. A round that is not being fought clears the window, after the step that ended it has been heard: the trigger that ended the round still opens.
 */
export class BurstWindow {
  private secondsSinceOpening = Number.POSITIVE_INFINITY;

  /** Whether this step opens a burst, and so should sound. Call it once per step, in order. */
  opens({triggered, round, seconds}: BurstStep): boolean {
    this.secondsSinceOpening += seconds;
    const opens = triggered && this.secondsSinceOpening >= BURST_SECONDS - ROUNDING_SECONDS;
    if (opens) {
      this.secondsSinceOpening = 0;
    }

    if (round !== "playing") {
      this.secondsSinceOpening = Number.POSITIVE_INFINITY;
    }

    return opens;
  }
}
