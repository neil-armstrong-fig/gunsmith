import {PaidAppearanceEvalDriver} from "@evals/eval-criteria-mapping/setups/appearance/paid/PaidAppearanceEvalDriver";

it("runs each request once, because a paid request costs money", () => {
  expect(new PaidAppearanceEvalDriver(undefined).trials).toBe(1);
});

it("needs no key until a request is made, and keeps no drawings unless asked, because the run is chosen and costs money", () => {
  vi.stubEnv("EVAL_KEEP_DRAWINGS", undefined);
  onTestFinished(() => {
    vi.unstubAllEnvs();
  });

  expect(new PaidAppearanceEvalDriver(undefined).keepsDrawings).toBe(false);
});
