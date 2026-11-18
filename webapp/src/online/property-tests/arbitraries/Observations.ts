import fc from "fast-check";
import {snapshotRuns} from "@src/online/property-tests/arbitraries/SnapshotRuns";
import type {Observation} from "@src/online/property-tests/arbitraries/types/Observation";

/**
 * A run of snapshots and a game time to draw the other fighter at, anywhere from a little before the first to a little past the last.
 * The time is placed along the run (in thousandths of its length) rather than drawn from a fixed range, which would seldom fall between
 * two snapshots: the case where the fighter is blended.
 */
export function observations(): fc.Arbitrary<Observation> {
  return snapshotRuns().chain(snapshots => {
    const first = snapshots[0]?.elapsedSeconds ?? 0;
    const length = (snapshots.at(-1)?.elapsedSeconds ?? 0) - first;

    return fc
      .integer({min: -50, max: 1050})
      .map((thousandths): Observation => ({snapshots, seconds: first + (length * thousandths) / 1000}));
  });
}
