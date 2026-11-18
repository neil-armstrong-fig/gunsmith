import {BurstWindow} from "@src/sound/burst-window/BurstWindow";
import type {CrunchRequest} from "@src/sound/damage-crunch/types/CrunchRequest";

/**
 * Decides when a bullet hitting the player crunches. A bullet crunches at once, and bullets that hit within a burst of that crunch are merged into it
 * (`BurstWindow`), so a burst is one crunch. The ring never crunches: it hurts every step the player is outside it, which is a continuous state and wants
 * a continuous sound of its own, not an impact (art has been asked for one). The hit that killed the player still crunches.
 */
export class DamageCrunch {
  private readonly burst = new BurstWindow();

  /** Whether this step should crunch. Call it once per step, in order. */
  shouldPlay({events, round, seconds}: CrunchRequest): boolean {
    const triggered = events?.some(event => event.kind === "damageTaken" && event.cause === "bullet") === true;

    return this.burst.opens({triggered, round, seconds});
  }
}
