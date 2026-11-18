import {arenaModelCallBudget} from "@evals/dsl/arena/pipeline/evaluators/outcome/ArenaModelCallBudget";
import {passingArenaInput} from "@evals/dsl/arena/pipeline/evaluators/testing/PassingArenaInput";

it("passes when the calls are within the allowance", () => {
  expect(arenaModelCallBudget(passingArenaInput({modelCalls: 3}), 3).score).toBe(1);
});

it("fails, naming both numbers, when the calls are over the allowance", () => {
  const score = arenaModelCallBudget(passingArenaInput({modelCalls: 4}), 3);

  expect(score).toEqual({key: "arenaModelCallBudget", score: 0, comment: "4 model calls, allowed 3"});
});

it("fails a rejection that needed no model but made one", () => {
  expect(arenaModelCallBudget(passingArenaInput({status: "rejected", modelCalls: 1}), 0).score).toBe(0);
});
