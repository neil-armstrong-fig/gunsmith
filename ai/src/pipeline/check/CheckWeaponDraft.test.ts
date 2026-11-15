import {checkWeaponDraft} from "@gunsmith/ai/pipeline/check/CheckWeaponDraft";

const RIFLE = {
  name: "Proof Rifle",
  bulletDamage: 25,
  fireIntervalSeconds: 0.2,
  bulletSpeed: 20,
  magazineSize: 12,
  reloadSeconds: 1.5,
  startingReserve: 36,
};

const MAXIMUM = {
  name: "Everything",
  bulletDamage: 100,
  fireIntervalSeconds: 0.05,
  bulletSpeed: 60,
  magazineSize: 60,
  reloadSeconds: 0.5,
  startingReserve: 200,
};

it("passes a weapon inside the limits through validate, balance and rate, unchanged", () => {
  expect(checkWeaponDraft(RIFLE)).toEqual({ok: true, weapon: RIFLE, nodes: ["validate", "balance", "rate"]});
});

it("balances a weapon over the limits instead of refusing it", () => {
  const check = checkWeaponDraft(MAXIMUM);

  expect(check.ok).toBe(true);
  expect(check.nodes).toEqual(["validate", "balance", "rate"]);
  expect(check.ok ? check.weapon.bulletDamage : 0).toBeLessThan(100);
});

it("balances by the preference the model gave with the weapon", () => {
  const neutral = checkWeaponDraft(MAXIMUM);
  const favouring = checkWeaponDraft({...MAXIMUM, preference: {favoured: ["damage"], sacrificed: []}});

  expect(favouring.ok ? favouring.weapon.bulletDamage : 0).toBeGreaterThan(
    neutral.ok ? neutral.weapon.bulletDamage : 100,
  );
});

it("does not put the preference into the weapon", () => {
  const check = checkWeaponDraft({...RIFLE, preference: {favoured: ["damage"], sacrificed: []}});

  expect(check.ok ? Object.keys(check.weapon).sort() : []).toEqual(Object.keys(RIFLE).sort());
});

it("stops at validate when the answer is not a valid weapon, and says so", () => {
  const check = checkWeaponDraft({...RIFLE, bulletDamage: 9999});

  expect(check).toEqual({
    ok: false,
    errors: ["bulletDamage: Too big: expected number to be <=100"],
    nodes: ["validate"],
  });
});

it("stops at validate when the preference names a stat there is not", () => {
  const check = checkWeaponDraft({...RIFLE, preference: {favoured: ["accuracy"], sacrificed: []}});

  expect(check.ok).toBe(false);
  expect(check.nodes).toEqual(["validate"]);
  expect(check.ok ? [] : check.errors.join(" ")).toContain("preference.favoured");
});
