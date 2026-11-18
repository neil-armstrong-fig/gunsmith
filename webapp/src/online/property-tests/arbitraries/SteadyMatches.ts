import fc from "fast-check";
import {inputStreams} from "@src/online/property-tests/arbitraries/InputStreams";
import {PILLARED_ROOM} from "@src/online/property-tests/simulated-network/arenas/PillaredRoom";
import type {MatchPlan} from "@src/online/property-tests/simulated-network/types/MatchPlan";

/** Matches over a steady network: every frame up is held up by one delay and every frame down by another, whatever they are, and the player never fires. */
export function steadyMatches(): fc.Arbitrary<MatchPlan> {
  return fc
    .record({
      inputs: inputStreams(false),
      up: fc.integer({min: 0, max: 20}),
      down: fc.integer({min: 0, max: 20}),
      snapshotEvery: fc.integer({min: 1, max: 4}),
    })
    .map(({inputs, up, down, snapshotEvery}) => ({
      inputs,
      settleSteps: 0,
      upstreamDelays: [up],
      downstreamDelays: [down],
      snapshotEvery,
      arenaRows: PILLARED_ROOM,
    }));
}
