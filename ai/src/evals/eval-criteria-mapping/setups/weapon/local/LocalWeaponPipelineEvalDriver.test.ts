import {LocalWeaponPipelineEvalDriver} from "@evals/eval-criteria-mapping/setups/weapon/local/LocalWeaponPipelineEvalDriver";

it("runs each request three times, because a local model is free but not fully repeatable", () => {
  expect(new LocalWeaponPipelineEvalDriver(undefined).trials).toBe(3);
});

it("runs as many times as a run asks for", () => {
  expect(new LocalWeaponPipelineEvalDriver("1").trials).toBe(1);
});
