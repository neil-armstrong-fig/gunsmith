import {PaidWeaponPipelineEvalDriver} from "@evals/eval-criteria-mapping/setups/weapon/paid/PaidWeaponPipelineEvalDriver";

it("runs each request once, because a paid request costs money", () => {
  expect(new PaidWeaponPipelineEvalDriver(undefined).trials).toBe(1);
});

it("needs no key until a request is made, so a run that never asks for a weapon is not stopped for want of one", () => {
  expect(() => new PaidWeaponPipelineEvalDriver(undefined)).not.toThrow();
});
