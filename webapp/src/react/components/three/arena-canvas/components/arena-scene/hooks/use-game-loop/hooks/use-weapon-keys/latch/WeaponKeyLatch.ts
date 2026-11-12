/**
 * The weapon keys pressed since the simulation last asked. A key can be tapped and released between two steps, and a
 * reload or a switch is one event, not a state, so each press waits here until a step takes it, and only one step gets
 * it. Pressing twice before a step is one press; of two different weapons pressed, the last one wins.
 */
export class WeaponKeyLatch {
  private reloadPressed = false;
  private slotPressed: number | undefined;

  pressReload(): void {
    this.reloadPressed = true;
  }

  /** `slot` is the weapon asked for: 1 is the first. */
  pressSlot(slot: number): void {
    this.slotPressed = slot;
  }

  /** Whether a reload was asked for since the last step took one. Taking it clears it. */
  takeReload(): boolean {
    const pressed = this.reloadPressed;
    this.reloadPressed = false;

    return pressed;
  }

  /** The weapon asked for since the last step took one, or `undefined`. Taking it clears it. */
  takeSlot(): number | undefined {
    const pressed = this.slotPressed;
    this.slotPressed = undefined;

    return pressed;
  }
}
