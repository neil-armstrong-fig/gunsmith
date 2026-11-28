import {validateWeaponDraft} from "@gunsmith/ai/pipeline/weapon/check/validate/ValidateWeaponDraft";

const RIFLE = {
  name: "Proof Rifle",
  bulletDamage: 24,
  fireIntervalSeconds: 0.2,
  bulletSpeed: 20,
  magazineSize: 12,
  reloadSeconds: 1.5,
  startingReserve: 36,
  visionDegrees: 90,
  visionRange: 12,
};

it("returns the weapon when the answer fits the schema, with no preference when the model gave none", () => {
  expect(validateWeaponDraft(RIFLE)).toEqual({ok: true, weapon: RIFLE, preference: {favoured: [], sacrificed: []}});
});

it("returns the preference the model gave, apart from the weapon", () => {
  const preference = {favoured: ["damage"], sacrificed: ["reserve"]};

  expect(validateWeaponDraft({...RIFLE, preference})).toEqual({ok: true, weapon: RIFLE, preference});
});

it("refuses a preference that names a stat there is not, and says where", () => {
  const result = validateWeaponDraft({...RIFLE, preference: {favoured: ["accuracy"], sacrificed: []}});

  expect(result.ok).toBe(false);
  expect(result.ok ? [] : result.errors.map(error => error.split(":")[0])).toEqual(["preference.favoured.0"]);
});

it("accepts a stat in both lists, which the balancer counts as neither", () => {
  const preference = {favoured: ["damage"], sacrificed: ["damage"]};

  expect(validateWeaponDraft({...RIFLE, preference})).toEqual({ok: true, weapon: RIFLE, preference});
});

it.each([
  ["bulletDamage", 9999],
  ["bulletDamage", 0],
  ["fireIntervalSeconds", 0.01],
  ["fireIntervalSeconds", 5],
  ["bulletSpeed", 500],
  ["bulletSpeed", 1],
  ["magazineSize", 100],
  ["magazineSize", 0],
  ["reloadSeconds", 0.1],
  ["reloadSeconds", 30],
  ["startingReserve", 5000],
  ["startingReserve", -4],
  ["visionDegrees", 400],
  ["visionDegrees", 10],
  ["visionRange", 90],
  ["visionRange", -2],
])("accepts %s of %s, past its range, and hands it on as written for the balancer to bring in", (field, value) => {
  const weapon = {...RIFLE, [field]: value};

  expect(validateWeaponDraft(weapon)).toEqual({ok: true, weapon, preference: {favoured: [], sacrificed: []}});
});

it.each([
  ["Infinity", Infinity],
  ["NaN", NaN],
  ["text", "lots"],
  ["nothing", undefined],
])("still refuses a stat that is %s, and names the field", (_label, value) => {
  const result = validateWeaponDraft({...RIFLE, bulletDamage: value});

  expect(result.ok).toBe(false);
  expect(result.ok ? [] : result.errors.map(error => error.split(":")[0])).toEqual(["bulletDamage"]);
});

it("lists every problem, not only the first", () => {
  const result = validateWeaponDraft({...RIFLE, magazineSize: 12.5, reloadSeconds: "slow"});

  expect(result.ok).toBe(false);
  expect(result.ok ? [] : result.errors.map(error => error.split(":")[0])).toEqual(["magazineSize", "reloadSeconds"]);
});

it("still refuses a fractional magazine or reserve, which the balancer has no way to read as a whole number", () => {
  const result = validateWeaponDraft({...RIFLE, magazineSize: 12.5, startingReserve: 36.5});

  expect(result.ok).toBe(false);
  expect(result.ok ? [] : result.errors.map(error => error.split(":")[0])).toEqual(["magazineSize", "startingReserve"]);
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
    "visionDegrees",
    "visionRange",
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
