import {DamageCrunch} from "@src/sound/damage-crunch/DamageCrunch";
import {ClickLatch} from "@src/sound/empty-click/ClickLatch";
import type {SoundOutput} from "@src/sound/types/SoundOutput";
import type {TickCues} from "@src/sound/types/TickCues";

/**
 * The sounds the fight makes, played from what each step of the simulation reports: the empty click (the latch turns the
 * engine's refusal on every step a held trigger meets an empty magazine into one click for the hold) and the crunch of damage
 * (`DamageCrunch` makes one of a burst of bullets; the ring has no sound yet).
 * Cosmetic and outside the simulation: nothing here is ever read back by the engine or kept in the game store.
 */
export class CombatSounds {
  private readonly click = new ClickLatch();
  private readonly crunch = new DamageCrunch();

  constructor(private readonly output: SoundOutput) {}

  /** Call once after every step, with what it reported. */
  afterTick({events, firing, round, seconds}: TickCues): void {
    const refused = events?.some(event => event.kind === "fireRefused") === true;

    if (this.click.shouldClick({refused, firing, round})) {
      this.output.play("sfx-empty-click");
    }

    if (this.crunch.shouldPlay({events, round, seconds})) {
      this.output.play("sfx-damage-crunch");
    }
  }

  /** Stops whatever is playing and wants a fresh press of the trigger before the next click. */
  cancel(): void {
    this.output.stopAll();
    this.click.cancel();
  }
}
