import {goodnessOf} from "@gunsmith/engine/power-rating/goodness/GoodnessOf";
import {statsAt} from "@gunsmith/engine/power-rating/goodness/StatsAt";
import {MARKSMAN_RIFLE_STATS} from "@gunsmith/engine/power-rating/testing/MarksmanRifleStats";
import {RIFLE_STATS} from "@gunsmith/engine/power-rating/testing/RifleStats";
import {STRONGEST_STATS} from "@gunsmith/engine/power-rating/testing/StrongestStats";
import {WEAKEST_STATS} from "@gunsmith/engine/power-rating/testing/WeakestStats";
import type {StatNumbers} from "@gunsmith/engine/power-rating/types/StatNumbers";
import type {WeaponStats} from "@gunsmith/engine/power-rating/types/WeaponStats";

const ALL_ZERO: StatNumbers = {
  damage: 0,
  fireRate: 0,
  bulletSpeed: 0,
  magazineSize: 0,
  reloadSpeed: 0,
  reserve: 0,
  visionCone: 0,
  visionRange: 0,
};
const ALL_ONE: StatNumbers = {
  damage: 1,
  fireRate: 1,
  bulletSpeed: 1,
  magazineSize: 1,
  reloadSpeed: 1,
  reserve: 1,
  visionCone: 1,
  visionRange: 1,
};

it("gives the weakest value of every stat at goodness 0", () => {
  expectStatsClose(statsAt(ALL_ZERO), WEAKEST_STATS);
});

it("gives the strongest value of every stat at goodness 1", () => {
  expectStatsClose(statsAt(ALL_ONE), STRONGEST_STATS);
});

it("undoes goodnessOf for the rifle", () => {
  expectStatsClose(statsAt(goodnessOf(RIFLE_STATS)), RIFLE_STATS);
});

it("undoes goodnessOf for the marksman rifle", () => {
  expectStatsClose(statsAt(goodnessOf(MARKSMAN_RIFLE_STATS)), MARKSMAN_RIFLE_STATS);
});

function expectStatsClose(actual: WeaponStats, expected: WeaponStats): void {
  expect(actual.bulletDamage).toBeCloseTo(expected.bulletDamage, 6);
  expect(actual.fireIntervalSeconds).toBeCloseTo(expected.fireIntervalSeconds, 6);
  expect(actual.bulletSpeed).toBeCloseTo(expected.bulletSpeed, 6);
  expect(actual.magazineSize).toBeCloseTo(expected.magazineSize, 6);
  expect(actual.reloadSeconds).toBeCloseTo(expected.reloadSeconds, 6);
  expect(actual.startingReserve).toBeCloseTo(expected.startingReserve, 6);
  expect(actual.visionDegrees).toBeCloseTo(expected.visionDegrees, 6);
  expect(actual.visionRange).toBeCloseTo(expected.visionRange, 6);
}
