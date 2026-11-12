/**
 * Whether the trigger counts as pulled. A click can come and go between two steps of the simulation, and the engine
 * would never see the button down; so a press stays pulled until a step has actually run with it, even if the button is
 * already up. Holding the button keeps it pulled for as long as it is held.
 */
export class FiringLatch {
  private held = false;
  private pending = false;

  press(): void {
    this.held = true;
    this.pending = true;
  }

  release(): void {
    this.held = false;
  }

  isFiring(): boolean {
    return this.held || this.pending;
  }

  /** Call after a frame's steps have run, with how many there were: a click has been seen once any step has run. */
  afterTicks(ticks: number): void {
    if (ticks > 0) {
      this.pending = false;
    }
  }
}
