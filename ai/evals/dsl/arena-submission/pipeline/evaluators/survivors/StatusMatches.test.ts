import {statusMatches} from "@evals/dsl/arena-submission/pipeline/evaluators/survivors/StatusMatches";
import {passingSubmissionInput} from "@evals/dsl/arena-submission/pipeline/evaluators/testing/PassingSubmissionInput";

it("passes the status the spec expects", () => {
  expect(statusMatches(passingSubmissionInput(), "players-pick").score).toBe(1);
});

it("fails another status, naming both", () => {
  expect(statusMatches(passingSubmissionInput(), "none").comment).toBe(
    'expected the status "none", but it is "players-pick"',
  );
});
