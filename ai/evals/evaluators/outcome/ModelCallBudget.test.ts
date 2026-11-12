import {evalInput} from "@evals/evaluators/EvalInputBuilder";
import {modelCallBudget} from "@evals/evaluators/outcome/ModelCallBudget";

it("passes when the calls are within the allowance", () => {
  expect(modelCallBudget(evalInput({outcome: {modelCalls: 3}})).score).toBe(1);
});

it("fails one call over the allowance", () => {
  const score = modelCallBudget(evalInput({outcome: {modelCalls: 4}}));

  expect(score.comment).toBe("4 model calls, allowed 3");
});

it("fails a rejection that should have cost nothing but called a model", () => {
  const score = modelCallBudget(
    evalInput({evalCase: {maxModelCalls: 0}, outcome: {status: "rejected", modelCalls: 1}}),
  );

  expect(score.score).toBe(0);
});
