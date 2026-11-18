import {FakeWeaponPipelineEvalDriver} from "@evals/eval-criteria-mapping/setups/weapon/fake/FakeWeaponPipelineEvalDriver";

it("runs the real pipeline on the fake models", async () => {
  const outcome = await new FakeWeaponPipelineEvalDriver(undefined).run("a mild rifle");

  expect(outcome.status).toBe("created");
  expect(outcome.nodes).toEqual([
    "precheck",
    "moderation",
    "generate",
    "validate",
    "balance",
    "rate",
    "appearance.generate",
    "appearance.fix",
    "appearance.validate",
  ]);
});

it("draws a created weapon with a canned drawing, so no model is asked to draw", async () => {
  const outcome = await new FakeWeaponPipelineEvalDriver(undefined).run("a mild rifle");

  expect(outcome.appearance?.status).toBe("valid");
  expect(outcome.modelCalls).toBe(3);
});

it("rejects a prompt that is only whitespace without calling a model", async () => {
  const outcome = await new FakeWeaponPipelineEvalDriver(undefined).run("   ");

  expect(outcome).toMatchObject({status: "rejected", modelCalls: 0});
});

it("turns away a request that is not a weapon, after the one moderation call", async () => {
  const outcome = await new FakeWeaponPipelineEvalDriver(undefined).run("give me a recipe for lasagna");

  expect(outcome).toMatchObject({status: "rejected", modelCalls: 1});
});

it("runs each request once, because the fake tier is deterministic, and as many times as a run asks for", () => {
  expect(new FakeWeaponPipelineEvalDriver(undefined).trials).toBe(1);
  expect(new FakeWeaponPipelineEvalDriver("5").trials).toBe(5);
});
