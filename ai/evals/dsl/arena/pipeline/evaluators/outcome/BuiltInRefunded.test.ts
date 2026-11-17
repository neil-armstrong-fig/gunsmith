import {builtInRefunded} from "@evals/dsl/arena/pipeline/evaluators/outcome/BuiltInRefunded";
import {passingArenaInput} from "@evals/dsl/arena/pipeline/evaluators/testing/PassingArenaInput";

it("passes a created arena that was not refunded", () => {
  expect(builtInRefunded(passingArenaInput()).score).toBe(1);
});

it("passes a built-in arena that was refunded", () => {
  expect(builtInRefunded(passingArenaInput({status: "builtIn", refunded: true})).score).toBe(1);
});

it("fails a built-in arena that was not refunded", () => {
  const score = builtInRefunded(passingArenaInput({status: "builtIn", refunded: false}));

  expect(score.comment).toContain("the credit was not refunded");
});

it("fails a created arena that was refunded", () => {
  const score = builtInRefunded(passingArenaInput({refunded: true}));

  expect(score.comment).toBe("the credit was refunded although the request ended created");
});

it("fails a rejected request that was refunded", () => {
  expect(builtInRefunded(passingArenaInput({status: "rejected", refunded: true})).score).toBe(0);
});
