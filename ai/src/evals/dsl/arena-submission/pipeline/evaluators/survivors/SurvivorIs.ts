import type {ArenaSubmissionEvalInput} from "@evals/dsl/arena-submission/pipeline/types/ArenaSubmissionEvalInput";
import type {EvalScore} from "@evals/dsl/shared/types/EvalScore";

const KEY = "survivorIs";

/** The one prompt that goes forward is the one the spec expects, word for word. */
export function survivorIs({screening}: ArenaSubmissionEvalInput, prompt: string): EvalScore {
  const [survivor] = screening.survivors;
  if (screening.survivors.length !== 1 || survivor === undefined) {
    return fail(`expected "${prompt}" to be the one survivor, but ${screening.survivors.length} survived`);
  }

  if (survivor.kind === "built-in") {
    return fail(`expected "${prompt}" to be the one survivor, but built-in arena "${survivor.builtInName}" was`);
  }

  if (survivor.prompt !== prompt) {
    return fail(`expected "${prompt}" to be the one survivor, but "${survivor.prompt}" was`);
  }

  return {key: KEY, score: 1};
}

function fail(comment: string): EvalScore {
  return {key: KEY, score: 0, comment};
}
