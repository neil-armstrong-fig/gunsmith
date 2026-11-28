import {withinDamageCap} from "@gunsmith/engine/weapon/balance/limits/WithinDamageCap";
import {WEAKEST_STATS} from "@gunsmith/engine/weapon/power-rating/testing/WeakestStats";

it("is true for a weapon exactly on the cap of 150 damage a second", () => {
  expect(withinDamageCap({...WEAKEST_STATS, bulletDamage: 75, fireIntervalSeconds: 0.5})).toBe(true);
});

it("is false for a weapon a little over it", () => {
  expect(withinDamageCap({...WEAKEST_STATS, bulletDamage: 76, fireIntervalSeconds: 0.5})).toBe(false);
});

it("is true for the slow, heavy end and the fast, weak end", () => {
  expect(withinDamageCap({...WEAKEST_STATS, bulletDamage: 100, fireIntervalSeconds: 2})).toBe(true);
  expect(withinDamageCap({...WEAKEST_STATS, bulletDamage: 1, fireIntervalSeconds: 0.05})).toBe(true);
});

it("does not look at any other stat", () => {
  expect(withinDamageCap({...WEAKEST_STATS, bulletDamage: 100, fireIntervalSeconds: 0.5, magazineSize: 60})).toBe(
    false,
  );
});
