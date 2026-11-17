import fc from "fast-check";
import {opponentAt} from "@src/online/interpolation/OpponentAt";
import {observations} from "@src/online/property-tests/arbitraries/Observations";
import type {Observation} from "@src/online/property-tests/arbitraries/types/Observation";

/**
 * What must hold for any run of snapshots and any time asked, not only the ones someone wrote down. `OpponentAt.test.ts` says where the
 * other fighter is drawn in particular cases; this puts random runs through it. When a property fails, fast-check shrinks the run and
 * prints a seed to replay it.
 *
 * Deliberately outside `pnpm checks`: a fresh seed each run means a failure is not reproducible from the same commit
 * (`vitest.config.ts`). Run it with `pnpm test:properties`; `PROPERTY_TEST_RUNS` sets how many cases each property gets.
 */
const RUNS = Number(process.env["PROPERTY_TEST_RUNS"] ?? 100);

/** A tolerance for numbers that are the same but for the order the arithmetic was done in. */
const SAME = 1e-9;

it("draws the other fighter only where the snapshots put them: on a line between the two snapshots either side of the time, never beyond", () => {
  fc.assert(fc.property(observations(), expectNeverBeyondTheSnapshots), {numRuns: RUNS});
});

it("draws nobody once the time reaches a snapshot that does not hold the fighter, until one that does", () => {
  fc.assert(fc.property(observations(), expectNobodyAfterAnEmptySnapshot), {numRuns: RUNS});
});

function expectNeverBeyondTheSnapshots({snapshots, seconds}: Observation): void {
  const drawn = opponentAt(snapshots, seconds);
  if (!drawn) {
    return;
  }

  const before = snapshots.filter(snapshot => snapshot.elapsedSeconds <= seconds).at(-1) ?? snapshots[0];
  const after = snapshots.find(snapshot => snapshot.elapsedSeconds > seconds);
  const either = [before?.opponent, after?.opponent].flatMap(fighter => (fighter ? [fighter.position] : []));

  expect(drawn.position.x).toBeGreaterThanOrEqual(Math.min(...either.map(place => place.x)) - SAME);
  expect(drawn.position.x).toBeLessThanOrEqual(Math.max(...either.map(place => place.x)) + SAME);
  expect(drawn.position.y).toBeGreaterThanOrEqual(Math.min(...either.map(place => place.y)) - SAME);
  expect(drawn.position.y).toBeLessThanOrEqual(Math.max(...either.map(place => place.y)) + SAME);
  expect(Math.hypot(drawn.aim.x, drawn.aim.y)).toBeCloseTo(1, 6);
}

function expectNobodyAfterAnEmptySnapshot({snapshots, seconds}: Observation): void {
  const newestBefore = snapshots.filter(snapshot => snapshot.elapsedSeconds <= seconds).at(-1);

  if (newestBefore && !newestBefore.opponent) {
    expect(opponentAt(snapshots, seconds)).toBeUndefined();
  }
}
