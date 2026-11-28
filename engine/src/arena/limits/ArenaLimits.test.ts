import {ARENA_LIMITS} from "@gunsmith/engine/arena/limits/ArenaLimits";

it.each([
  ["width", ARENA_LIMITS.width],
  ["height", ARENA_LIMITS.height],
])("allows at least one %s and no fewer than it forbids", (_name, range) => {
  expect(range.min).toBeGreaterThanOrEqual(1);
  expect(range.max).toBeGreaterThanOrEqual(range.min);
});

it("keeps the floor share a fraction of the tiles, with some floor asked for", () => {
  expect(ARENA_LIMITS.floorShare.min).toBeGreaterThan(0);
  expect(ARENA_LIMITS.floorShare.max).toBeLessThanOrEqual(1);
  expect(ARENA_LIMITS.floorShare.max).toBeGreaterThanOrEqual(ARENA_LIMITS.floorShare.min);
});
