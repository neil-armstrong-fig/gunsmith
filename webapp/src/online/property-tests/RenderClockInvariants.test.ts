import fc from "fast-check";
import {RenderClock} from "@src/online/interpolation/RenderClock";

/**
 * What must hold for any run of clock readings and snapshots, not only the ones someone wrote down. `RenderClock.test.ts` says what the
 * clock does in particular moments; this puts random runs through it. When a property fails, fast-check shrinks the run and prints a seed
 * to replay it.
 *
 * Deliberately outside `pnpm checks`: a fresh seed each run means a failure is not reproducible from the same commit
 * (`vitest.config.ts`). Run it with `pnpm test:properties`; `PROPERTY_TEST_RUNS` sets how many cases each property gets.
 */
const RUNS = Number(process.env["PROPERTY_TEST_RUNS"] ?? 100);

it("never draws the other fighter past the newest snapshot, nor backwards, and holds still when none new comes", () => {
  fc.assert(fc.property(delays(), unevenRuns(), expectNeverPastTheNewestNorBackwards), {numRuns: RUNS});
});

it("settles within half a snapshot interval of a delay behind the newest snapshot when snapshots come steadily", () => {
  fc.assert(fc.property(delays(), intervals(), expectToSettleADelayBehind), {numRuns: RUNS});
});

/** Each pair is how long passed on the browser's clock, and how far the newest snapshot's game time moved, in one stretch. */
function expectNeverPastTheNewestNorBackwards(delay: number, stretches: [number, number][]): void {
  const clock = new RenderClock(delay);
  let now = 100;
  let newest = 50;
  let before = clock.at({now, newestElapsedSeconds: newest});

  for (const [passed, news] of stretches) {
    now += passed;
    newest += news;
    const drawn = clock.at({now, newestElapsedSeconds: newest});

    expect(drawn).toBeLessThanOrEqual(newest);
    expect(drawn).toBeGreaterThanOrEqual(before);
    before = drawn;
  }
}

function expectToSettleADelayBehind(delay: number, interval: number): void {
  const clock = new RenderClock(delay);
  let now = 0;
  let newest = 10;
  let drawn = clock.at({now, newestElapsedSeconds: newest});

  for (let step = 0; step < 600; step += 1) {
    now += interval / 4;
    newest += interval / 4;
    drawn = clock.at({now, newestElapsedSeconds: newest});
  }

  expect(Math.abs(newest - drawn - delay)).toBeLessThan(interval / 2);
}

function delays(): fc.Arbitrary<number> {
  return fc.double({min: 0.05, max: 0.3, noNaN: true});
}

function intervals(): fc.Arbitrary<number> {
  return fc.double({min: 0.01, max: 0.1, noNaN: true});
}

function unevenRuns(): fc.Arbitrary<[number, number][]> {
  const stretch = fc.tuple(fc.double({min: 0, max: 0.3, noNaN: true}), fc.double({min: 0, max: 0.3, noNaN: true}));

  return fc.array(stretch, {minLength: 1, maxLength: 60});
}
