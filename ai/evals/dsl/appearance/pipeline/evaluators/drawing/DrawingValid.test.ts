import {drawingValid} from "@evals/dsl/appearance/pipeline/evaluators/drawing/DrawingValid";
import {passingAppearanceOutcome} from "@evals/dsl/appearance/pipeline/evaluators/testing/PassingAppearanceOutcome";
import {passingAppearance} from "@gunsmith/ai/pipeline/appearance/testing/PassingAppearance";

it("passes a drawing that passes every rule", () => {
  expect(drawingValid({outcome: passingAppearanceOutcome()})).toEqual({key: "drawingValid", score: 1});
});

it("fails a drawing outside the canvas, saying where", () => {
  const body = [
    {
      kind: "rect",
      x: 60,
      y: 10,
      width: 20,
      height: 5,
      fill: "body",
      stroke: "outline",
      strokeWidth: 2,
      opacity: 1,
      rotation: 0,
      detail: "structural",
    },
  ];
  const outcome = passingAppearanceOutcome({appearance: {...passingAppearance(), body}});

  expect(drawingValid({outcome})).toEqual({
    key: "drawingValid",
    score: 0,
    comment: "body.0: reaches outside the 64 by 64 space (right edge 81)",
  });
});

it("fails something that is not a drawing at all", () => {
  const outcome = passingAppearanceOutcome({appearance: "a duck"});

  expect(drawingValid({outcome}).score).toBe(0);
});

it("fails a drawing with a stray field, so the evaluator does not trust the pipeline's type", () => {
  const outcome = passingAppearanceOutcome({appearance: {...passingAppearance(), glow: 1}});

  expect(drawingValid({outcome}).score).toBe(0);
});

it("lists every problem", () => {
  const outcome = passingAppearanceOutcome({appearance: {...passingAppearance(), version: 2, glow: 1}});

  expect(drawingValid({outcome}).comment?.split("; ")).toHaveLength(2);
});
