import fc from "fast-check";
import {parseStoredArena} from "@gunsmith/engine/library-items/ParseStoredArena";
import {parseStoredWeapon} from "@gunsmith/engine/library-items/ParseStoredWeapon";
import {validateArena} from "@gunsmith/engine/arena/validation/ValidateArena";
import {STAT_RANGES} from "@gunsmith/engine/weapon/power-rating/ranges/StatRanges";
import type {WeaponStats} from "@gunsmith/engine/weapon/power-rating/types/WeaponStats";
import {withinLimits} from "@gunsmith/engine/weapon/balance/limits/WithinLimits";
import {RIFLE} from "@gunsmith/engine/weapon/weapons/Rifle";

/**
 * What must hold for anything the library hands back, not only the payloads someone wrote down: a stored value is `unknown`, so
 * neither parser may throw on it, and whatever they do accept is inside the same limits a made weapon and a drawn arena are held to.
 *
 * Deliberately outside `pnpm checks`, as the other properties are (`vitest.config.ts`): run it with `pnpm test:properties`;
 * `PROPERTY_TEST_RUNS` sets how many cases each property gets.
 */
const RUNS = Number(process.env["PROPERTY_TEST_RUNS"] ?? 100);
const STATS: readonly (keyof WeaponStats)[] = [
  "bulletDamage",
  "fireIntervalSeconds",
  "bulletSpeed",
  "magazineSize",
  "reloadSeconds",
  "startingReserve",
  "visionDegrees",
  "visionRange",
];

it("never throws on a stored weapon of any shape", () => {
  fc.assert(
    fc.property(fc.anything(), value => {
      parseStoredWeapon(value);
    }),
    {numRuns: RUNS},
  );
});

it("never throws on a stored arena of any shape", () => {
  fc.assert(
    fc.property(fc.anything(), value => {
      parseStoredArena(value);
    }),
    {numRuns: RUNS},
  );
});

it("never throws on a stored arena whose rows are text of any kind", () => {
  fc.assert(
    fc.property(fc.array(fc.string({minLength: 8, maxLength: 12}), {minLength: 5, maxLength: 12}), rows => {
      parseStoredArena({name: "Any", rows});
    }),
    {numRuns: RUNS},
  );
});

it("only ever accepts a weapon whose eight numbers are in range and together within the limits", () => {
  fc.assert(
    fc.property(storedWeapon(), value => {
      const weapon = parseStoredWeapon(value);
      if (!weapon) {
        return;
      }

      for (const stat of STATS) {
        expect(weapon[stat]).toBeGreaterThanOrEqual(STAT_RANGES[stat].min);
        expect(weapon[stat]).toBeLessThanOrEqual(STAT_RANGES[stat].max);
      }
      expect(withinLimits(weapon)).toBe(true);
    }),
    {numRuns: RUNS},
  );
});

it("gives an accepted weapon the vision it was stored with, or the rifle's when it had none", () => {
  fc.assert(
    fc.property(storedWeapon(), value => {
      const weapon = parseStoredWeapon(value);
      if (!weapon) {
        return;
      }

      expect(weapon.visionDegrees).toBe(value["visionDegrees"] ?? RIFLE.visionDegrees);
      expect(weapon.visionRange).toBe(value["visionRange"] ?? RIFLE.visionRange);
    }),
    {numRuns: RUNS},
  );
});

it("draws stored weapons both with and without each vision number, so the property above is not vacuous", () => {
  const drawn = fc.sample(storedWeapon(), 200);

  for (const stat of ["visionDegrees", "visionRange"]) {
    expect(
      drawn.some(value => stat in value),
      stat,
    ).toBe(true);
    expect(
      drawn.some(value => !(stat in value)),
      stat,
    ).toBe(true);
  }
});

it("only ever accepts an arena that validates", () => {
  fc.assert(
    fc.property(fc.array(fc.stringMatching(/^[#.]{8,14}$/), {minLength: 5, maxLength: 12}), rows => {
      const stored = parseStoredArena({name: "Any", rows});
      if (stored) {
        expect(validateArena(stored.arena)).toEqual([]);
      }
    }),
    {numRuns: RUNS},
  );
});

function storedWeapon(): fc.Arbitrary<Record<string, unknown>> {
  return fc.record(
    {
      name: fc.string({minLength: 1, maxLength: 20}),
      bulletDamage: fc.double({min: 0, max: 120, noNaN: true}),
      fireIntervalSeconds: fc.double({min: 0, max: 3, noNaN: true}),
      bulletSpeed: fc.double({min: 0, max: 70, noNaN: true}),
      magazineSize: fc.integer({min: 0, max: 70}),
      reloadSeconds: fc.double({min: 0, max: 6, noNaN: true}),
      startingReserve: fc.integer({min: 0, max: 220}),
      visionDegrees: fc.double({min: 40, max: 140, noNaN: true}),
      visionRange: fc.double({min: 4, max: 24, noNaN: true}),
    },
    {
      requiredKeys: [
        "name",
        "bulletDamage",
        "fireIntervalSeconds",
        "bulletSpeed",
        "magazineSize",
        "reloadSeconds",
        "startingReserve",
      ],
    },
  );
}
