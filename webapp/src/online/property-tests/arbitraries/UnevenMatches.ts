import fc from "fast-check";
import {inputStreams} from "@src/online/property-tests/arbitraries/InputStreams";
import {PILLARED_ROOM} from "@src/online/property-tests/simulated-network/arenas/PillaredRoom";
import type {MatchPlan} from "@src/online/property-tests/simulated-network/types/MatchPlan";

/** After this many idle steps every frame has arrived (delays below are at most 30 steps) and every correction has faded to nothing anyone could see. */
const SETTLE_STEPS = 150;

/** Matches over a network that holds each frame up by anything from none to thirty steps, in a pillared room, with the trigger held now and then. */
export function unevenMatches(): fc.Arbitrary<MatchPlan> {
  return fc.record({
    inputs: inputStreams(true),
    settleSteps: fc.constant(SETTLE_STEPS),
    upstreamDelays: fc.array(fc.integer({min: 0, max: 30}), {minLength: 1, maxLength: 40}),
    downstreamDelays: fc.array(fc.integer({min: 0, max: 30}), {minLength: 1, maxLength: 40}),
    snapshotEvery: fc.integer({min: 1, max: 4}),
    arenaRows: fc.constant(PILLARED_ROOM),
  });
}
