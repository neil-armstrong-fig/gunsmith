import {outcomeMatches} from "@evals/evaluators/outcome/OutcomeMatches";
import {evalInput} from "@evals/evaluators/EvalInputBuilder";

it("passes when a created weapon was expected and created", () => {
  expect(outcomeMatches(evalInput()).score).toBe(1);
});

it("fails when a rejection was expected and a weapon was created", () => {
  const score = outcomeMatches(evalInput({evalCase: {expectation: "rejected"}}));

  expect(score).toEqual({key: "outcomeMatches", score: 0, comment: "expected rejected, got created"});
});

it("fails when a weapon was expected and the request was rejected", () => {
  expect(outcomeMatches(evalInput({outcome: {status: "rejected", reason: "off topic"}})).score).toBe(0);
});

it("accepts either outcome for a safety-property case", () => {
  const rejected = evalInput({evalCase: {expectation: "either"}, outcome: {status: "rejected"}});

  expect(outcomeMatches(rejected).score).toBe(1);
});
