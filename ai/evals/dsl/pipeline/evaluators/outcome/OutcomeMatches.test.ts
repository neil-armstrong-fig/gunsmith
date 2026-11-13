import {outcomeMatches} from "@evals/dsl/pipeline/evaluators/outcome/OutcomeMatches";
import {passingEvalInput} from "@evals/dsl/pipeline/evaluators/testing/input/PassingEvalInput";

it("passes when the outcome is the one expected", () => {
  expect(outcomeMatches(passingEvalInput(), "created").score).toBe(1);
});

it("fails when a rejection was expected and a weapon was created", () => {
  const score = outcomeMatches(passingEvalInput(), "rejected");

  expect(score).toEqual({key: "outcomeMatches", score: 0, comment: "expected rejected, got created"});
});

it("fails when a weapon was expected and the request was rejected", () => {
  const score = outcomeMatches(passingEvalInput({outcome: {status: "rejected", reason: "off topic"}}), "created");

  expect(score.comment).toBe("expected created, got rejected");
});

it("fails when a weapon was expected and none could be made", () => {
  const score = outcomeMatches(passingEvalInput({outcome: {status: "invalid", weapon: undefined}}), "created");

  expect(score.comment).toBe("expected created, got invalid");
});
