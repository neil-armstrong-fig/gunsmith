import fc from "fast-check";
import type {Point} from "@gunsmith/engine/geometry/types/Point";
import {fadedOffset} from "@src/online/prediction/correction/FadedOffset";
import {points} from "@src/online/property-tests/arbitraries/Points";

/**
 * What must hold for any offset and any time, not only the ones someone wrote down. `FadedOffset.test.ts` says how much an offset fades
 * in particular cases; this puts random ones through it. When a property fails, fast-check shrinks the case and prints a seed to replay it.
 *
 * Deliberately outside `pnpm checks`: a fresh seed each run means a failure is not reproducible from the same commit
 * (`vitest.config.ts`). Run it with `pnpm test:properties`; `PROPERTY_TEST_RUNS` sets how many cases each property gets.
 */
const RUNS = Number(process.env["PROPERTY_TEST_RUNS"] ?? 100);

it("fades an offset toward nothing without turning it round", () => {
  fc.assert(fc.property(points(-1, 1), seconds(), expectNoLongerAndNotTurned), {numRuns: RUNS});
});

it("fades the same in two parts as in one", () => {
  fc.assert(fc.property(points(-1, 1), seconds(), seconds(), expectTwoPartsToBeOne), {numRuns: RUNS});
});

function expectNoLongerAndNotTurned(offset: Point, elapsed: number): void {
  const faded = fadedOffset(offset, elapsed);

  expect(Math.hypot(faded.x, faded.y)).toBeLessThanOrEqual(Math.hypot(offset.x, offset.y) + 1e-12);
  expect(faded.x * offset.x + faded.y * offset.y).toBeGreaterThanOrEqual(0);
}

function expectTwoPartsToBeOne(offset: Point, first: number, second: number): void {
  const twice = fadedOffset(fadedOffset(offset, first), second);
  const once = fadedOffset(offset, first + second);

  expect(Math.abs(twice.x - once.x)).toBeLessThan(2e-3);
  expect(Math.abs(twice.y - once.y)).toBeLessThan(2e-3);
}

function seconds(): fc.Arbitrary<number> {
  return fc.double({min: 0, max: 0.2, noNaN: true});
}
