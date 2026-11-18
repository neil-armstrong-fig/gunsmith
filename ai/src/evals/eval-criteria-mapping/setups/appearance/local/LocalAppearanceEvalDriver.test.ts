import {LocalAppearanceEvalDriver} from "@evals/eval-criteria-mapping/setups/appearance/local/LocalAppearanceEvalDriver";

it("runs each request once, because a real drawing takes about half a minute, and as many times as a run asks for", () => {
  expect(new LocalAppearanceEvalDriver(undefined).trials).toBe(1);
  expect(new LocalAppearanceEvalDriver("3").trials).toBe(3);
});

it("keeps its drawings by default, because a real model's drawings are worth looking at", () => {
  vi.stubEnv("EVAL_KEEP_DRAWINGS", undefined);
  onTestFinished(() => {
    vi.unstubAllEnvs();
  });

  expect(new LocalAppearanceEvalDriver(undefined).keepsDrawings).toBe(true);
});

it("keeps nothing when the run says not to", () => {
  vi.stubEnv("EVAL_KEEP_DRAWINGS", "0");
  onTestFinished(() => {
    vi.unstubAllEnvs();
  });

  expect(new LocalAppearanceEvalDriver(undefined).keepsDrawings).toBe(false);
});
