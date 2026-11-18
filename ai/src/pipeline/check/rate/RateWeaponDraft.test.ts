import {rateWeaponDraft} from "@gunsmith/ai/pipeline/check/rate/RateWeaponDraft";
import type {WeaponDraft} from "@gunsmith/ai/pipeline/weapon/WeaponDraft";

const RIFLE: WeaponDraft = {
  name: "Proof Rifle",
  bulletDamage: 25,
  fireIntervalSeconds: 0.2,
  bulletSpeed: 20,
  magazineSize: 12,
  reloadSeconds: 1.5,
  startingReserve: 36,
};

it("rates a weapon by the damage it deals in a second", () => {
  expect(rateWeaponDraft(RIFLE)).toEqual({ok: true, damagePerSecond: 125});
});

it("passes a weapon exactly at the cap of 150", () => {
  expect(rateWeaponDraft(dealing(30, 0.2))).toEqual({ok: true, damagePerSecond: 150});
});

it("refuses a weapon just over the cap, with the number and the way out", () => {
  const rating = rateWeaponDraft(dealing(31, 0.2));

  expect(rating).toEqual({
    ok: false,
    errors: ["weapon: 155 damage per second is over the limit of 150; lower bulletDamage or raise fireIntervalSeconds"],
  });
});

it("refuses the strongest damage with the fastest fire", () => {
  expect(rateWeaponDraft(dealing(100, 0.05)).ok).toBe(false);
});

it("passes the slow, heavy end", () => {
  expect(rateWeaponDraft(dealing(100, 2)).ok).toBe(true);
});

it("passes the fast, weak end", () => {
  expect(rateWeaponDraft(dealing(1, 0.05)).ok).toBe(true);
});

it("rounds the damage per second in its message, so a long fraction is not shown", () => {
  const rating = rateWeaponDraft(dealing(50, 0.3));

  expect(rating.ok ? [] : rating.errors[0]).toContain("166.7 damage per second");
});

it("refuses a weapon over the power budget even when it is inside the damage cap, naming the rating and the way out", () => {
  const strongEverywhere = {
    ...RIFLE,
    bulletDamage: 20.9,
    fireIntervalSeconds: 0.18,
    bulletSpeed: 41.3,
    magazineSize: 15,
    reloadSeconds: 1.1,
    startingReserve: 132,
  };

  const rating = rateWeaponDraft(strongEverywhere);

  expect(rating.ok).toBe(false);
  expect(rating.ok ? "" : rating.errors[0]).toContain("power rating");
  expect(rating.ok ? "" : rating.errors[0]).toContain("0.65");
});

it("names the damage cap first when a weapon is over both limits", () => {
  const rating = rateWeaponDraft({
    ...RIFLE,
    bulletDamage: 100,
    fireIntervalSeconds: 0.05,
    bulletSpeed: 60,
    magazineSize: 60,
    reloadSeconds: 0.5,
    startingReserve: 200,
  });

  expect(rating.ok ? [] : rating.errors).toHaveLength(2);
  expect(rating.ok ? "" : rating.errors[0]).toContain("damage per second");
});

function dealing(bulletDamage: number, fireIntervalSeconds: number): WeaponDraft {
  return {...RIFLE, bulletDamage, fireIntervalSeconds};
}
