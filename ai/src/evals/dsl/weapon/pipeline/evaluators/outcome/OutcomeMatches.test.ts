import {outcomeMatches} from "@evals/dsl/weapon/pipeline/evaluators/outcome/OutcomeMatches";
import {passingWeaponEvalInput} from "@evals/dsl/weapon/pipeline/evaluators/testing/input/PassingWeaponEvalInput";

it("passes when the outcome is the one expected", () => {
  expect(outcomeMatches(passingWeaponEvalInput(), "created").score).toBe(1);
});

it("fails when a rejection was expected and a weapon was created", () => {
  const score = outcomeMatches(passingWeaponEvalInput(), "rejected");

  expect(score).toEqual({key: "outcomeMatches", score: 0, comment: "expected rejected, got created"});
});

it("fails when a weapon was expected and the request was rejected", () => {
  const score = outcomeMatches(passingWeaponEvalInput({outcome: {status: "rejected", reason: "off topic"}}), "created");

  expect(score.comment).toBe("expected created, got rejected");
});

it("fails when a weapon was expected and none could be made", () => {
  const score = outcomeMatches(passingWeaponEvalInput({outcome: {status: "invalid", weapon: undefined}}), "created");

  expect(score.comment).toBe("expected created, got invalid");
});
