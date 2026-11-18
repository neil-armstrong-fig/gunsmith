import fc from "fast-check";
import type {InputMessage} from "@src/match/messages/types/InputMessage";
import {parseInputMessage} from "@src/match/messages/ParseInputMessage";
import {goodInputs} from "@src/match/property-tests/arbitraries/GoodInputs";

/**
 * What must hold for any text a browser could send, not only the frames someone wrote down. `ParseInputMessage.test.ts` says what the
 * parser makes of particular frames; this puts random text and random good and bad frames through it. When a property fails, fast-check
 * shrinks the case and prints a seed to replay it.
 *
 * Deliberately outside `pnpm checks`: a fresh seed each run means a failure is not reproducible from the same commit
 * (`vitest.config.ts`). Run it with `pnpm test:properties`; `PROPERTY_TEST_RUNS` sets how many cases each property gets.
 */
const RUNS = Number(process.env["PROPERTY_TEST_RUNS"] ?? 100);

it("never throws on any text", () => {
  fc.assert(
    fc.property(fc.string(), text => {
      expect(() => parseInputMessage(text)).not.toThrow();
    }),
    {numRuns: RUNS},
  );
});

it("reads back exactly what a good input frame says", () => {
  fc.assert(fc.property(goodInputs(), expectReadBackAsSent), {numRuns: RUNS});
});

it("refuses any frame whose sequence number is not a whole number of at least zero", () => {
  fc.assert(fc.property(badSequenceNumbers(), goodInputs(), expectRefused), {numRuns: RUNS});
});

function expectReadBackAsSent(good: InputMessage): void {
  const parsed = parseInputMessage(JSON.stringify({kind: "input", seq: good.seq, ...good.input}));

  expect(parsed?.seq).toBe(good.seq);
  expect(parsed?.input.direction).toEqual(JSON.parse(JSON.stringify(good.input.direction)));
  expect(parsed?.input.firing).toBe(good.input.firing);
  expect(parsed?.input.reload).toBe(good.input.reload);
}

function expectRefused(seq: unknown, good: InputMessage): void {
  expect(parseInputMessage(JSON.stringify({kind: "input", ...good.input, seq}))).toBeUndefined();
}

function badSequenceNumbers(): fc.Arbitrary<unknown> {
  return fc.oneof(
    fc.integer({max: -1}),
    fc.double({noInteger: true, noNaN: true}),
    fc.string(),
    fc.constant(null),
    fc.boolean(),
  );
}
