import {arenaOutcomeMatches} from "@evals/dsl/arena/pipeline/evaluators/outcome/ArenaOutcomeMatches";
import {passingArenaInput} from "@evals/dsl/arena/pipeline/evaluators/testing/PassingArenaInput";

it("passes when the outcome is the one expected", () => {
  expect(arenaOutcomeMatches(passingArenaInput(), "created").score).toBe(1);
});

it("fails when a rejection was expected and an arena was created", () => {
  const score = arenaOutcomeMatches(passingArenaInput(), "rejected");

  expect(score).toEqual({key: "arenaOutcomeMatches", score: 0, comment: "expected rejected, got created"});
});

it("fails when a built-in arena was expected and the model's own was created", () => {
  expect(arenaOutcomeMatches(passingArenaInput(), "builtIn").comment).toBe("expected builtIn, got created");
});

it("fails when an arena was expected and the request was rejected", () => {
  const score = arenaOutcomeMatches(passingArenaInput({status: "rejected", arena: undefined}), "created");

  expect(score.comment).toBe("expected created, got rejected");
});
