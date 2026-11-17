import {fallbackAppearance} from "@gunsmith/shared/appearance/fallback/FallbackAppearance";
import {passingAppearance} from "@gunsmith/ai/pipeline/appearance/testing/PassingAppearance";
import {passingAppearanceOutcome} from "@evals/dsl/appearance/pipeline/evaluators/testing/PassingAppearanceOutcome";
import {drawnWhenCreated} from "@evals/dsl/pipeline/evaluators/drawing/DrawnWhenCreated";
import {PASSING_WEAPON} from "@evals/dsl/pipeline/evaluators/testing/weapon/PassingWeapon";
import {passingEvalInput} from "@evals/dsl/pipeline/evaluators/testing/input/PassingEvalInput";

const KEY = "drawnWhenCreated";

it("passes a created weapon with a valid drawing", () => {
  expect(drawnWhenCreated(passingEvalInput())).toEqual({key: KEY, score: 1});
});

it("passes a created weapon shown the stand-in the outcome says it is", () => {
  const appearance = passingAppearanceOutcome({status: "fallback", appearance: fallbackAppearance()});

  expect(drawnWhenCreated(passingEvalInput({outcome: {appearance}})).score).toBe(1);
});

it("fails a created weapon that has no drawing", () => {
  const input = {outcome: {status: "created" as const, weapon: PASSING_WEAPON, nodes: ["precheck"], modelCalls: 2}};

  expect(drawnWhenCreated(input)).toEqual({
    key: KEY,
    score: 0,
    comment: "a created weapon must be drawn, but the outcome has no appearance",
  });
});

it("fails a created weapon whose drawing reaches outside the canvas", () => {
  const appearance = passingAppearanceOutcome({
    appearance: {...passingAppearance(), body: [{kind: "rect", x: 60, y: 10, width: 20, height: 5}]},
  });

  const score = drawnWhenCreated(passingEvalInput({outcome: {appearance}}));

  expect(score.score).toBe(0);
  expect(score.comment).toContain("the drawing shown is not valid: ");
});

it("fails the stand-in shown as if the model had drawn it", () => {
  const appearance = passingAppearanceOutcome({status: "repaired", appearance: fallbackAppearance()});

  const score = drawnWhenCreated(passingEvalInput({outcome: {appearance}}));

  expect(score.comment).toContain("the plain stand-in is shown, but the outcome says repaired");
});

it("passes a rejected request that was not drawn", () => {
  const input = {outcome: {status: "rejected" as const, nodes: ["precheck"], modelCalls: 0}};

  expect(drawnWhenCreated(input).score).toBe(1);
});

it("fails a request that was turned away but still drawn", () => {
  const score = drawnWhenCreated(passingEvalInput({outcome: {status: "rejected"}}));

  expect(score).toEqual({
    key: KEY,
    score: 0,
    comment: "a request that ended rejected must not be drawn, but the outcome has an appearance",
  });
});
