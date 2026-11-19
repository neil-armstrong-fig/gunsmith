import fc from "fast-check";
import type {InputMessage} from "@src/durable-objects/match/messages/types/InputMessage";

/** Input frames a browser could send: any walk, aim, stance and trigger, and a sequence number. */
export function goodInputs(): fc.Arbitrary<InputMessage> {
  return fc.record({
    seq: fc.integer({min: 0, max: 1_000_000}),
    input: fc.record({
      direction: fc.record({
        x: fc.double({min: -5, max: 5, noNaN: true}),
        y: fc.double({min: -5, max: 5, noNaN: true}),
      }),
      aimAt: fc.record({
        x: fc.double({min: -50, max: 50, noNaN: true}),
        y: fc.double({min: -50, max: 50, noNaN: true}),
      }),
      crouching: fc.boolean(),
      firing: fc.boolean(),
      reload: fc.boolean(),
    }),
  });
}
