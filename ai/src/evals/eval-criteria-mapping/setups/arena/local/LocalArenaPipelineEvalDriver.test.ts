import {LocalArenaPipelineEvalDriver} from "@evals/eval-criteria-mapping/setups/arena/local/LocalArenaPipelineEvalDriver";

it("runs each request once, because an arena takes a local model far longer than a weapon, and as many times as asked", () => {
  expect(new LocalArenaPipelineEvalDriver(undefined).trials).toBe(1);
  expect(new LocalArenaPipelineEvalDriver("3").trials).toBe(3);
});

it("keeps its arenas by default, because a real model's arenas are worth looking at, unless the run says not to", () => {
  vi.stubEnv("EVAL_KEEP_ARENAS", undefined);
  onTestFinished(() => {
    vi.unstubAllEnvs();
  });
  expect(new LocalArenaPipelineEvalDriver(undefined).keepsArenas).toBe(true);

  vi.stubEnv("EVAL_KEEP_ARENAS", "0");

  expect(new LocalArenaPipelineEvalDriver(undefined).keepsArenas).toBe(false);
});
