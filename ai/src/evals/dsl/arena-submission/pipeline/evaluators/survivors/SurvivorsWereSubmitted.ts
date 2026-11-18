import type {ArenaSubmissionEvalInput} from "@evals/dsl/arena-submission/pipeline/types/ArenaSubmissionEvalInput";
import type {EvalScore} from "@evals/dsl/shared/types/EvalScore";

const KEY = "survivorsWereSubmitted";

/** What goes forward is a submission a player made, word for word, never one that was turned away, and no player goes forward twice. */
export function survivorsWereSubmitted({submissions, screening}: ArenaSubmissionEvalInput): EvalScore {
  const made = submissions.map(submission => JSON.stringify(submission));
  const seen = new Set<string>();

  for (const survivor of screening.survivors) {
    if (!made.includes(JSON.stringify(survivor))) {
      return fail(`the survivor from "${survivor.playerId}" is not a submission that was made, word for word`);
    }

    if (screening.rejected.some(rejected => rejected.playerId === survivor.playerId)) {
      return fail(`the survivor from "${survivor.playerId}" was also turned away`);
    }

    if (seen.has(survivor.playerId)) {
      return fail(`the survivors name "${survivor.playerId}" twice`);
    }

    seen.add(survivor.playerId);
  }

  return {key: KEY, score: 1};
}

function fail(comment: string): EvalScore {
  return {key: KEY, score: 0, comment};
}
