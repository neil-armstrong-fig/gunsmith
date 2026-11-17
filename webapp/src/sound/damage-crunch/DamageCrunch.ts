import {BURST_SECONDS} from "@src/sound/damage-crunch/BurstSeconds";
import type {CrunchRequest} from "@src/sound/damage-crunch/types/CrunchRequest";

/** A sum of 1/60 s steps lands a hair under the tenth of a second it means, so the window is measured with this much give. */
const ROUNDING_SECONDS = 1e-9;

/**
 * Decides when the player's damage crunches. A bullet crunches at once, and bullets that hit within `BURST_SECONDS` of that
 * crunch are merged into it, so a burst is one crunch (the window runs from the first hit and is not stretched by the merged
 * ones). The ring takes health every step the player stands outside it, so it crunches once when it starts to hurt and again
 * only after a step it did not (a new exposure); its onset opens no window for bullets, which crunch for themselves. Time is the game's own, the seconds each step covers, so nothing here reads
 * a clock. A round that is not being fought clears both, after the step that ended it has been heard: the hit that killed the
 * player still crunches.
 */
export class DamageCrunch {
  private secondsSinceBulletCrunch = Number.POSITIVE_INFINITY;
  private ringHurting = false;

  /** Whether this step should crunch. Call it once per step, in order. */
  shouldPlay({events, round, seconds}: CrunchRequest): boolean {
    this.secondsSinceBulletCrunch += seconds;
    const bullet = events?.some(event => event.kind === "damageTaken" && event.cause === "bullet") === true;
    const ring = events?.some(event => event.kind === "damageTaken" && event.cause === "ring") === true;
    const ringStarted = ring && !this.ringHurting;
    this.ringHurting = ring;

    const bulletStarted = bullet && this.secondsSinceBulletCrunch >= BURST_SECONDS - ROUNDING_SECONDS;
    if (bulletStarted) {
      this.secondsSinceBulletCrunch = 0;
    }

    if (round !== "playing") {
      this.secondsSinceBulletCrunch = Number.POSITIVE_INFINITY;
      this.ringHurting = false;
    }

    return bulletStarted || ringStarted;
  }
}
