import {clampToRanges} from "@gunsmith/ai/pipeline/check/balance/clamping/ClampToRanges";
import type {WeaponDraft} from "@gunsmith/ai/pipeline/weapon/WeaponDraft";

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

it("leaves a weapon whose stats are all inside their ranges as it is", () => {
  expect(clampToRanges(RIFLE)).toEqual(RIFLE);
});

it("brings a stat past the strong end of its range to that end", () => {
  const clamped = clampToRanges({
    ...RIFLE,
    bulletDamage: 9999,
    fireIntervalSeconds: 0.001,
    bulletSpeed: 500,
    magazineSize: 100,
    reloadSeconds: 0.01,
    startingReserve: 5000,
    visionDegrees: 400,
    visionRange: 90,
  });

  expect(clamped).toEqual({
    ...RIFLE,
    bulletDamage: 100,
    fireIntervalSeconds: 0.05,
    bulletSpeed: 60,
    magazineSize: 60,
    reloadSeconds: 0.5,
    startingReserve: 200,
    visionDegrees: 130,
    visionRange: 20,
  });
});

it("brings a stat past the weak end of its range up to that end, so a weapon is never useless", () => {
  const clamped = clampToRanges({
    ...RIFLE,
    bulletDamage: 0,
    fireIntervalSeconds: 30,
    bulletSpeed: 1,
    magazineSize: 0,
    reloadSeconds: 60,
    startingReserve: -4,
    visionDegrees: 10,
    visionRange: -2,
  });

  expect(clamped).toEqual({
    ...RIFLE,
    bulletDamage: 1,
    fireIntervalSeconds: 2,
    bulletSpeed: 5,
    magazineSize: 1,
    reloadSeconds: 5,
    startingReserve: 0,
    visionDegrees: 50,
    visionRange: 6,
  });
});

it("keeps the name, and does not change the weapon it was given", () => {
  const given = {...RIFLE, magazineSize: 100};

  const clamped = clampToRanges(given);

  expect(clamped.name).toBe("Proof Rifle");
  expect(given.magazineSize).toBe(100);
});
