import {arenaNodePath} from "@evals/dsl/arena/pipeline/evaluators/outcome/ArenaNodePath";
import {passingArenaInput} from "@evals/dsl/arena/pipeline/evaluators/testing/PassingArenaInput";

it("passes the clean path of a created arena", () => {
  expect(arenaNodePath(passingArenaInput()).score).toBe(1);
});

it("passes a created arena that was repaired once and checked again", () => {
  const nodes = ["precheck", "moderation", "generate", "validate", "repair", "validate"];

  expect(arenaNodePath(passingArenaInput({nodes})).score).toBe(1);
});

it("fails when the pre-check did not run first", () => {
  const score = arenaNodePath(passingArenaInput({nodes: ["moderation", "precheck", "generate", "validate"]}));

  expect(score.comment).toBe(
    "the pre-check must run first, but the nodes were [moderation, precheck, generate, validate]",
  );
});

it("fails when the arena was repaired twice", () => {
  const nodes = ["precheck", "moderation", "generate", "validate", "repair", "validate", "repair", "validate"];

  expect(arenaNodePath(passingArenaInput({nodes})).comment).toBe("repair ran 2 times, allowed 1");
});

it("fails a created arena whose last word was not a validation", () => {
  const nodes = ["precheck", "moderation", "generate", "validate", "repair"];

  expect(arenaNodePath(passingArenaInput({nodes})).comment).toContain("must end with validate");
});

it("passes an invalid request after one repair did not help", () => {
  const nodes = ["precheck", "moderation", "generate", "validate", "repair", "validate"];

  expect(arenaNodePath(passingArenaInput({status: "invalid", nodes})).score).toBe(1);
});

it("fails an invalid request given up without any repair", () => {
  const nodes = ["precheck", "moderation", "generate", "validate"];

  expect(arenaNodePath(passingArenaInput({status: "invalid", nodes})).comment).toContain("only after one repair");
});

it("fails an invalid request whose run did not end with the validation of the repair", () => {
  const nodes = ["precheck", "moderation", "generate", "validate", "repair", "validate", "fallback"];

  expect(arenaNodePath(passingArenaInput({status: "invalid", nodes})).comment).toContain(
    "end the run with the validation",
  );
});

it("passes a request turned away by the pre-check", () => {
  expect(arenaNodePath(passingArenaInput({status: "rejected", nodes: ["precheck"]})).score).toBe(1);
});

it("fails a request that was turned away but was written", () => {
  const nodes = ["precheck", "moderation", "generate"];

  expect(arenaNodePath(passingArenaInput({status: "rejected", nodes})).comment).toContain("must not be written");
});
