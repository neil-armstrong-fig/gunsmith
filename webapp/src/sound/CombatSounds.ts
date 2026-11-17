import {ClickLatch} from "@src/sound/empty-click/ClickLatch";
import type {SoundOutput} from "@src/sound/types/SoundOutput";
import type {TickCues} from "@src/sound/types/TickCues";

/**
 * The sounds the fight makes, played from what each step of the simulation reports. For now that is the empty click: the
 * latch turns the engine's refusal on every step a held trigger meets an empty magazine into one click for the hold.
 * Cosmetic and outside the simulation: nothing here is ever read back by the engine or kept in the game store.
 */
export class CombatSounds {
  private readonly click = new ClickLatch();

  constructor(private readonly output: SoundOutput) {}

  /** Call once after every step, with what it reported. */
  afterTick({events, firing, round}: TickCues): void {
    const refused = events?.some(event => event.kind === "fireRefused") === true;

    if (this.click.shouldClick({refused, firing, round})) {
      this.output.play("sfx-empty-click");
    }
  }

  /** Stops whatever is playing and wants a fresh press of the trigger before the next click. */
  cancel(): void {
    this.output.stopAll();
    this.click.cancel();
  }
}
