import {SPEND_CAPS} from "@src/ai/spend/meter/SpendCaps";
import {SpendMeter} from "@src/ai/spend/meter/SpendMeter";

const NOON = Date.UTC(2026, 10, 17, 12);
const MIDNIGHT = Date.UTC(2026, 10, 18);
const FIRST_OF_DECEMBER = Date.UTC(2026, 11, 1);

it("starts with AI on", () => {
  const meter = new SpendMeter();

  expect(meter.status(NOON)).toEqual({on: true});
});

it("reserves requests that fit under the daily cap", () => {
  const meter = new SpendMeter();

  expect(meter.reserve("first", 400_000, NOON)).toBe("reserved");
  expect(meter.reserve("second", 400_000, NOON)).toBe("reserved");
  expect(meter.status(NOON)).toEqual({on: true});
});

it("turns AI off until 00:00 UTC when a request would cross the daily cap, and keeps it off for the day", () => {
  const meter = new SpendMeter();
  meter.reserve("nearly-all", SPEND_CAPS.dailyMicrodollars - 1_000, NOON);

  expect(meter.reserve("crosses", 2_000, NOON)).toBe("paused");
  expect(meter.status(NOON)).toEqual({on: false, returnsAt: MIDNIGHT});
  expect(meter.reserve("tiny", 1, NOON)).toBe("paused");
});

it("turns AI back on at 00:00 UTC after a daily stop", () => {
  const meter = new SpendMeter();
  meter.reserve("nearly-all", SPEND_CAPS.dailyMicrodollars - 1_000, NOON);
  meter.reserve("crosses", 2_000, NOON);

  expect(meter.status(MIDNIGHT)).toEqual({on: true});
  expect(meter.reserve("next-day", 400_000, MIDNIGHT)).toBe("reserved");
});

it("turns AI off until the first of the next month when a request would cross the monthly cap", () => {
  const meter = new SpendMeter();
  spendOnEachDay(meter, 900_000, {first: 1, last: 22});

  expect(meter.reserve("crosses", 300_000, noonOnNovember(23))).toBe("paused");
  expect(meter.status(noonOnNovember(23))).toEqual({on: false, returnsAt: FIRST_OF_DECEMBER});
});

it("keeps AI off through the next day after a monthly stop, where a daily stop would have ended", () => {
  const meter = new SpendMeter();
  spendOnEachDay(meter, 900_000, {first: 1, last: 22});
  meter.reserve("crosses", 300_000, noonOnNovember(23));

  expect(meter.status(noonOnNovember(24))).toEqual({on: false, returnsAt: FIRST_OF_DECEMBER});
});

it("turns AI back on on the first of the next month after a monthly stop", () => {
  const meter = new SpendMeter();
  spendOnEachDay(meter, 900_000, {first: 1, last: 22});
  meter.reserve("crosses", 300_000, noonOnNovember(23));

  expect(meter.status(FIRST_OF_DECEMBER)).toEqual({on: true});
});

it("never lets a burst of requests reserve more than the daily cap", () => {
  const meter = new SpendMeter();

  const outcomes = Array.from({length: 30}, (_, request) => meter.reserve(`request-${request}`, 100_000, NOON));

  expect(outcomes.filter(outcome => outcome === "reserved")).toHaveLength(10);
});

it("counts a retried request's estimate only once", () => {
  const meter = new SpendMeter();

  meter.reserve("same-request", 600_000, NOON);
  meter.reserve("same-request", 600_000, NOON);

  expect(meter.reserve("other", 300_000, NOON)).toBe("reserved");
});

it("replaces an estimate with the real cost once the request settles, freeing the difference", () => {
  const meter = new SpendMeter();
  meter.reserve("cheap-in-the-end", 500_000, NOON);
  meter.settle("cheap-in-the-end", 100_000, NOON);

  expect(meter.reserve("fits-now", 800_000, NOON)).toBe("reserved");
});

it("frees the month's spend as well when a request settles below its estimate", () => {
  const meter = new SpendMeter();
  spendOnEachDay(meter, 900_000, {first: 1, last: 22});
  meter.settle("day-1", 0, noonOnNovember(22));

  expect(meter.reserve("fits-now", 1_000_000, noonOnNovember(23))).toBe("reserved");
});

it("settles a request once: a second settle changes nothing", () => {
  const meter = new SpendMeter();
  meter.reserve("settled", 500_000, NOON);
  meter.settle("settled", 100_000, NOON);

  meter.settle("settled", 0, NOON);

  expect(meter.reserve("too-much", 950_000, NOON)).toBe("paused");
});

it("turns AI off when real costs overshoot the estimates past the daily cap", () => {
  const meter = new SpendMeter();
  meter.reserve("dearer-than-thought", 500_000, NOON);

  meter.settle("dearer-than-thought", SPEND_CAPS.dailyMicrodollars + 1, NOON);

  expect(meter.status(NOON)).toEqual({on: false, returnsAt: MIDNIGHT});
});

it("does not let a settle from yesterday change today's spend", () => {
  const meter = new SpendMeter();
  meter.reserve("late", 500_000, Date.UTC(2026, 10, 17, 23, 59));
  meter.reserve("today", 400_000, MIDNIGHT);

  meter.settle("late", 0, MIDNIGHT);

  expect(meter.reserve("fits-only-if-today-is-untouched", 600_001, MIDNIGHT)).toBe("paused");
});

it("does not let a settle from last month change this month's spend", () => {
  const meter = new SpendMeter();
  meter.reserve("late", 900_000, Date.UTC(2026, 10, 30, 23, 59));
  meter.reserve("december", 900_000, FIRST_OF_DECEMBER);

  meter.settle("late", 0, FIRST_OF_DECEMBER);

  expect(meter.takeAlerts()).toEqual([]);
  for (let day = 2; day <= 12; day++) {
    meter.reserve(`december-${day}`, 900_000, Date.UTC(2026, 11, day, 12));
  }
  expect(meter.takeAlerts()).toEqual([50]);
});

it("raises each alert once, as the month's spend passes 50, 80 and 100 percent", () => {
  const meter = new SpendMeter();
  expect(meter.takeAlerts()).toEqual([]);

  spendOnEachDay(meter, 900_000, {first: 1, last: 12});
  expect(meter.takeAlerts()).toEqual([50]);
  expect(meter.takeAlerts()).toEqual([]);

  spendOnEachDay(meter, 900_000, {first: 13, last: 18});
  expect(meter.takeAlerts()).toEqual([80]);

  spendOnEachDay(meter, 900_000, {first: 19, last: 22});
  meter.reserve("day-23", 200_000, noonOnNovember(23));
  expect(meter.takeAlerts()).toEqual([100]);
});

it("raises the alerts again in the next month", () => {
  const meter = new SpendMeter();
  spendOnEachDay(meter, 900_000, {first: 1, last: 12});
  meter.takeAlerts();

  for (let day = 1; day <= 12; day++) {
    meter.reserve(`december-${day}`, 900_000, Date.UTC(2026, 11, day, 12));
  }

  expect(meter.takeAlerts()).toEqual([50]);
});

it("keeps its spend, its stop and its reserved requests when rebuilt from its saved state", () => {
  const meter = new SpendMeter();
  meter.reserve("before-eviction", 600_000, NOON);
  meter.reserve("crosses", 600_000, NOON);

  const rebuilt = new SpendMeter(meter.toState());
  rebuilt.reserve("before-eviction", 600_000, NOON);

  expect(rebuilt.status(NOON)).toEqual({on: false, returnsAt: MIDNIGHT});
  expect(rebuilt.reserve("another", 1, MIDNIGHT)).toBe("reserved");
});

interface Days {
  first: number;
  last: number;
}

/** Spends `microdollars` on each day of November in `days`, so the daily cap is never the one that stops it. */
function spendOnEachDay(meter: SpendMeter, microdollars: number, days: Days): void {
  for (let day = days.first; day <= days.last; day++) {
    meter.reserve(`day-${day}`, microdollars, noonOnNovember(day));
  }
}

function noonOnNovember(day: number): number {
  return Date.UTC(2026, 10, day, 12);
}
