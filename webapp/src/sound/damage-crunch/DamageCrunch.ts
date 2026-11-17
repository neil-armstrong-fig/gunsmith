import {BURST_SECONDS} from "@src/sound/damage-crunch/BurstSeconds";
import type {CrunchRequest} from "@src/sound/damage-crunch/types/CrunchRequest";

/** A sum of 1/60 s steps lands a hair under the tenth of a second it means, so the window is measured with this much give. */
const ROUNDING_SECONDS = 1e-9;

/**
 * Decides when a bullet hitting the player crunches. A bullet crunches at once, and bullets that hit within `BURST_SECONDS`
 * of that crunch are merged into it, so a burst is one crunch (the window runs from the first hit and is not stretched by the
 * merged ones). The ring never crunches: it hurts every step the player is outside it, which is a continuous state and wants
 * a continuous sound of its own, not an impact (art has been asked for one). Time is the game's own, the seconds each step
 * covers, so nothing here reads a clock. A round that is not being fought clears the window, after the step that ended it has
 * been heard: the hit that killed the player still crunches.
 */
export class DamageCrunch {
  private secondsSinceCrunch = Number.POSITIVE_INFINITY;

  /** Whether this step should crunch. Call it once per step, in order. */
  shouldPlay({events, round, seconds}: CrunchRequest): boolean {
    this.secondsSinceCrunch += seconds;
    const bullet = events?.some(event => event.kind === "damageTaken" && event.cause === "bullet") === true;
    const crunches = bullet && this.secondsSinceCrunch >= BURST_SECONDS - ROUNDING_SECONDS;
    if (crunches) {
      this.secondsSinceCrunch = 0;
    }

    if (round !== "playing") {
      this.secondsSinceCrunch = Number.POSITIVE_INFINITY;
    }

    return crunches;
  }
}
