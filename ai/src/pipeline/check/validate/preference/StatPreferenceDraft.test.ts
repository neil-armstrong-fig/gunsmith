import {statPreferenceDraftSchema} from "@gunsmith/ai/pipeline/check/validate/preference/StatPreferenceDraft";

it("accepts the stats a player favours and would sacrifice", () => {
  const parsed = statPreferenceDraftSchema.safeParse({favoured: ["damage"], sacrificed: ["fireRate", "reloadSpeed"]});

  expect(parsed.success).toBe(true);
  expect(parsed.data).toEqual({favoured: ["damage"], sacrificed: ["fireRate", "reloadSpeed"]});
});

it("takes a preference that says nothing as no preference", () => {
  expect(statPreferenceDraftSchema.parse(undefined)).toEqual({favoured: [], sacrificed: []});
});

it("takes a missing list as an empty one", () => {
  expect(statPreferenceDraftSchema.parse({favoured: ["damage"]})).toEqual({favoured: ["damage"], sacrificed: []});
  expect(statPreferenceDraftSchema.parse({sacrificed: ["reserve"]})).toEqual({favoured: [], sacrificed: ["reserve"]});
});

it("refuses a stat the weapon does not have, so a made-up name is not quietly dropped", () => {
  expect(statPreferenceDraftSchema.safeParse({favoured: ["accuracy"], sacrificed: []}).success).toBe(false);
});

it("refuses a stat written with another spelling than the list gives", () => {
  expect(statPreferenceDraftSchema.safeParse({favoured: ["Damage"], sacrificed: []}).success).toBe(false);
});

it("refuses a field the preference does not have", () => {
  expect(statPreferenceDraftSchema.safeParse({favoured: [], sacrificed: [], neutral: ["damage"]}).success).toBe(false);
});

it("refuses a list that is not a list", () => {
  expect(statPreferenceDraftSchema.safeParse({favoured: "damage", sacrificed: []}).success).toBe(false);
});

it("refuses a list longer than there are stats, so a pasted block of text cannot ride in it", () => {
  const tooMany = Array.from({length: 7}, () => "damage");

  expect(statPreferenceDraftSchema.safeParse({favoured: tooMany, sacrificed: []}).success).toBe(false);
});

it("accepts a stat in both lists, because the balancer counts it as neither", () => {
  expect(statPreferenceDraftSchema.safeParse({favoured: ["damage"], sacrificed: ["damage"]}).success).toBe(true);
});
