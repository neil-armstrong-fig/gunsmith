import {createWeaponPipelineDriver} from "@evals/eval-criteria-mapping/tier/CreateWeaponPipelineDriver";

it("runs the real pipeline on the tier's models", async () => {
  const driver = createWeaponPipelineDriver("fake", undefined);

  const outcome = await driver.run("a mild rifle");

  expect(outcome.status).toBe("created");
  expect(outcome.nodes).toEqual(["precheck", "moderation", "generate", "validate", "rate"]);
});

it("rejects a prompt that is only whitespace without calling a model", async () => {
  const outcome = await createWeaponPipelineDriver("fake", undefined).run("   ");

  expect(outcome).toMatchObject({status: "rejected", modelCalls: 0});
});

it("runs each request once on the fake tier and three times on the local tier", () => {
  expect(createWeaponPipelineDriver("fake", undefined).trials).toBe(1);
  expect(createWeaponPipelineDriver("local", undefined).trials).toBe(3);
});

it("takes the number of trials a run asks for", () => {
  expect(createWeaponPipelineDriver("fake", "5").trials).toBe(5);
});
