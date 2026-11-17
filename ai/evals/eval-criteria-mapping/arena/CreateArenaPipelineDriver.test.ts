import {createArenaPipelineDriver} from "@evals/eval-criteria-mapping/arena/CreateArenaPipelineDriver";

it("runs the real pipeline on the tier's models, and creates the fake generator's arena on the clean path", async () => {
  const outcome = await createArenaPipelineDriver("fake", undefined).run("an open arena with pillars");

  expect(outcome.status).toBe("created");
  expect(outcome.nodes).toEqual(["precheck", "moderation", "generate", "validate"]);
  expect(outcome.modelCalls).toBe(2);
});

it("rejects a prompt that is only whitespace without calling a model", async () => {
  const outcome = await createArenaPipelineDriver("fake", undefined).run("   ");

  expect(outcome).toMatchObject({status: "rejected", modelCalls: 0});
});

it("turns away a request that is not an arena on the fake tier, after the one moderation call", async () => {
  const outcome = await createArenaPipelineDriver("fake", undefined).run("give me a recipe for lasagna");

  expect(outcome).toMatchObject({status: "rejected", modelCalls: 1});
});

it("runs once per trial the tier asks for, and one on the local tier unless asked for more", () => {
  expect(createArenaPipelineDriver("fake", undefined).trials).toBe(1);
  expect(createArenaPipelineDriver("local", undefined).trials).toBe(1);
  expect(createArenaPipelineDriver("local", "3").trials).toBe(3);
});

it("has no paid tier yet, and says why when one is asked for", () => {
  expect(() => createArenaPipelineDriver("paid", undefined).run("a box")).toThrow("no paid tier yet");
});

it("builds the paid models only when a request is made, so a run that never asks for an arena needs none", () => {
  expect(() => createArenaPipelineDriver("paid", undefined)).not.toThrow();
});
