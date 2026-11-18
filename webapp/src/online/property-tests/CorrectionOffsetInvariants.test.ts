import fc from "fast-check";
import type {Point} from "@gunsmith/engine/geometry/types/Point";
import {correctionOffset} from "@src/online/prediction/correction/CorrectionOffset";
import {points} from "@src/online/property-tests/arbitraries/Points";

/**
 * What must hold for any two places, not only the ones someone wrote down. `CorrectionOffset.test.ts` says what is eased and what is put
 * right at once in particular cases; this puts random places through it. When a property fails, fast-check shrinks the case and prints a
 * seed to replay it.
 *
 * Deliberately outside `pnpm checks`: a fresh seed each run means a failure is not reproducible from the same commit
 * (`vitest.config.ts`). Run it with `pnpm test:properties`; `PROPERTY_TEST_RUNS` sets how many cases each property gets.
 */
const RUNS = Number(process.env["PROPERTY_TEST_RUNS"] ?? 100);

it("eases a correction under a tile as the whole difference and puts one over a tile right at once", () => {
  fc.assert(fc.property(points(0, 3), points(0, 3), expectEasedUnderATileAndNotOver), {numRuns: RUNS});
});

function expectEasedUnderATileAndNotOver(shown: Point, target: Point): void {
  const offset = correctionOffset({shown, target});
  const difference = Math.hypot(shown.x - target.x, shown.y - target.y);

  if (difference > 1) {
    expect(offset).toEqual({x: 0, y: 0});
    return;
  }

  expect(offset.x).toBeCloseTo(shown.x - target.x, 9);
  expect(offset.y).toBeCloseTo(shown.y - target.y, 9);
}
