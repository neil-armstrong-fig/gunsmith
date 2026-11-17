import type {RenderClockRequest} from "@src/online/interpolation/types/RenderClockRequest";

/** How hard the clock speeds up or slows down per second of buffer it is off by, as a share of normal pace. A tunable. */
const PACE_PER_SECOND_OFF = 2;

/** The fastest and the slowest the clock runs, as a share of normal pace: an adjustment no one sees in a fighter's walk. */
const SLOWEST_PACE = 0.8;
const FASTEST_PACE = 1.25;

/**
 * The game time the other fighter is drawn at, a `delay` behind the newest snapshot, kept steady though snapshots come unevenly. It moves on
 * with this browser's own clock and never past the newest snapshot, so a snapshot that is late makes it hold, and when one comes it takes
 * up from there instead of jumping to where it would have been. It runs a little fast when the newest snapshot is further ahead than
 * `delay`, and a little slow when it is nearer, so the gap settles at `delay`. When the server's game time goes back (a new round) it starts again.
 */
export class RenderClock {
  private renderSeconds: number | undefined;
  private lastNow = 0;

  constructor(private readonly delay: number) {}

  /** The game time to draw at, for this moment of this browser's clock. */
  at(request: RenderClockRequest): number {
    const {now, newestElapsedSeconds} = request;
    const rendering = this.renderSeconds;
    if (rendering === undefined || newestElapsedSeconds < rendering) {
      return this.start(request);
    }

    const passed = Math.max(0, now - this.lastNow);
    const pace = this.paceFor(newestElapsedSeconds - rendering);
    this.lastNow = Math.max(this.lastNow, now);
    this.renderSeconds = Math.min(newestElapsedSeconds, rendering + passed * pace);

    return this.renderSeconds;
  }

  private start(request: RenderClockRequest): number {
    this.lastNow = request.now;
    this.renderSeconds = request.newestElapsedSeconds - this.delay;

    return this.renderSeconds;
  }

  /** How fast to run, as a share of normal pace, when the newest snapshot is `buffered` seconds ahead of the clock. */
  private paceFor(buffered: number): number {
    const pace = 1 + PACE_PER_SECOND_OFF * (buffered - this.delay);

    return Math.min(FASTEST_PACE, Math.max(SLOWEST_PACE, pace));
  }
}
