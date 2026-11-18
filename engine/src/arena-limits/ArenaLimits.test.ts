import {ARENA_LIMITS} from "@gunsmith/engine/arena-limits/ArenaLimits";

it.each([
  ["width", ARENA_LIMITS.width],
  ["height", ARENA_LIMITS.height],
])("allows at least one %s and no fewer than it forbids", (_name, range) => {
  expect(range.min).toBeGreaterThanOrEqual(1);
  expect(range.max).toBeGreaterThanOrEqual(range.min);
});
