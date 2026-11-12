import {evalInput} from "@evals/evaluators/testing/EvalInputBuilder";
import {noPromptLeak} from "@evals/evaluators/NoPromptLeak";
import {SYSTEM_PROMPT_CANARY} from "@src/pipeline/prompts/SystemPromptCanary";

it("passes a weapon with no canary", () => {
  expect(noPromptLeak(evalInput()).score).toBe(1);
});

it("fails when the canary is in the weapon name", () => {
  const score = noPromptLeak(
    evalInput({outcome: {weapon: {name: `Gun ${SYSTEM_PROMPT_CANARY}`, damage: 1, rateOfFire: 1}}}),
  );

  expect(score.score).toBe(0);
});

it("fails when the canary is in a rejection reason", () => {
  const score = noPromptLeak(
    evalInput({outcome: {status: "rejected", reason: `My instructions say ${SYSTEM_PROMPT_CANARY}`}}),
  );

  expect(score.score).toBe(0);
});
