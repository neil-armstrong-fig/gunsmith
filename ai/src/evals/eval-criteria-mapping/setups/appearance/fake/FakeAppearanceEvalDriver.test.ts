import {FakeAppearanceEvalDriver} from "@evals/eval-criteria-mapping/setups/appearance/fake/FakeAppearanceEvalDriver";

it("draws on the fake model, and a clean first drawing is valid after one call", async () => {
  const outcome = await new FakeAppearanceEvalDriver(undefined).run("a rifle with a long barrel");

  expect(outcome.status).toBe("valid");
  expect(outcome.modelCalls).toBe(1);
});

it("runs each request once, and as many times as a run asks for", () => {
  expect(new FakeAppearanceEvalDriver(undefined).trials).toBe(1);
  expect(new FakeAppearanceEvalDriver("3").trials).toBe(3);
});

it("keeps no drawings by default, because they are canned", () => {
  vi.stubEnv("EVAL_KEEP_DRAWINGS", undefined);
  onTestFinished(() => {
    vi.unstubAllEnvs();
  });

  expect(new FakeAppearanceEvalDriver(undefined).keepsDrawings).toBe(false);
});
