import type {SnapshotOfOpponent} from "@src/online/interpolation/types/SnapshotOfOpponent";

/**
 * The last few snapshots' word about the other fighter, oldest first, for `opponentAt` to blend between. The server's game time starts
 * again from zero with each round, so a snapshot older than the newest means a new round began: what came before is dropped, not blended
 * into the new round.
 */
export class SnapshotBuffer {
  private snapshots: SnapshotOfOpponent[] = [];

  constructor(private readonly limit: number) {}

  get all(): readonly SnapshotOfOpponent[] {
    return this.snapshots;
  }

  get newest(): SnapshotOfOpponent | undefined {
    return this.snapshots.at(-1);
  }

  add(snapshot: SnapshotOfOpponent): void {
    const newest = this.newest;
    if (newest && snapshot.elapsedSeconds < newest.elapsedSeconds) {
      this.snapshots = [];
    }

    this.snapshots.push(snapshot);
    if (this.snapshots.length > this.limit) {
      this.snapshots.shift();
    }
  }
}
