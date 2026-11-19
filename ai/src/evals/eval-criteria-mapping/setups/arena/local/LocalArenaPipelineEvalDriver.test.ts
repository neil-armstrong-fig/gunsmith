import type {ArenaFormat} from "@gunsmith/ai/pipeline/arena/arena-drafting/format/ArenaFormat";
import type {ArenaPipelineDependencies} from "@gunsmith/ai/pipeline/arena/types/ArenaPipelineDependencies";
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

interface ModelsOfDriver {
  createModels(): ArenaPipelineDependencies;
}

it("asks the model for rows unless the run says shapes (EVAL_ARENA_FORMAT=shapes), so two formats can be tried on one model", () => {
  onTestFinished(() => {
    vi.unstubAllEnvs();
  });
  vi.stubEnv("EVAL_ARENA_FORMAT", undefined);
  const formatOf = (): ArenaFormat | undefined => {
    return (new LocalArenaPipelineEvalDriver(undefined) as unknown as ModelsOfDriver).createModels().format;
  };

  expect(formatOf()).toBe("rows");

  vi.stubEnv("EVAL_ARENA_FORMAT", "shapes");

  expect(formatOf()).toBe("shapes");
});
