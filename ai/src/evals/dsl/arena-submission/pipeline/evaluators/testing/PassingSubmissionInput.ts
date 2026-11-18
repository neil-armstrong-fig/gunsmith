import type {ArenaSubmissionEvalInput} from "@evals/dsl/arena-submission/pipeline/types/ArenaSubmissionEvalInput";
import type {ArenaSubmissionScreening} from "@gunsmith/ai/pipeline/arena-submission/types/ArenaSubmissionScreening";

const PASSING_FIRST = {
  kind: "prompt" as const,
  playerId: "first",
  prompt: "an open arena with a ring of stone pillars",
};
const PASSING_SECOND = {
  kind: "prompt" as const,
  playerId: "second",
  prompt: "a fortress with a raised keep reached by one stair",
};

/** Two arena prompts, both passed, so the players pick: the clean path. A test overrides only what it is about. Test-only. */
export function passingSubmissionInput(
  screeningOverrides: Partial<ArenaSubmissionScreening> = {},
  inputOverrides: Partial<ArenaSubmissionEvalInput> = {},
): ArenaSubmissionEvalInput {
  return {
    submissions: [PASSING_FIRST, PASSING_SECOND],
    screening: {
      status: "players-pick",
      survivors: [PASSING_FIRST, PASSING_SECOND],
      rejected: [],
      modelCalls: 2,
      ...screeningOverrides,
    },
    ...inputOverrides,
  };
}
