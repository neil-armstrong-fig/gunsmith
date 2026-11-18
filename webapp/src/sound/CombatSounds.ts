import {DamageCrunch} from "@src/sound/damage-crunch/DamageCrunch";
import {ClickLatch} from "@src/sound/empty-click/ClickLatch";
import {HitConfirmation} from "@src/sound/hit-confirmation/HitConfirmation";
import type {SoundOutput} from "@src/sound/types/SoundOutput";
import type {TickCues} from "@src/sound/types/TickCues";

const RING_LOOP = "sfx-ring-damage-loop";

/**
 * The sounds the fight makes, played from what each step of the simulation reports: the empty click (the latch turns the
 * engine's refusal on every step a held trigger meets an empty magazine into one click for the hold), the crunch of damage
 * (`DamageCrunch` makes one of a burst of bullets), the continuous ring damage loop, and the confirmation of a hit landed on a target the player sees
 * (`HitConfirmation`; the engine reports no hit on one they cannot).
 * Cosmetic and outside the simulation: nothing here is ever read back by the engine or kept in the game store.
 */
export class CombatSounds {
  private readonly click = new ClickLatch();
  private readonly crunch = new DamageCrunch();
  private readonly confirmation = new HitConfirmation();

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

    if (this.confirmation.shouldPlay({events, round, seconds})) {
      this.output.play("sfx-hit");
    }

    if (round === "playing" && events?.some(event => event.kind === "damageTaken" && event.cause === "ring")) {
      this.output.startLoop(RING_LOOP);
    } else {
      this.output.stopLoop(RING_LOOP);
    }
  }

  /** Stops whatever is playing and wants a fresh press of the trigger before the next click. */
  cancel(): void {
    this.output.stopAll();
    this.click.cancel();
  }
}
