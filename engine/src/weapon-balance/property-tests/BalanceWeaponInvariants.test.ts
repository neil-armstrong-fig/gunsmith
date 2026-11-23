import fc from "fast-check";
import {balanceWeapon} from "@gunsmith/engine/weapon-balance/BalanceWeapon";
import {withinLimits} from "@gunsmith/engine/weapon-balance/limits/WithinLimits";
import {STAT_NAMES} from "@gunsmith/engine/power-rating/types/StatName";
import type {StatName} from "@gunsmith/engine/power-rating/types/StatName";
import type {StatPreference} from "@gunsmith/engine/weapon-balance/types/StatPreference";
import type {WeaponStats} from "@gunsmith/engine/power-rating/types/WeaponStats";

/**
 * What must hold for every weapon and every preference, not only the ones someone wrote down. A unit test (`BalanceWeapon.test.ts`)
 * says what one weapon becomes; this draws random weapons and preferences and says what is true of every result. When a property
 * fails, fast-check shrinks the weapon to the smallest one that still breaks it and prints a seed to replay it.
 *
 * Deliberately outside `pnpm checks`: a fresh seed each run means a failure is not reproducible from the same commit
 * (`vitest.config.ts`). Run it with `pnpm test:properties`; `PROPERTY_TEST_RUNS` sets how many cases each property gets.
 *
 * The ranges and the damage cap below are written out again rather than read from `STAT_RANGES` and `MAX_DAMAGE_PER_SECOND`, so a
 * mistake there cannot hide here. The power budget is not (it would mean writing the rating out a second time): `limits/WithinPowerBudget.test.ts`
 * and `BalanceWeapon.test.ts` carry it.
 */
const RUNS = Number(process.env["PROPERTY_TEST_RUNS"] ?? 100);
const TOLERANCE = 1e-9;

interface BalanceCase {
  stats: WeaponStats;
  preference: StatPreference;
}

it("ends every weapon inside every limit", () => {
  fc.assert(
    fc.property(balanceCases(), ({stats, preference}) => {
      expect(withinLimits(balanceWeapon({stats, preference}))).toBe(true);
    }),
    {numRuns: RUNS},
  );
});

it("never deals more than 150 damage a second, counted here without the limits it checks", () => {
  fc.assert(
    fc.property(balanceCases(), ({stats, preference}) => {
      const balanced = balanceWeapon({stats, preference});

      expect(balanced.bulletDamage / balanced.fireIntervalSeconds).toBeLessThanOrEqual(150 + TOLERANCE);
    }),
    {numRuns: RUNS},
  );
});

it("ends every number inside its range", () => {
  fc.assert(
    fc.property(balanceCases(), ({stats, preference}) => {
      const balanced = balanceWeapon({stats, preference});

      expect(balanced.bulletDamage).toBeGreaterThanOrEqual(1);
      expect(balanced.bulletDamage).toBeLessThanOrEqual(100);
      expect(balanced.fireIntervalSeconds).toBeGreaterThanOrEqual(0.05);
      expect(balanced.fireIntervalSeconds).toBeLessThanOrEqual(2);
      expect(balanced.bulletSpeed).toBeGreaterThanOrEqual(5);
      expect(balanced.bulletSpeed).toBeLessThanOrEqual(60);
      expect(balanced.magazineSize).toBeGreaterThanOrEqual(1);
      expect(balanced.magazineSize).toBeLessThanOrEqual(60);
      expect(balanced.reloadSeconds).toBeGreaterThanOrEqual(0.5);
      expect(balanced.reloadSeconds).toBeLessThanOrEqual(5);
      expect(balanced.startingReserve).toBeGreaterThanOrEqual(0);
      expect(balanced.startingReserve).toBeLessThanOrEqual(200);
      expect(balanced.visionDegrees).toBeGreaterThanOrEqual(50);
      expect(balanced.visionDegrees).toBeLessThanOrEqual(130);
      expect(balanced.visionRange).toBeGreaterThanOrEqual(6);
      expect(balanced.visionRange).toBeLessThanOrEqual(20);
    }),
    {numRuns: RUNS},
  );
});

it("keeps the magazine and the reserve as whole rounds", () => {
  fc.assert(
    fc.property(balanceCases(), ({stats, preference}) => {
      const balanced = balanceWeapon({stats, preference});

      expect(Number.isInteger(balanced.magazineSize)).toBe(true);
      expect(Number.isInteger(balanced.startingReserve)).toBe(true);
    }),
    {numRuns: RUNS},
  );
});

it("never makes any stat stronger than the request had it", () => {
  fc.assert(
    fc.property(balanceCases(), ({stats, preference}) => {
      const asked = strengthsOf(stats);
      const balanced = strengthsOf(balanceWeapon({stats, preference}));

      for (const stat of STAT_NAMES) {
        expect(balanced[stat], stat).toBeLessThanOrEqual(asked[stat] + TOLERANCE);
      }
    }),
    {numRuns: RUNS},
  );
});

it("leaves a weapon that is already inside the limits exactly as it was", () => {
  fc.assert(
    fc.property(balanceCases(), ({stats, preference}) => {
      fc.pre(withinLimits(stats));

      expect(balanceWeapon({stats, preference})).toEqual(stats);
    }),
    {numRuns: RUNS},
  );
});

it("gives the same weapon for the same request", () => {
  fc.assert(
    fc.property(balanceCases(), ({stats, preference}) => {
      expect(balanceWeapon({stats, preference})).toEqual(balanceWeapon({stats, preference}));
    }),
    {numRuns: RUNS},
  );
});

it("never lowers a stat when the player promotes it", () => {
  fc.assert(
    fc.property(balanceCases(), fc.constantFrom(...STAT_NAMES), ({stats, preference}, stat) => {
      const base = strengthsOf(balanceWeapon({stats, preference}));
      const promoted = strengthsOf(balanceWeapon({stats, preference: promote(preference, stat)}));

      expect(promoted[stat]).toBeGreaterThanOrEqual(base[stat] * (1 - TOLERANCE));
    }),
    {numRuns: RUNS},
  );
});

/** A weapon anywhere in the ranges, and a preference that favours, sacrifices or ignores each stat. */
function balanceCases(): fc.Arbitrary<BalanceCase> {
  return fc.record({stats: weaponStats(), preference: preferences()});
}

function weaponStats(): fc.Arbitrary<WeaponStats> {
  return fc.record({
    bulletDamage: fc.double({min: 1, max: 100, noNaN: true}),
    fireIntervalSeconds: fc.double({min: 0.05, max: 2, noNaN: true}),
    bulletSpeed: fc.double({min: 5, max: 60, noNaN: true}),
    magazineSize: fc.integer({min: 1, max: 60}),
    reloadSeconds: fc.double({min: 0.5, max: 5, noNaN: true}),
    startingReserve: fc.integer({min: 0, max: 200}),
    visionDegrees: fc.double({min: 50, max: 130, noNaN: true}),
    visionRange: fc.double({min: 6, max: 20, noNaN: true}),
  });
}

function preferences(): fc.Arbitrary<StatPreference> {
  return fc
    .array(fc.constantFrom("favoured", "sacrificed", "neither"), {
      minLength: STAT_NAMES.length,
      maxLength: STAT_NAMES.length,
    })
    .map(wishes => {
      return {
        favoured: STAT_NAMES.filter((_stat, index) => wishes[index] === "favoured"),
        sacrificed: STAT_NAMES.filter((_stat, index) => wishes[index] === "sacrificed"),
      };
    });
}

function promote(preference: StatPreference, stat: StatName): StatPreference {
  if (preference.sacrificed.includes(stat)) {
    return {favoured: preference.favoured, sacrificed: preference.sacrificed.filter(other => other !== stat)};
  }

  if (preference.favoured.includes(stat)) {
    return preference;
  }

  return {favoured: [...preference.favoured, stat], sacrificed: preference.sacrificed};
}

/** Each stat as a number where bigger is stronger: the interval and the reload turned round. */
function strengthsOf(stats: WeaponStats): Record<StatName, number> {
  return {
    damage: stats.bulletDamage,
    fireRate: 1 / stats.fireIntervalSeconds,
    bulletSpeed: stats.bulletSpeed,
    magazineSize: stats.magazineSize,
    reloadSpeed: 1 / stats.reloadSeconds,
    reserve: stats.startingReserve,
    visionCone: stats.visionDegrees,
    visionRange: stats.visionRange,
  };
}
