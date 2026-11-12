import {weaponDraftReplySchema} from "@gunsmith/ai/pipeline/ask/reply/WeaponDraftReply";

it("accepts a number far outside the weapon's range, for validate to refuse", () => {
  expect(weaponDraftReplySchema.safeParse({name: "Cannon", bulletDamage: 9999}).success).toBe(true);
});

it("accepts a name longer than the weapon allows, for validate to refuse", () => {
  expect(weaponDraftReplySchema.safeParse({name: "A".repeat(200)}).success).toBe(true);
});

it("accepts a magazine that is not a whole number, for validate to refuse", () => {
  expect(weaponDraftReplySchema.safeParse({magazineSize: 12.5}).success).toBe(true);
});

it("keeps a field the weapon does not have, so validate can refuse it", () => {
  const reply = weaponDraftReplySchema.parse({name: "Cannon", rateOfFire: 500});

  expect(reply).toEqual({name: "Cannon", rateOfFire: 500});
});

it("accepts a reply with fields missing, so validate can name them", () => {
  expect(weaponDraftReplySchema.safeParse({name: "Cannon"}).success).toBe(true);
});

it("names every field of the weapon, so the model is shown what to fill", () => {
  const properties = Object.keys(weaponDraftReplySchema.shape);

  expect(properties).toEqual([
    "name",
    "bulletDamage",
    "fireIntervalSeconds",
    "bulletSpeed",
    "magazineSize",
    "reloadSeconds",
    "startingReserve",
  ]);
});

it("asks for numbers as numbers: a stat written as text is refused here, not carried on", () => {
  expect(weaponDraftReplySchema.safeParse({bulletDamage: "25"}).success).toBe(false);
});

it("refuses a reply that is not an object", () => {
  expect(weaponDraftReplySchema.safeParse("a rifle").success).toBe(false);
});
