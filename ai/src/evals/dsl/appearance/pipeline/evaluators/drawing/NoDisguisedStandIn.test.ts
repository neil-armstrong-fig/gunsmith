import {fallbackAppearance} from "@gunsmith/shared/appearance/fallback/FallbackAppearance";
import {noDisguisedStandIn} from "@evals/dsl/appearance/pipeline/evaluators/drawing/NoDisguisedStandIn";
import {passingAppearanceOutcome} from "@evals/dsl/appearance/pipeline/evaluators/testing/PassingAppearanceOutcome";

it("passes the model's own drawing, shown as the model's own", () => {
  expect(noDisguisedStandIn({outcome: passingAppearanceOutcome()})).toEqual({key: "noDisguisedStandIn", score: 1});
});

it("passes the stand-in when the outcome says it is one", () => {
  const outcome = passingAppearanceOutcome({status: "fallback", appearance: fallbackAppearance()});

  expect(noDisguisedStandIn({outcome}).score).toBe(1);
});

it("fails the stand-in shown under a status that says the model drew it", () => {
  const outcome = passingAppearanceOutcome({status: "repaired", appearance: fallbackAppearance()});

  expect(noDisguisedStandIn({outcome})).toEqual({
    key: "noDisguisedStandIn",
    score: 0,
    comment: "the plain stand-in is shown, but the outcome says repaired, as if the model had drawn it",
  });
});

it("fails a status of fallback that shows a drawing which is not the stand-in", () => {
  const outcome = passingAppearanceOutcome({status: "fallback"});

  expect(noDisguisedStandIn({outcome})).toEqual({
    key: "noDisguisedStandIn",
    score: 0,
    comment: "the outcome says fallback, but the drawing shown is not the stand-in",
  });
});
