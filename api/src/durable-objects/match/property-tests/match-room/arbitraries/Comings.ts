import fc from "fast-check";
import type {Seat} from "@gunsmith/engine/seat/types/Seat";
import type {Coming} from "@src/durable-objects/match/property-tests/match-room/arbitraries/types/Coming";

/** What can happen to the people of a room over a long stretch: leaving, returning, asking, and waiting from nothing to far past the real limits. */
export function comings(): fc.Arbitrary<Coming[]> {
  return fc.array(fc.oneof(seatEvent("leave"), seatEvent("return"), seatEvent("ready"), ask(), wait()), {
    maxLength: 40,
  });
}

function seatEvent(kind: "leave" | "return" | "ready"): fc.Arbitrary<Coming> {
  return fc.record({kind: fc.constant(kind), seat: fc.constantFrom<Seat>("first", "second")});
}

function ask(): fc.Arbitrary<Coming> {
  return fc.record({
    kind: fc.constant("ask" as const),
    seat: fc.constantFrom<Seat>("first", "second"),
    walking: fc.boolean(),
  });
}

function wait(): fc.Arbitrary<Coming> {
  return fc.record({kind: fc.constant("wait" as const), seconds: fc.integer({min: 0, max: 90})});
}
