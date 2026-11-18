import {RenderClock} from "@src/online/interpolation/RenderClock";

const DELAY = 0.1;

it("starts one delay behind the newest snapshot", () => {
  const clock = new RenderClock(DELAY);

  expect(clock.at({now: 5, newestElapsedSeconds: 2})).toBeCloseTo(1.9);
});

it("moves on with the browser's own clock while the buffer is as deep as it should be", () => {
  const clock = new RenderClock(DELAY);
  clock.at({now: 5, newestElapsedSeconds: 2});

  expect(clock.at({now: 5.05, newestElapsedSeconds: 2.05})).toBeCloseTo(1.95);
});

it("never passes the newest snapshot: when none new comes it holds there, and does not guess ahead", () => {
  const clock = new RenderClock(DELAY);
  clock.at({now: 5, newestElapsedSeconds: 2});

  expect(clock.at({now: 5.5, newestElapsedSeconds: 2})).toBe(2);
  expect(clock.at({now: 6, newestElapsedSeconds: 2})).toBe(2);
});

it("takes up from where it held when a snapshot comes late, rather than jumping to where it would have been", () => {
  const clock = new RenderClock(DELAY);
  clock.at({now: 5, newestElapsedSeconds: 2});
  clock.at({now: 5.3, newestElapsedSeconds: 2});

  const resumed = clock.at({now: 5.3167, newestElapsedSeconds: 2.35});

  expect(resumed).toBeGreaterThan(2);
  expect(resumed).toBeLessThan(2.05);
});

it("runs a little fast when it has fallen far behind, to catch up without a jump", () => {
  const clock = new RenderClock(DELAY);
  clock.at({now: 5, newestElapsedSeconds: 2});
  const caughtUp = clock.at({now: 5.1, newestElapsedSeconds: 2.4});

  expect(caughtUp).toBeGreaterThan(1.9 + 0.1);
  expect(caughtUp).toBeLessThan(1.9 + 0.1 * 1.25);
});

it("runs a little slow when the buffer has run thin, so it fills again", () => {
  const clock = new RenderClock(DELAY);
  clock.at({now: 5, newestElapsedSeconds: 2});
  clock.at({now: 5.05, newestElapsedSeconds: 2});
  const slowed = clock.at({now: 5.1, newestElapsedSeconds: 2});

  expect(slowed).toBeGreaterThan(1.95);
  expect(slowed).toBeLessThan(1.95 + 0.05);
  expect(slowed).toBeCloseTo(1.95 + 0.05 * 0.9, 6);
});

it("starts again when the server's game time goes back, as it does with each round", () => {
  const clock = new RenderClock(DELAY);
  clock.at({now: 5, newestElapsedSeconds: 30});
  clock.at({now: 5.1, newestElapsedSeconds: 30.1});

  expect(clock.at({now: 5.2, newestElapsedSeconds: 0.02})).toBeCloseTo(0.02 - DELAY, 6);
});

it("does not run backwards when the browser's clock stands still or is asked twice for the same moment", () => {
  const clock = new RenderClock(DELAY);
  const first = clock.at({now: 5, newestElapsedSeconds: 2});

  expect(clock.at({now: 5, newestElapsedSeconds: 2})).toBe(first);
  expect(clock.at({now: 4.9, newestElapsedSeconds: 2})).toBe(first);
});
