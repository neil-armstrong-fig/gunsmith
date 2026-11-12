import {weaponProofGraph} from "@gunsmith/ai/graph/WeaponProofGraph";

it("returns a weapon that passed the schema, without a network call", async () => {
  const result = await weaponProofGraph.invoke({prompt: "a mild rifle"});

  expect(result.weapon).toEqual({name: "Proof Rifle", damage: 20, rateOfFire: 6});
});
