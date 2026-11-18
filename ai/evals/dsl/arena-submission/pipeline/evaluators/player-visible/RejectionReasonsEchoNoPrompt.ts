import type {ArenaSubmissionEvalInput} from "@evals/dsl/arena-submission/pipeline/types/ArenaSubmissionEvalInput";
import type {EvalScore} from "@evals/dsl/types/EvalScore";

const KEY = "rejectionReasonsEchoNoPrompt";

/** The reason a player is shown for a turned-away submission never repeats a whole prompt or built-in name, theirs or the other player's. */
export function rejectionReasonsEchoNoPrompt({submissions, screening}: ArenaSubmissionEvalInput): EvalScore {
  for (const rejected of screening.rejected) {
    const reason = rejected.reason.toLowerCase();

    for (const submission of submissions) {
      const words = wordsOf(submission).trim().toLowerCase();
      if (words !== "" && reason.includes(words)) {
        return {
          key: KEY,
          score: 0,
          comment: `the reason shown for "${rejected.playerId}" repeats ${whose(rejected.playerId, submission.playerId)} prompt`,
        };
      }
    }
  }

  return {key: KEY, score: 1};
}

function wordsOf(submission: ArenaSubmissionEvalInput["submissions"][number]): string {
  if (submission.kind === "built-in") {
    return submission.builtInName;
  }

  return submission.prompt;
}

function whose(rejectedPlayerId: string, promptPlayerId: string): string {
  if (rejectedPlayerId === promptPlayerId) {
    return "that player's own";
  }

  return "the other player's";
}
