import {utcDay} from "@src/ai/utc/UtcDay";

it("changes at 00:00 UTC, not a millisecond before", () => {
  const lastMillisecond = Date.UTC(2026, 10, 17, 23, 59, 59, 999);
  const midnight = Date.UTC(2026, 10, 18);

  expect(utcDay(midnight)).toBe(utcDay(lastMillisecond) + 1);
});

it("is the same all through a day", () => {
  expect(utcDay(Date.UTC(2026, 10, 17, 0))).toBe(utcDay(Date.UTC(2026, 10, 17, 23)));
});
