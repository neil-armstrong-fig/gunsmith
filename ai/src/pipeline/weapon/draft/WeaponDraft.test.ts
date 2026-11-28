import {weaponDraftSchema} from "@gunsmith/ai/pipeline/weapon/draft/WeaponDraft";
import type {WeaponDraft} from "@gunsmith/ai/pipeline/weapon/draft/WeaponDraft";

const RIFLE: WeaponDraft = {
  name: "Proof Rifle",
  bulletDamage: 25,
  fireIntervalSeconds: 0.2,
  bulletSpeed: 20,
  magazineSize: 12,
  reloadSeconds: 1.5,
  startingReserve: 36,
  visionDegrees: 90,
  visionRange: 12,
};

it("accepts a weapon in range", () => {
  expect(weaponDraftSchema.safeParse(RIFLE).success).toBe(true);
});

it("accepts every stat at its floor", () => {
  const floor = {
    name: "Ab",
    bulletDamage: 1,
    fireIntervalSeconds: 0.05,
    bulletSpeed: 5,
    magazineSize: 1,
    reloadSeconds: 0.5,
    startingReserve: 0,
    visionDegrees: 50,
    visionRange: 6,
  };

  expect(weaponDraftSchema.safeParse(floor).success).toBe(true);
});

it("accepts every stat at its cap", () => {
  const cap = {
    name: "A".repeat(24),
    bulletDamage: 100,
    fireIntervalSeconds: 2,
    bulletSpeed: 60,
    magazineSize: 60,
    reloadSeconds: 5,
    startingReserve: 200,
    visionDegrees: 130,
    visionRange: 20,
  };

  expect(weaponDraftSchema.safeParse(cap).success).toBe(true);
});

it("refuses a damage above the cap", () => {
  expect(weaponDraftSchema.safeParse({...RIFLE, bulletDamage: 9999}).success).toBe(false);
});

it("refuses a fire interval below the floor", () => {
  expect(weaponDraftSchema.safeParse({...RIFLE, fireIntervalSeconds: 0.01}).success).toBe(false);
});

it("refuses a vision cone outside 50 to 130 degrees on either side", () => {
  expect(weaponDraftSchema.safeParse({...RIFLE, visionDegrees: 49.9}).success).toBe(false);
  expect(weaponDraftSchema.safeParse({...RIFLE, visionDegrees: 130.1}).success).toBe(false);
});

it("refuses a vision range outside 6 to 20 tiles on either side", () => {
  expect(weaponDraftSchema.safeParse({...RIFLE, visionRange: 5.9}).success).toBe(false);
  expect(weaponDraftSchema.safeParse({...RIFLE, visionRange: 20.1}).success).toBe(false);
});

it("refuses a weapon with no vision, because the model is asked for it like every other stat", () => {
  const {visionDegrees: _degrees, ...withoutDegrees} = RIFLE;
  const {visionRange: _range, ...withoutRange} = RIFLE;

  expect(weaponDraftSchema.safeParse(withoutDegrees).success).toBe(false);
  expect(weaponDraftSchema.safeParse(withoutRange).success).toBe(false);
});

it("refuses a magazine that is not a whole number of rounds", () => {
  expect(weaponDraftSchema.safeParse({...RIFLE, magazineSize: 12.5}).success).toBe(false);
});

it("refuses a field the schema does not have, rather than dropping it", () => {
  expect(weaponDraftSchema.safeParse({...RIFLE, rateOfFire: 500}).success).toBe(false);
});

it("refuses a missing stat", () => {
  const {reloadSeconds: _reloadSeconds, ...withoutReload} = RIFLE;

  expect(weaponDraftSchema.safeParse(withoutReload).success).toBe(false);
});

it("refuses a name over 24 characters", () => {
  expect(weaponDraftSchema.safeParse({...RIFLE, name: "A".repeat(25)}).success).toBe(false);
});

it("refuses a name too short to be a name", () => {
  expect(weaponDraftSchema.safeParse({...RIFLE, name: "A"}).success).toBe(false);
  expect(weaponDraftSchema.safeParse({...RIFLE, name: ""}).success).toBe(false);
});

it("refuses a short name with markup in it, which only the name pattern can catch", () => {
  expect(weaponDraftSchema.safeParse({...RIFLE, name: "<b>Rifle</b>"}).success).toBe(false);
});

it("refuses a name with a template brace or a backtick in it", () => {
  expect(weaponDraftSchema.safeParse({...RIFLE, name: "Rifle {{x}}"}).success).toBe(false);
  expect(weaponDraftSchema.safeParse({...RIFLE, name: "Rifle `x`"}).success).toBe(false);
});

it("accepts an accented name with an apostrophe and a hyphen", () => {
  expect(weaponDraftSchema.safeParse({...RIFLE, name: "Fusil d'Élite Mk-2"}).success).toBe(true);
});
