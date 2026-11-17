import {BurstWindow} from "@src/sound/burst-window/BurstWindow";
import type {HitRequest} from "@src/sound/hit-confirmation/types/HitRequest";

/**
 * Decides when the player's bullet landing on a target they could see sounds (`sfx-hit`). The engine reports a hit only on a target in sight, so a step with a hit in
 * it is heard and one without is not: nothing here judges what the player sees. Bullets that land within a burst of the one that sounded are merged into it
 * (`BurstWindow`, as the crunch's are), so a burst of pellets is one sound. The hit that ends the round still sounds.
 */
export class HitConfirmation {
  private readonly burst = new BurstWindow();

  /** Whether this step should sound. Call it once per step, in order. */
  shouldPlay({events, round, seconds}: HitRequest): boolean {
    const triggered = events?.some(event => event.kind === "hitLanded") === true;

    return this.burst.opens({triggered, round, seconds});
  }
}
