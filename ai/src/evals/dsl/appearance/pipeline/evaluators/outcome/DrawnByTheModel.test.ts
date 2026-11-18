import {drawnByTheModel} from "@evals/dsl/appearance/pipeline/evaluators/outcome/DrawnByTheModel";
import {passingAppearanceOutcome} from "@evals/dsl/appearance/pipeline/evaluators/testing/PassingAppearanceOutcome";

const REPAIRED_NODES = ["generate", "fix", "validate", "repair", "fix", "validate"];

it("passes a first drawing that needed no repair when no repair is allowed", () => {
  const outcome = passingAppearanceOutcome({status: "valid"});

  expect(drawnByTheModel({outcome}, 0)).toEqual({key: "drawnByTheModel", score: 1});
});

it("passes a drawing the code completed itself when no repair is allowed, because no repair was asked of the model", () => {
  const outcome = passingAppearanceOutcome({status: "completed"});

  expect(drawnByTheModel({outcome}, 0)).toEqual({key: "drawnByTheModel", score: 1});
});

it("passes a drawing repaired once when one repair is allowed", () => {
  const outcome = passingAppearanceOutcome({status: "repaired", nodes: REPAIRED_NODES, modelCalls: 2});

  expect(drawnByTheModel({outcome}, 1)).toEqual({key: "drawnByTheModel", score: 1});
});

it("fails a drawing repaired once when no repair is allowed, saying how many ran", () => {
  const outcome = passingAppearanceOutcome({status: "repaired", nodes: REPAIRED_NODES, modelCalls: 2});

  expect(drawnByTheModel({outcome}, 0)).toEqual({
    key: "drawnByTheModel",
    score: 0,
    comment: "repair ran 1 times, allowed 0",
  });
});

it("fails the plain stand-in however many repairs are allowed, because it is not the model's own drawing", () => {
  const outcome = passingAppearanceOutcome({
    status: "fallback",
    nodes: [...REPAIRED_NODES, "fallback"],
    modelCalls: 2,
  });

  expect(drawnByTheModel({outcome}, 1)).toEqual({
    key: "drawnByTheModel",
    score: 0,
    comment: "the plain stand-in was shown, not the model's own drawing",
  });
});

it("counts the repair steps that ran, not the status the pipeline gave the outcome", () => {
  const outcome = passingAppearanceOutcome({status: "valid", nodes: REPAIRED_NODES, modelCalls: 2});

  expect(drawnByTheModel({outcome}, 0)).toEqual({
    key: "drawnByTheModel",
    score: 0,
    comment: "repair ran 1 times, allowed 0",
  });
});
