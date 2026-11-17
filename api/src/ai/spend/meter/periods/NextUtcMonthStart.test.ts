import {nextUtcMonthStart} from "@src/ai/spend/meter/periods/NextUtcMonthStart";

it("is 00:00 UTC on the first of the next month", () => {
  expect(nextUtcMonthStart(Date.UTC(2026, 10, 17, 12))).toBe(Date.UTC(2026, 11, 1));
});

it("crosses the end of a year", () => {
  expect(nextUtcMonthStart(Date.UTC(2026, 11, 31, 23, 59))).toBe(Date.UTC(2027, 0, 1));
});

it("is a month on when it is already the first at 00:00 UTC", () => {
  expect(nextUtcMonthStart(Date.UTC(2026, 11, 1))).toBe(Date.UTC(2027, 0, 1));
});
