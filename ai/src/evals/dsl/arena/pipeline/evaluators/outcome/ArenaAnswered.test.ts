import {arenaAnswered} from "@evals/dsl/arena/pipeline/evaluators/outcome/ArenaAnswered";
import {passingArenaInput} from "@evals/dsl/arena/pipeline/evaluators/testing/PassingArenaInput";

const REASON = "Part of the floor cannot be walked to from the rest.";

it("passes a created arena", () => {
  expect(arenaAnswered(passingArenaInput()).score).toBe(1);
});

it("fails a created request that carries no arena", () => {
  expect(arenaAnswered(passingArenaInput({arena: undefined})).comment).toBe(
    "the request ended created but carries no arena",
  );
});

it("passes an invalid request that says why and gives no arena", () => {
  expect(arenaAnswered(passingArenaInput({status: "invalid", arena: undefined, reason: REASON})).score).toBe(1);
});

it("fails an invalid request that gives no reason", () => {
  const score = arenaAnswered(passingArenaInput({status: "invalid", arena: undefined, reason: "  "}));

  expect(score.comment).toBe("the request ended invalid with no reason for the player");
});

it("fails an invalid request with no reason at all", () => {
  expect(arenaAnswered(passingArenaInput({status: "invalid", arena: undefined})).score).toBe(0);
});

it("fails an invalid request that still carries an arena, a substitute", () => {
  const score = arenaAnswered(passingArenaInput({status: "invalid", reason: REASON}));

  expect(score.comment).toBe("the request ended invalid but still carries an arena (a substitute)");
});

it("fails a request that was turned away, because this one was asked for properly", () => {
  const score = arenaAnswered(passingArenaInput({status: "rejected", arena: undefined, reason: REASON}));

  expect(score.comment).toBe("the request ended rejected, not created or invalid");
});
