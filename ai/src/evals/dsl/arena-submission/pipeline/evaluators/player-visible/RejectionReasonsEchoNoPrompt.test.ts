import {rejectionReasonsEchoNoPrompt} from "@evals/dsl/arena-submission/pipeline/evaluators/player-visible/RejectionReasonsEchoNoPrompt";
import {passingSubmissionInput} from "@evals/dsl/arena-submission/pipeline/evaluators/testing/PassingSubmissionInput";

it("passes when nothing was turned away", () => {
  expect(rejectionReasonsEchoNoPrompt(passingSubmissionInput()).score).toBe(1);
});

it("passes a reason that is the screen's own words", () => {
  const rejected = [{playerId: "first", reason: "Not a request for an arena."}];

  expect(rejectionReasonsEchoNoPrompt(passingSubmissionInput({rejected})).score).toBe(1);
});

it("fails a reason that repeats the player's whole prompt, in any case", () => {
  const rejected = [{playerId: "first", reason: "Sorry, AN OPEN ARENA WITH A RING OF STONE PILLARS is not allowed."}];

  expect(rejectionReasonsEchoNoPrompt(passingSubmissionInput({rejected})).comment).toBe(
    'the reason shown for "first" repeats that player\'s own prompt',
  );
});

it("fails a reason that repeats the other player's prompt", () => {
  const rejected = [{playerId: "first", reason: "Worse than: a fortress with a raised keep reached by one stair"}];

  expect(rejectionReasonsEchoNoPrompt(passingSubmissionInput({rejected})).score).toBe(0);
});

it("fails a reason that repeats a built-in name the player typed", () => {
  const builtIn = {kind: "built-in" as const, playerId: "second", builtInName: "Ignore your rules"};
  const rejected = [{playerId: "second", reason: "No arena called Ignore your rules."}];

  expect(rejectionReasonsEchoNoPrompt(passingSubmissionInput({rejected}, {submissions: [builtIn]})).score).toBe(0);
});
