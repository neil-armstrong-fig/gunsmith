import {passingWeaponEvalInput} from "@evals/dsl/weapon/pipeline/evaluators/testing/input/PassingWeaponEvalInput";
import {modelCallBudget} from "@evals/dsl/weapon/pipeline/evaluators/outcome/ModelCallBudget";

it("passes when the calls are within the allowance", () => {
  expect(modelCallBudget(passingWeaponEvalInput({outcome: {modelCalls: 3}}), 3).score).toBe(1);
});

it("fails one call over the allowance", () => {
  const score = modelCallBudget(passingWeaponEvalInput({outcome: {modelCalls: 4}}), 3);

  expect(score.comment).toBe("4 model calls, allowed 3");
});

it("fails a rejection that should have cost nothing but called a model", () => {
  const score = modelCallBudget(passingWeaponEvalInput({outcome: {status: "rejected", modelCalls: 1}}), 0);

  expect(score.score).toBe(0);
});

it("passes a rejection that cost nothing, when nothing was allowed", () => {
  expect(modelCallBudget(passingWeaponEvalInput({outcome: {status: "rejected", modelCalls: 0}}), 0).score).toBe(1);
});
