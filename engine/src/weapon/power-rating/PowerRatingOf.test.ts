import {powerRatingOf} from "@gunsmith/engine/weapon/power-rating/PowerRatingOf";
import {MARKSMAN_RIFLE_STATS} from "@gunsmith/engine/weapon/power-rating/testing/MarksmanRifleStats";
import {RIFLE_STATS} from "@gunsmith/engine/weapon/power-rating/testing/RifleStats";
import {STRONGEST_STATS} from "@gunsmith/engine/weapon/power-rating/testing/StrongestStats";
import {WEAKEST_STATS} from "@gunsmith/engine/weapon/power-rating/testing/WeakestStats";
import type {WeaponStats} from "@gunsmith/engine/weapon/power-rating/types/WeaponStats";

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
    ["a wider vision cone", {visionDegrees: 110}],
    ["a longer vision range", {visionRange: 16}],
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

describe("by what vision is worth", () => {
  it("rates a weapon with only its vision cone at its strongest at the cone's share, 0.05", () => {
    expect(powerRatingOf({...WEAKEST_STATS, visionDegrees: 130})).toBeCloseTo(0.05, 9);
  });

  it("rates a weapon with only its vision range at its strongest at the range's share, 0.1, because reach also limits where a player can shoot", () => {
    expect(powerRatingOf({...WEAKEST_STATS, visionRange: 20})).toBeCloseTo(0.1, 9);
  });

  it("rates a weapon with all its vision and nothing else at 0.15", () => {
    expect(powerRatingOf({...WEAKEST_STATS, visionDegrees: 130, visionRange: 20})).toBeCloseTo(0.15, 9);
  });
});

describe("for the engine's own weapons", () => {
  it("rates the rifle at about 0.53, the marksman rifle at about 0.49 and the submachine gun at about 0.55", () => {
    const submachineGun: WeaponStats = {
      bulletDamage: 12,
      fireIntervalSeconds: 0.1,
      bulletSpeed: 18,
      magazineSize: 30,
      reloadSeconds: 1.8,
      startingReserve: 60,
      visionDegrees: 110,
      visionRange: 9,
    };

    expect(powerRatingOf(RIFLE_STATS)).toBeCloseTo(0.5315, 3);
    expect(powerRatingOf(MARKSMAN_RIFLE_STATS)).toBeCloseTo(0.4877, 3);
    expect(powerRatingOf(submachineGun)).toBeCloseTo(0.5537, 3);
  });
});
