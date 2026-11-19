import {SPEND_CAPS} from "@src/durable-objects/spend-ledger/meter/SpendCaps";
import {SpendMeter} from "@src/durable-objects/spend-ledger/meter/SpendMeter";

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

  expect(meter.alertsDue()).toEqual([]);
  for (let day = 2; day <= 12; day++) {
    meter.reserve(`december-${day}`, 900_000, Date.UTC(2026, 11, day, 12));
  }
  expect(meter.alertsDue()).toEqual([50]);
});

it("makes each alert due once, as the month's spend passes 50, 80 and 100 percent", () => {
  const meter = new SpendMeter();
  expect(meter.alertsDue()).toEqual([]);

  spendOnEachDay(meter, 900_000, {first: 1, last: 12});
  expect(meter.alertsDue()).toEqual([50]);
  meter.markAlertSent(50);
  expect(meter.alertsDue()).toEqual([]);

  spendOnEachDay(meter, 900_000, {first: 13, last: 18});
  expect(meter.alertsDue()).toEqual([80]);
  meter.markAlertSent(80);

  spendOnEachDay(meter, 900_000, {first: 19, last: 22});
  meter.reserve("day-23", 200_000, noonOnNovember(23));
  expect(meter.alertsDue()).toEqual([100]);
});

it("makes the 100 percent alert due when a request is refused for crossing the monthly cap, though spend stops short of it", () => {
  const meter = new SpendMeter();
  spendOnEachDay(meter, 900_000, {first: 1, last: 21});
  meter.markAlertSent(50);
  meter.markAlertSent(80);
  expect(meter.alertsDue()).toEqual([]);

  expect(meter.reserve("crosses", 900_000, noonOnNovember(22))).toBe("reserved");
  expect(meter.reserve("refused", 900_000, noonOnNovember(23))).toBe("paused");

  expect(meter.spentThisMonth()).toBeLessThan(SPEND_CAPS.monthlyMicrodollars);
  expect(meter.alertsDue()).toEqual([100]);
});

it("makes only the 100 percent alert due when one oversized request stops AI early in the month", () => {
  const meter = new SpendMeter();

  expect(meter.reserve("oversized", SPEND_CAPS.monthlyMicrodollars + 1, NOON)).toBe("paused");

  expect(meter.alertsDue()).toEqual([100]);
});

it("does not make the 100 percent alert due when only the daily cap stopped AI", () => {
  const meter = new SpendMeter();
  meter.reserve("first", 900_000, NOON);

  expect(meter.reserve("second", 900_000, NOON)).toBe("paused");

  expect(meter.alertsDue()).toEqual([]);
});

it("reports what has been spent this month, as settled", () => {
  const meter = new SpendMeter();
  meter.reserve("first", 600_000, NOON);
  meter.reserve("second", 300_000, MIDNIGHT);
  meter.settle("second", 100_000, MIDNIGHT);

  expect(meter.spentThisMonth()).toBe(700_000);
});

it("keeps an alert due until it is marked sent, so a failed delivery is tried again", () => {
  const meter = new SpendMeter();
  spendOnEachDay(meter, 900_000, {first: 1, last: 12});

  expect(meter.alertsDue()).toEqual([50]);
  expect(meter.alertsDue()).toEqual([50]);
  expect(new SpendMeter(meter.toState()).alertsDue()).toEqual([50]);
});

it("lists every alert due when one spend passes several thresholds, lowest first", () => {
  const meter = new SpendMeter();
  spendOnEachDay(meter, 900_000, {first: 1, last: 18});

  expect(meter.alertsDue()).toEqual([50, 80]);
});

it("marks one alert sent without marking the others", () => {
  const meter = new SpendMeter();
  spendOnEachDay(meter, 900_000, {first: 1, last: 18});

  meter.markAlertSent(50);

  expect(meter.alertsDue()).toEqual([80]);
});

it("makes the alerts due again in the next month", () => {
  const meter = new SpendMeter();
  spendOnEachDay(meter, 900_000, {first: 1, last: 12});
  meter.markAlertSent(50);

  for (let day = 1; day <= 12; day++) {
    meter.reserve(`december-${day}`, 900_000, Date.UTC(2026, 11, day, 12));
  }

  expect(meter.alertsDue()).toEqual([50]);
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
