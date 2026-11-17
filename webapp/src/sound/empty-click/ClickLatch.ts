import type {ClickRequest} from "@src/sound/empty-click/types/ClickRequest";

/**
 * Lets an empty weapon click once for each time the trigger is pulled and held. The engine says so on every step a held
 * trigger is refused, so this keeps the first and drops the rest. Only letting go rearms it: reloading and switching weapon
 * while the trigger stays held do not, and a round that is not being played (a death, the pause before the next round)
 * disarms it, so a trigger still held when the next round starts needs a fresh press.
 */
export class ClickLatch {
  private armed = true;

  /** Whether this step should click, given what it did. Call it once per step, in order. */
  shouldClick({refused, firing, round}: ClickRequest): boolean {
    if (round !== "playing") {
      this.armed = false;

      return false;
    }

    if (!firing) {
      this.armed = true;

      return false;
    }

    if (!refused || !this.armed) {
      return false;
    }

    this.armed = false;

    return true;
  }

  /** Puts the latch down until the trigger is let go: the window lost focus, or the sound was muted. */
  cancel(): void {
    this.armed = false;
  }
}
