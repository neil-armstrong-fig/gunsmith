import {roundTowardWeaker} from "@gunsmith/engine/weapon-balance/rounding/RoundTowardWeaker";
import {STRONGEST_STATS} from "@gunsmith/engine/power-rating/testing/StrongestStats";
import {WEAKEST_STATS} from "@gunsmith/engine/power-rating/testing/WeakestStats";

it("rounds damage and bullet speed down to two decimal places", () => {
  const rounded = roundTowardWeaker({...STRONGEST_STATS, bulletDamage: 47.9399, bulletSpeed: 33.339});

  expect(rounded.bulletDamage).toBe(47.93);
  expect(rounded.bulletSpeed).toBe(33.33);
});

it("rounds the magazine and the reserve down to whole rounds", () => {
  const rounded = roundTowardWeaker({...STRONGEST_STATS, magazineSize: 4.99, startingReserve: 59.9});

  expect(rounded.magazineSize).toBe(4);
  expect(rounded.startingReserve).toBe(59);
});

it("rounds the vision cone down to a whole degree and the vision range down to two decimal places, which is narrower and shorter", () => {
  const rounded = roundTowardWeaker({...STRONGEST_STATS, visionDegrees: 99.99, visionRange: 12.3499});

  expect(rounded.visionDegrees).toBe(99);
  expect(rounded.visionRange).toBe(12.34);
});

it("rounds the interval between shots and the reload up, which is weaker", () => {
  const rounded = roundTowardWeaker({...WEAKEST_STATS, fireIntervalSeconds: 0.2861, reloadSeconds: 1.2341});

  expect(rounded.fireIntervalSeconds).toBe(0.29);
  expect(rounded.reloadSeconds).toBe(1.24);
});

it("keeps every number inside its range", () => {
  const rounded = roundTowardWeaker({
    ...WEAKEST_STATS,
    magazineSize: 0.9999999,
    fireIntervalSeconds: 2.0000001,
    reloadSeconds: 5.0000001,
    visionDegrees: 49.9999,
    visionRange: 5.9999999,
  });

  expect(rounded.magazineSize).toBe(1);
  expect(rounded.fireIntervalSeconds).toBe(2);
  expect(rounded.reloadSeconds).toBe(5);
  expect(rounded.visionDegrees).toBe(50);
  expect(rounded.visionRange).toBe(6);
});
