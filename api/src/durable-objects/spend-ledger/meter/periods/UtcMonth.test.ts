import {utcMonth} from "@src/durable-objects/spend-ledger/meter/periods/UtcMonth";

it("changes at 00:00 UTC on the first, not a millisecond before", () => {
  const lastMillisecond = Date.UTC(2026, 10, 30, 23, 59, 59, 999);
  const firstMoment = Date.UTC(2026, 11, 1);

  expect(utcMonth(firstMoment)).toBe(utcMonth(lastMillisecond) + 1);
});

it("counts on across a year, so December is followed by January", () => {
  expect(utcMonth(Date.UTC(2027, 0, 1))).toBe(utcMonth(Date.UTC(2026, 11, 31)) + 1);
});

it("is the same all through a month", () => {
  expect(utcMonth(Date.UTC(2026, 10, 1))).toBe(utcMonth(Date.UTC(2026, 10, 30, 23)));
});
