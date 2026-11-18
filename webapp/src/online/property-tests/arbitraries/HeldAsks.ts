import fc from "fast-check";
import type {Input} from "@gunsmith/engine/game-loop/types/Input";
import {directions} from "@src/online/property-tests/arbitraries/Directions";
import type {HeldAsk} from "@src/online/property-tests/arbitraries/types/HeldAsk";

/** One ask, a walk and a stance, held unchanged for between half a second and five seconds. */
export function heldAsks(): fc.Arbitrary<HeldAsk> {
  return fc
    .record({direction: directions(), crouching: fc.boolean(), steps: fc.integer({min: 30, max: 300})})
    .map(({direction, crouching, steps}): HeldAsk => {
      const input: Input = {direction, crouching, firing: false, reload: false};

      return {input, steps};
    });
}
