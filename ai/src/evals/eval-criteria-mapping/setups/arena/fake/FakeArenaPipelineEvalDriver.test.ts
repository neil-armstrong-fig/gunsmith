import {FakeArenaPipelineEvalDriver} from "@evals/eval-criteria-mapping/setups/arena/fake/FakeArenaPipelineEvalDriver";

it("runs the real pipeline on the fake models, and creates the fake generator's arena on the clean path", async () => {
  const outcome = await new FakeArenaPipelineEvalDriver(undefined).run("an open arena with pillars");

  expect(outcome.status).toBe("created");
  expect(outcome.nodes).toEqual(["precheck", "moderation", "generate", "validate"]);
  expect(outcome.modelCalls).toBe(2);
});

it("rejects a prompt that is only whitespace without calling a model", async () => {
  const outcome = await new FakeArenaPipelineEvalDriver(undefined).run("   ");

  expect(outcome).toMatchObject({status: "rejected", modelCalls: 0});
});

it("turns away a request that is not an arena, after the one moderation call", async () => {
  const outcome = await new FakeArenaPipelineEvalDriver(undefined).run("give me a recipe for lasagna");

  expect(outcome).toMatchObject({status: "rejected", modelCalls: 1});
});

it("runs each request once, and as many times as a run asks for", () => {
  expect(new FakeArenaPipelineEvalDriver(undefined).trials).toBe(1);
  expect(new FakeArenaPipelineEvalDriver("3").trials).toBe(3);
});

it("keeps no arenas by default, because they are canned", () => {
  vi.stubEnv("EVAL_KEEP_ARENAS", undefined);
  onTestFinished(() => {
    vi.unstubAllEnvs();
  });

  expect(new FakeArenaPipelineEvalDriver(undefined).keepsArenas).toBe(false);
});
