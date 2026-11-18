import {nextUtcMidnight} from "@src/ai/spend/meter/periods/NextUtcMidnight";

it("is the coming 00:00 UTC, whatever the time of day", () => {
  expect(nextUtcMidnight(Date.UTC(2026, 10, 17, 12, 30))).toBe(Date.UTC(2026, 10, 18));
});

it("is a whole day on when it is already 00:00 UTC exactly", () => {
  expect(nextUtcMidnight(Date.UTC(2026, 10, 18))).toBe(Date.UTC(2026, 10, 19));
});

it("crosses the end of a month", () => {
  expect(nextUtcMidnight(Date.UTC(2026, 10, 30, 23))).toBe(Date.UTC(2026, 11, 1));
});
