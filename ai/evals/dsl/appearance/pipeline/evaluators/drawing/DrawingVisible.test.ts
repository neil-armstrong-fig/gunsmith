import {drawingVisible} from "@evals/dsl/appearance/pipeline/evaluators/drawing/DrawingVisible";
import {passingAppearanceOutcome} from "@evals/dsl/appearance/pipeline/evaluators/testing/PassingAppearanceOutcome";
import {passingAppearance} from "@gunsmith/ai/pipeline/appearance/testing/PassingAppearance";

it("passes a drawing wide enough to read along the aim", () => {
  expect(drawingVisible({outcome: passingAppearanceOutcome()})).toEqual({key: "drawingVisible", score: 1});
});

it("fails a drawing in which nothing is drawn: every fill and stroke is none", () => {
  const outcome = outcomeOf([part({fill: "none", stroke: "none"})]);

  expect(drawingVisible({outcome})).toEqual({
    key: "drawingVisible",
    score: 0,
    comment: "nothing in the drawing is drawn: every fill and stroke is none",
  });
});

it("fails a drawing too narrow to read as a weapon, saying how wide it is", () => {
  const outcome = outcomeOf([part({width: 10, stroke: "none"})]);

  expect(drawingVisible({outcome})).toEqual({
    key: "drawingVisible",
    score: 0,
    comment: "the drawing is 10 wide, under the 20 it needs to read along the aim",
  });
});

it("counts only parts that are drawn when it measures the width", () => {
  const outcome = outcomeOf([
    part({width: 10, stroke: "none"}),
    part({x: 40, width: 20, fill: "none", stroke: "none"}),
  ]);

  expect(drawingVisible({outcome}).score).toBe(0);
});

it("passes exactly at the width it needs", () => {
  const outcome = outcomeOf([part({width: 20, stroke: "none"})]);

  expect(drawingVisible({outcome}).score).toBe(1);
});

it("passes, with nothing to look at, a drawing that is not valid: drawingValid is the one that says so", () => {
  const outcome = passingAppearanceOutcome({appearance: "not a drawing"});

  expect(drawingVisible({outcome})).toEqual({
    key: "drawingVisible",
    score: 1,
    comment: "not valid, nothing to measure",
  });
});

function outcomeOf(body: Record<string, unknown>[]): ReturnType<typeof passingAppearanceOutcome> {
  return passingAppearanceOutcome({appearance: {...passingAppearance(), body}});
}

function part(overrides: Record<string, unknown>): Record<string, unknown> {
  return {
    kind: "rect",
    x: 10,
    y: 20,
    width: 30,
    height: 8,
    fill: "body",
    stroke: "outline",
    strokeWidth: 2,
    opacity: 1,
    rotation: 0,
    detail: "structural",
    ...overrides,
  };
}
