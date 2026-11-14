import {validateWeaponDraft} from "@gunsmith/ai/pipeline/check/validate/ValidateWeaponDraft";

const RIFLE = {
  name: "Proof Rifle",
  bulletDamage: 24,
  fireIntervalSeconds: 0.2,
  bulletSpeed: 20,
  magazineSize: 12,
  reloadSeconds: 1.5,
  startingReserve: 36,
};

it("returns the weapon when the answer fits the schema", () => {
  expect(validateWeaponDraft(RIFLE)).toEqual({ok: true, weapon: RIFLE});
});

it("names the field and the problem when a stat is over its cap", () => {
  const result = validateWeaponDraft({...RIFLE, bulletDamage: 9999});

  expect(result).toEqual({ok: false, errors: ["bulletDamage: Too big: expected number to be <=100"]});
});

it("lists every problem, not only the first", () => {
  const result = validateWeaponDraft({...RIFLE, bulletDamage: 0, reloadSeconds: 99});

  expect(result.ok).toBe(false);
  expect(result.ok ? [] : result.errors.map(error => error.split(":")[0])).toEqual(["bulletDamage", "reloadSeconds"]);
});

it("refuses a field the weapon does not have, and says which", () => {
  const result = validateWeaponDraft({...RIFLE, rateOfFire: 500});

  expect(result.ok).toBe(false);
  expect(result.ok ? [] : result.errors).toEqual(['weapon: Unrecognized key: "rateOfFire"']);
});

it("names the fields that are missing", () => {
  const result = validateWeaponDraft({name: "Proof Rifle"});

  expect(result.ok ? [] : result.errors.map(error => error.split(":")[0])).toEqual([
    "bulletDamage",
    "fireIntervalSeconds",
    "bulletSpeed",
    "magazineSize",
    "reloadSeconds",
    "startingReserve",
  ]);
});

it("says there was no weapon when the answer is nothing", () => {
  const result = validateWeaponDraft(undefined);

  expect(result.ok).toBe(false);
  expect(result.ok ? [] : result.errors).toEqual(["weapon: Invalid input: expected object, received undefined"]);
});

it("shortens a long message, so words the model or player chose cannot fill the list", () => {
  const result = validateWeaponDraft({...RIFLE, ["x".repeat(500)]: 1});

  expect(result.ok ? [] : result.errors.every(error => error.length <= 120)).toBe(true);
});
