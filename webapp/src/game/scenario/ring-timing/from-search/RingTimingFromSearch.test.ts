import {DEFAULT_RING_TIMING} from "@gunsmith/engine/ring/DefaultRingTiming";
import {ringTimingFromSearch} from "@src/game/scenario/ring-timing/from-search/RingTimingFromSearch";

it("reads both timings the query asks for", () => {
  expect(ringTimingFromSearch("?ringDelay=2&ringClosing=6")).toEqual({startDelaySeconds: 2, closingSeconds: 6});
});

it("finds them among other parameters", () => {
  expect(ringTimingFromSearch("?scenario=duel&ringClosing=15&seed=7&ringDelay=3")).toEqual({
    startDelaySeconds: 3,
    closingSeconds: 15,
  });
});

it("reads seconds that are not whole", () => {
  expect(ringTimingFromSearch("?ringDelay=1.5&ringClosing=0.25")).toEqual({
    startDelaySeconds: 1.5,
    closingSeconds: 0.25,
  });
});

it("keeps the duel's own closing time when the query asks only for the delay", () => {
  expect(ringTimingFromSearch("?ringDelay=3")).toEqual({
    startDelaySeconds: 3,
    closingSeconds: DEFAULT_RING_TIMING.closingSeconds,
  });
});

it("keeps the duel's own delay when the query asks only for the closing time", () => {
  expect(ringTimingFromSearch("?ringClosing=10")).toEqual({
    startDelaySeconds: DEFAULT_RING_TIMING.startDelaySeconds,
    closingSeconds: 10,
  });
});

it("has no timing when the query asks for none: the page keeps the game's own", () => {
  expect(ringTimingFromSearch("")).toBeUndefined();
  expect(ringTimingFromSearch("?scenario=duel&seed=3")).toBeUndefined();
});

it("lets the ring start at once: a delay of nothing is a delay", () => {
  expect(ringTimingFromSearch("?ringDelay=0")).toEqual({
    startDelaySeconds: 0,
    closingSeconds: DEFAULT_RING_TIMING.closingSeconds,
  });
});

it("refuses a closing time of nothing, which no ring can close in", () => {
  expect(ringTimingFromSearch("?ringClosing=0")).toBeUndefined();
});

it("ignores a timing that is not a plain number of seconds, and keeps the other", () => {
  expect(ringTimingFromSearch("?ringDelay=abc")).toBeUndefined();
  expect(ringTimingFromSearch("?ringDelay=-3")).toBeUndefined();
  expect(ringTimingFromSearch("?ringDelay=1e3")).toBeUndefined();
  expect(ringTimingFromSearch("?ringDelay=")).toBeUndefined();
  expect(ringTimingFromSearch("?ringDelay=2&ringClosing=oops")).toEqual({
    startDelaySeconds: 2,
    closingSeconds: DEFAULT_RING_TIMING.closingSeconds,
  });
});

it("reads how many times the normal damage the ring does", () => {
  expect(ringTimingFromSearch("?ringDamage=10")).toEqual({
    startDelaySeconds: DEFAULT_RING_TIMING.startDelaySeconds,
    closingSeconds: DEFAULT_RING_TIMING.closingSeconds,
    damageScale: 10,
  });
});

it("reads the damage with the timings, among other parameters", () => {
  expect(ringTimingFromSearch("?scenario=duel&ringDamage=2.5&ringClosing=6&seed=7&ringDelay=1")).toEqual({
    startDelaySeconds: 1,
    closingSeconds: 6,
    damageScale: 2.5,
  });
});

it("gives a ring with no damage in the query no scale at all, so it does the normal damage", () => {
  expect(ringTimingFromSearch("?ringDelay=2&ringClosing=6")).toStrictEqual({startDelaySeconds: 2, closingSeconds: 6});
});

it("refuses a damage of nothing, which would never decide a round", () => {
  expect(ringTimingFromSearch("?ringDamage=0")).toBeUndefined();
  expect(ringTimingFromSearch("?ringDelay=2&ringDamage=0")).toEqual({
    startDelaySeconds: 2,
    closingSeconds: DEFAULT_RING_TIMING.closingSeconds,
  });
});

it("ignores a damage that is not a plain number", () => {
  expect(ringTimingFromSearch("?ringDamage=lots")).toBeUndefined();
  expect(ringTimingFromSearch("?ringDamage=-5")).toBeUndefined();
  expect(ringTimingFromSearch("?ringDamage=1e3")).toBeUndefined();
});
