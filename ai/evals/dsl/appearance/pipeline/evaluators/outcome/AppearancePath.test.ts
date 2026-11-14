import {appearancePath} from "@evals/dsl/appearance/pipeline/evaluators/outcome/AppearancePath";
import {passingAppearanceOutcome} from "@evals/dsl/appearance/pipeline/evaluators/testing/PassingAppearanceOutcome";

it.each([
  ["valid", ["generate", "fix", "validate"], 1],
  ["completed", ["generate", "fix", "validate"], 1],
  ["repaired", ["generate", "fix", "validate", "repair", "fix", "validate"], 2],
  ["fallback", ["generate", "fix", "validate", "repair", "fix", "validate", "fallback"], 2],
] as const)("passes the path a %s outcome must take", (status, nodes, modelCalls) => {
  const outcome = passingAppearanceOutcome({status, nodes: [...nodes], modelCalls});

  expect(appearancePath({outcome})).toEqual({key: "appearancePath", score: 1});
});

it("fails a path that is not the one its status requires, naming both", () => {
  const outcome = passingAppearanceOutcome({status: "repaired", nodes: ["generate", "fix", "validate"], modelCalls: 2});

  expect(appearancePath({outcome})).toEqual({
    key: "appearancePath",
    score: 0,
    comment:
      "a repaired outcome must run [generate, fix, validate, repair, fix, validate], but the nodes were [generate, fix, validate]",
  });
});

it("fails a count of model calls that is not the one its path costs", () => {
  const outcome = passingAppearanceOutcome({status: "valid", modelCalls: 2});

  expect(appearancePath({outcome})).toEqual({
    key: "appearancePath",
    score: 0,
    comment: "a valid outcome costs 1 model call, but 2 were made",
  });
});

it("fails a repair that ran twice", () => {
  const outcome = passingAppearanceOutcome({
    status: "fallback",
    nodes: ["generate", "fix", "validate", "repair", "fix", "validate", "repair", "fix", "validate", "fallback"],
    modelCalls: 3,
  });

  expect(appearancePath({outcome}).score).toBe(0);
});
