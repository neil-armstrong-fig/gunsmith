import {passingEvalInput} from "@evals/dsl/pipeline/evaluators/testing/input/PassingEvalInput";
import {nodePath} from "@evals/dsl/pipeline/evaluators/outcome/NodePath";
import type {WeaponOutcomeStatus} from "@gunsmith/ai/pipeline/types/WeaponOutcome";

function ran(nodes: string[], status: WeaponOutcomeStatus = "invalid"): ReturnType<typeof passingEvalInput> {
  return passingEvalInput({outcome: {nodes, status}});
}

it("passes a created weapon that was generated, validated, balanced and rated", () => {
  const nodes = ["precheck", "moderation", "generate", "validate", "balance", "rate"];

  expect(nodePath(ran(nodes, "created")).score).toBe(1);
});

it("passes a created weapon that was repaired once and checked again", () => {
  const nodes = ["precheck", "moderation", "generate", "validate", "repair", "validate", "balance", "rate"];

  expect(nodePath(ran(nodes, "created")).score).toBe(1);
});

it("fails a created weapon that was never validated", () => {
  const score = nodePath(ran(["precheck", "moderation", "generate", "balance", "rate"], "created"));

  expect(score.comment).toBe(
    "a created weapon must have been validated, but the nodes were [precheck, moderation, generate, balance, rate]",
  );
});

it("fails a created weapon that was never balanced", () => {
  const score = nodePath(ran(["precheck", "moderation", "generate", "validate", "rate"], "created"));

  expect(score.comment).toBe(
    "a created weapon must have been balanced, but the nodes were [precheck, moderation, generate, validate, rate]",
  );
});

it("fails a created weapon that was never rated", () => {
  const score = nodePath(ran(["precheck", "moderation", "generate", "validate", "balance"], "created"));

  expect(score.comment).toBe(
    "a created weapon must have been rated, but the nodes were [precheck, moderation, generate, validate, balance]",
  );
});

it("fails a created weapon that was rated before it was balanced", () => {
  const nodes = ["precheck", "moderation", "generate", "validate", "rate", "balance"];

  expect(nodePath(ran(nodes, "created")).score).toBe(0);
});

it("fails a created weapon whose last check was before its repair", () => {
  const nodes = ["precheck", "moderation", "generate", "validate", "balance", "rate", "repair"];

  expect(nodePath(ran(nodes, "created")).score).toBe(0);
});

it("passes a rejection that stopped at the pre-check", () => {
  expect(nodePath(ran(["precheck"], "rejected")).score).toBe(1);
});

it("passes a rejection that stopped at moderation", () => {
  expect(nodePath(ran(["precheck", "moderation"], "rejected")).score).toBe(1);
});

it("passes an invalid outcome after one repair", () => {
  expect(nodePath(ran(["precheck", "moderation", "generate", "validate", "repair", "validate"])).score).toBe(1);
});

it("fails two repairs", () => {
  const score = nodePath(ran(["precheck", "generate", "validate", "repair", "validate", "repair"]));

  expect(score.comment).toBe("repair ran 2 times, allowed 1");
});

it("fails when the pre-check was not first", () => {
  expect(nodePath(ran(["generate", "precheck"])).score).toBe(0);
});

it("fails when no node ran at all", () => {
  expect(nodePath(ran([])).score).toBe(0);
});
