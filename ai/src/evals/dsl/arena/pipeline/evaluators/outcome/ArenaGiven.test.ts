import {arenaGiven} from "@evals/dsl/arena/pipeline/evaluators/outcome/ArenaGiven";
import {passingArenaInput} from "@evals/dsl/arena/pipeline/evaluators/testing/PassingArenaInput";

it("passes a created arena", () => {
  expect(arenaGiven(passingArenaInput()).score).toBe(1);
});

it("passes a built-in arena, which is still an arena to play", () => {
  expect(arenaGiven(passingArenaInput({status: "builtIn", refunded: true})).score).toBe(1);
});

it("fails a request that was turned away", () => {
  const score = arenaGiven(passingArenaInput({status: "rejected", arena: undefined}));

  expect(score).toEqual({key: "arenaGiven", score: 0, comment: "no arena was given: the request ended rejected"});
});

it("fails a created outcome that carries no arena", () => {
  expect(arenaGiven(passingArenaInput({arena: undefined})).score).toBe(0);
});
