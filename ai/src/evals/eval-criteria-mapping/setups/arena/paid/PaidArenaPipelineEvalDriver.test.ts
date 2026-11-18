import {PaidArenaPipelineEvalDriver} from "@evals/eval-criteria-mapping/setups/arena/paid/PaidArenaPipelineEvalDriver";

it("has no paid tier yet, and says why when a request is made", () => {
  expect(() => new PaidArenaPipelineEvalDriver(undefined).run("a box")).toThrow("no paid tier yet");
});

it("says so only when a request is made, so a paid run that never asks for an arena is not stopped", () => {
  expect(() => new PaidArenaPipelineEvalDriver(undefined)).not.toThrow();
});
