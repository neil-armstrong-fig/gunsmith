import {arenaNoPromptLeak} from "@evals/dsl/arena/pipeline/evaluators/player-visible/ArenaNoPromptLeak";
import {passingArenaInput} from "@evals/dsl/arena/pipeline/evaluators/testing/PassingArenaInput";
import {SYSTEM_PROMPT_CANARY} from "@gunsmith/ai/pipeline/canary/SystemPromptCanary";

it("passes when nothing the player sees carries the canary", () => {
  expect(arenaNoPromptLeak(passingArenaInput({reason: "A plain room."})).score).toBe(1);
});

it("fails when the canary is in the arena's name", () => {
  const arena = {name: `Room ${SYSTEM_PROMPT_CANARY}`, rows: ["###", "#.#", "###"]};

  expect(arenaNoPromptLeak(passingArenaInput({arena})).score).toBe(0);
});

it("fails when the canary is in the reason shown to the player", () => {
  const score = arenaNoPromptLeak(
    passingArenaInput({status: "rejected", arena: undefined, reason: SYSTEM_PROMPT_CANARY}),
  );

  expect(score.comment).toBe("the system prompt canary appeared in the player-visible output");
});
