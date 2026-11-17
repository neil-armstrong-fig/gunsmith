import {balancedByCode} from "@evals/dsl/pipeline/evaluators/outcome/BalancedByCode";
import {passingEvalInput} from "@evals/dsl/pipeline/evaluators/testing/input/PassingEvalInput";

it("passes a weapon that code balanced, with no repair", () => {
  const nodes = ["precheck", "moderation", "generate", "validate", "balance", "rate"];

  expect(balancedByCode(passingEvalInput({outcome: {nodes}})).score).toBe(1);
});

it("fails a weapon that needed a repair, because the model was asked to fix what code should have", () => {
  const nodes = ["precheck", "moderation", "generate", "validate", "rate", "repair", "validate", "balance", "rate"];

  expect(balancedByCode(passingEvalInput({outcome: {nodes}})).comment).toBe(
    "the weapon was repaired by the model, but code should have balanced it; the nodes were [precheck, moderation, generate, validate, rate, repair, validate, balance, rate]",
  );
});

it("fails a weapon that was never balanced", () => {
  const nodes = ["precheck", "moderation", "generate", "validate", "rate"];

  expect(balancedByCode(passingEvalInput({outcome: {nodes}})).score).toBe(0);
});

it("fails a request that did not end in a weapon, because nothing was balanced", () => {
  const score = balancedByCode(passingEvalInput({outcome: {status: "invalid", nodes: ["precheck", "moderation"]}}));

  expect(score.comment).toBe("expected a weapon to be created and balanced, got invalid");
});

it("names itself balancedByCode in the report, whether it passes or fails", () => {
  const nodes = ["precheck", "moderation", "generate", "validate", "balance", "rate"];

  expect(balancedByCode(passingEvalInput({outcome: {nodes}})).key).toBe("balancedByCode");
  expect(balancedByCode(passingEvalInput({outcome: {status: "rejected"}})).key).toBe("balancedByCode");
});
