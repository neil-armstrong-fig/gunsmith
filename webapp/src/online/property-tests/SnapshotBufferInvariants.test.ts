import fc from "fast-check";
import {SnapshotBuffer} from "@src/online/interpolation/SnapshotBuffer";

/**
 * What must hold for any limit and any run of snapshot times, not only the ones someone wrote down. `SnapshotBuffer.test.ts` says what the
 * buffer does in particular cases; this puts random runs through it. When a property fails, fast-check shrinks the run and prints a seed
 * to replay it.
 *
 * Deliberately outside `pnpm checks`: a fresh seed each run means a failure is not reproducible from the same commit
 * (`vitest.config.ts`). Run it with `pnpm test:properties`; `PROPERTY_TEST_RUNS` sets how many cases each property gets.
 */
const RUNS = Number(process.env["PROPERTY_TEST_RUNS"] ?? 100);

it("keeps only the last snapshots, in order, and starts again when the game time goes back", () => {
  fc.assert(fc.property(limits(), runsOfTimes(), expectTheLastFewInOrder), {numRuns: RUNS});
});

function expectTheLastFewInOrder(limit: number, times: number[]): void {
  const buffer = new SnapshotBuffer(limit);

  for (const elapsedSeconds of times) {
    buffer.add({elapsedSeconds, opponent: undefined});

    const kept = buffer.all.map(snapshot => snapshot.elapsedSeconds);
    expect(kept.length).toBeLessThanOrEqual(limit);
    expect(kept.at(-1)).toBe(elapsedSeconds);
    expect([...kept].sort((a, b) => a - b)).toEqual(kept);
  }
}

function limits(): fc.Arbitrary<number> {
  return fc.integer({min: 1, max: 8});
}

function runsOfTimes(): fc.Arbitrary<number[]> {
  return fc.array(fc.double({min: 0, max: 20, noNaN: true}), {maxLength: 40});
}
