import type {SnapshotOfOpponent} from "@src/online/interpolation/types/SnapshotOfOpponent";

/** A run of snapshots, and the game time the other fighter is to be drawn at. */
export interface Observation {
  snapshots: SnapshotOfOpponent[];
  seconds: number;
}
