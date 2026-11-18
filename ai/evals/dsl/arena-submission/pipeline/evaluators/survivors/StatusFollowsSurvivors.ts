import type {ArenaSubmissionEvalInput} from "@evals/dsl/arena-submission/pipeline/types/ArenaSubmissionEvalInput";
import type {EvalScore} from "@evals/dsl/types/EvalScore";

const KEY = "statusFollowsSurvivors";

// Written out here, not read from the pipeline: how many survive decides what the players are left with.
const STATUS_BY_SURVIVORS = ["none", "only-submission", "players-pick"];

/** Every submission is a survivor or turned away, and how many survived says what is left for the players: nothing, one by default, or two to pick between. */
export function statusFollowsSurvivors({submissions, screening}: ArenaSubmissionEvalInput): EvalScore {
  const {survivors, rejected} = screening;
  if (survivors.length + rejected.length !== submissions.length) {
    return {
      key: KEY,
      score: 0,
      comment: `${submissions.length} submissions but ${survivors.length} survived and ${rejected.length} were turned away, so one is unaccounted for`,
    };
  }

  const expected = STATUS_BY_SURVIVORS[survivors.length];
  if (screening.status !== expected) {
    return {
      key: KEY,
      score: 0,
      comment: `${survivors.length} survivors, so the status is "${expected}", but it says "${screening.status}"`,
    };
  }

  return {key: KEY, score: 1};
}
