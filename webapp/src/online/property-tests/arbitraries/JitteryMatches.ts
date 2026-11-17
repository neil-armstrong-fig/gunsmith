import fc from "fast-check";
import {inputStreams} from "@src/online/property-tests/arbitraries/InputStreams";
import {OPEN_ROOM} from "@src/online/property-tests/simulated-network/arenas/OpenRoom";
import type {MatchPlan} from "@src/online/property-tests/simulated-network/types/MatchPlan";

/**
 * Matches over a network whose frames arrive a few steps apart: one delay, and up to three steps more on each frame. Each ask is held for
 * at least six steps (a tenth of a second), so at most two changes fall between two snapshots and the disagreement stays well under the
 * tile where a correction stops being eased and is put right at once. The room is open, since a pillar's corner makes that a jump by
 * design (one fighter sticks, the other slides), and the trigger is never held: a shot can end the round, and the browser, which does not
 * predict shots, has walked on by a delay's worth when the snapshot says so.
 */
export function jitteryMatches(): fc.Arbitrary<MatchPlan> {
  return fc
    .record({
      inputs: inputStreams(false, 6),
      delay: fc.integer({min: 0, max: 20}),
      upJitter: fc.array(fc.integer({min: 0, max: 3}), {minLength: 1, maxLength: 40}),
      downJitter: fc.array(fc.integer({min: 0, max: 3}), {minLength: 1, maxLength: 40}),
      snapshotEvery: fc.integer({min: 1, max: 4}),
    })
    .map(({inputs, delay, upJitter, downJitter, snapshotEvery}) => ({
      inputs,
      settleSteps: 30,
      upstreamDelays: upJitter.map(jitter => delay + jitter),
      downstreamDelays: downJitter.map(jitter => delay + jitter),
      snapshotEvery,
      arenaRows: OPEN_ROOM,
    }));
}
