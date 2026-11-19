import fc from "fast-check";

/** Ways to cut a stretch of owed steps into ticks. */
export function cuts(): fc.Arbitrary<number[]> {
  return fc.array(fc.integer({min: 1, max: 6}), {minLength: 1, maxLength: 6});
}
