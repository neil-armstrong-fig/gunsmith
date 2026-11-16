/**
 * Whether every picture the scene draws has loaded or been given up on, which the arena says in `data-sprites-ready`: pictures decode after the page
 * opens, a placeholder shows until they do, and a spec that read the screen before then would see the placeholder.
 */
class SpritesReadiness {
  private requested = false;
  private loading = 0;
  private readonly listeners = new Set<() => void>();

  /** Counts a load as under way until it settles, either way, then tells whoever is listening. */
  async trackLoad(load: Promise<void>): Promise<void> {
    this.loading += 1;

    try {
      await load;
    } finally {
      this.loading -= 1;
      this.announce();
    }
  }

  /** Says the loads have all been started, so that having none under way means done and not "not begun". */
  markRequested(): void {
    this.requested = true;
    this.announce();
  }

  /** Arrow properties, so a method can be handed to `useSyncExternalStore` without losing `this`. */
  readonly areReady = (): boolean => {
    return this.requested && this.loading === 0;
  };

  /** Calls `listener` whenever a load settles or the loads are requested; the function returned stops it. */
  readonly subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);

    return () => {
      this.listeners.delete(listener);
    };
  };

  /** Starts again, as a page that has not loaded anything. For tests: a page never goes back. */
  forget(): void {
    this.requested = false;
    this.loading = 0;
    this.listeners.clear();
  }

  private announce(): void {
    this.listeners.forEach(listener => {
      listener();
    });
  }
}

/** The one place the page asks whether its pictures are ready. */
export const spritesReadiness = new SpritesReadiness();
