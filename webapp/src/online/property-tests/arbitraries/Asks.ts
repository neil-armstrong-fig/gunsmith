import fc from "fast-check";
import type {Input} from "@gunsmith/engine/game-loop/types/Input";
import {directions} from "@src/online/property-tests/arbitraries/Directions";

/** What a player may ask for in one step, short of a reload or a weapon switch: a walk, a stance and the trigger. */
export function asks(): fc.Arbitrary<Input> {
  return fc.record({
    direction: directions(),
    crouching: fc.boolean(),
    firing: fc.boolean(),
    reload: fc.constant(false),
  });
}
