import {powerRatingOf} from "@gunsmith/engine/power-rating/PowerRatingOf";
import {RIFLE_STATS} from "@gunsmith/engine/power-rating/testing/RifleStats";
import {STRONGEST_STATS} from "@gunsmith/engine/power-rating/testing/StrongestStats";
import {WEAKEST_STATS} from "@gunsmith/engine/power-rating/testing/WeakestStats";
import type {WeaponStats} from "@gunsmith/engine/power-rating/types/WeaponStats";

describe("at the extremes", () => {
  it("rates a weapon with every stat at its weakest at 0", () => {
    expect(powerRatingOf(WEAKEST_STATS)).toBeCloseTo(0, 9);
  });

  it("rates a weapon with every stat at its strongest at 1", () => {
    expect(powerRatingOf(STRONGEST_STATS)).toBeCloseTo(1, 9);
  });
});

describe("by what each stat is worth", () => {
  const STRONGER: [string, Partial<WeaponStats>][] = [
    ["more damage", {bulletDamage: 30}],
    ["a shorter interval between shots", {fireIntervalSeconds: 0.15}],
    ["a faster bullet", {bulletSpeed: 25}],
    ["a bigger magazine", {magazineSize: 15}],
    ["a shorter reload", {reloadSeconds: 1.2}],
    ["a bigger reserve", {startingReserve: 50}],
  ];

  it.each(STRONGER)("rates a weapon higher for %s", (_name, change) => {
    expect(powerRatingOf({...RIFLE_STATS, ...change})).toBeGreaterThan(powerRatingOf(RIFLE_STATS));
  });

  it("adds up the stats by what each is worth, so damage moves the rating more than the reserve does", () => {
    const damageFromWeakest = powerRatingOf({...WEAKEST_STATS, bulletDamage: 100});
    const reserveFromWeakest = powerRatingOf({...WEAKEST_STATS, startingReserve: 200});

    expect(damageFromWeakest).toBeGreaterThan(reserveFromWeakest);
  });
});
