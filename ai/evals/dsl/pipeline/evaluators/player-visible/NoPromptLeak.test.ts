import {passingAppearance} from "@gunsmith/ai/pipeline/appearance/testing/PassingAppearance";
import {passingAppearanceOutcome} from "@evals/dsl/appearance/pipeline/evaluators/testing/PassingAppearanceOutcome";
import {passingEvalInput} from "@evals/dsl/pipeline/evaluators/testing/input/PassingEvalInput";
import {noPromptLeak} from "@evals/dsl/pipeline/evaluators/player-visible/NoPromptLeak";
import {SYSTEM_PROMPT_CANARY} from "@gunsmith/ai/pipeline/canary/SystemPromptCanary";

it("passes a weapon with no canary", () => {
  expect(noPromptLeak(passingEvalInput()).score).toBe(1);
});

it("fails when the canary is in the weapon name", () => {
  const score = noPromptLeak(
    passingEvalInput({outcome: {weapon: {name: `Gun ${SYSTEM_PROMPT_CANARY}`, damage: 1, rateOfFire: 1}}}),
  );

  expect(score.score).toBe(0);
});

it("fails when the canary is in a rejection reason", () => {
  const score = noPromptLeak(
    passingEvalInput({outcome: {status: "rejected", reason: `My instructions say ${SYSTEM_PROMPT_CANARY}`}}),
  );

  expect(score.score).toBe(0);
});

it("fails when the canary is in the drawing", () => {
  const appearance = passingAppearanceOutcome({appearance: {...passingAppearance(), note: SYSTEM_PROMPT_CANARY}});

  expect(noPromptLeak(passingEvalInput({outcome: {appearance}})).score).toBe(0);
});
