import fc from "fast-check";
import type {Seat} from "@gunsmith/engine/seat/types/Seat";
import {goodInputs} from "@src/durable-objects/match/property-tests/arbitraries/GoodInputs";
import type {Step} from "@src/durable-objects/match/property-tests/match-room/arbitraries/types/Step";

/** What can happen to a room in a stretch of play: inputs from either seat, in any order and under any sequence number, and ticks owing none to several steps. */
export function steps(): fc.Arbitrary<Step[]> {
  return fc.array(fc.oneof(inputStep(), tickStep()), {maxLength: 40});
}

function inputStep(): fc.Arbitrary<Step> {
  return fc.record({
    kind: fc.constant("input" as const),
    seat: fc.constantFrom<Seat>("first", "second"),
    seq: fc.integer({min: 0, max: 400}),
    input: goodInputs().map(good => good.input),
  });
}

function tickStep(): fc.Arbitrary<Step> {
  return fc.record({kind: fc.constant("tick" as const), steps: fc.integer({min: 0, max: 8})});
}
