import type {EvalInput} from "@evals/dsl/pipeline/types/EvalInput";
import type {EvalScore} from "@evals/dsl/types/EvalScore";

const KEY = "nodePath";

const MAX_REPAIRS = 1;

const REQUIRED_FOR_CREATED = ["validate", "balance", "rate"];

/**
 * The graph is fixed, so its path is asserted node by node rather than with a trajectory judge (Focused reserves those for
 * agents with more than two tools): the pre-check runs first, so a rejection there costs nothing, repair runs at most once, and a
 * weapon counts as created only if it was validated, balanced and rated.
 */
export function nodePath({outcome}: EvalInput): EvalScore {
  if (outcome.nodes[0] !== "precheck") {
    return {
      key: KEY,
      score: 0,
      comment: `the pre-check must run first, but the nodes were [${outcome.nodes.join(", ")}]`,
    };
  }

  const repairs = outcome.nodes.filter(node => node === "repair").length;
  if (repairs > MAX_REPAIRS) {
    return {key: KEY, score: 0, comment: `repair ran ${repairs} times, allowed ${MAX_REPAIRS}`};
  }

  if (outcome.status !== "created") {
    return {key: KEY, score: 1};
  }

  return createdPath(outcome.nodes);
}

/** A weapon is only created once code has parsed it, balanced it and rated it, and the last word is the rating (so any repair was checked). */
function createdPath(nodes: string[]): EvalScore {
  for (const required of REQUIRED_FOR_CREATED) {
    if (!nodes.includes(required)) {
      return {
        key: KEY,
        score: 0,
        comment: `a created weapon must have been ${required}d, but the nodes were [${nodes.join(", ")}]`,
      };
    }
  }

  if (nodes[nodes.length - 1] !== "rate") {
    return {
      key: KEY,
      score: 0,
      comment: `a created weapon must end with rate, but the nodes were [${nodes.join(", ")}]`,
    };
  }

  return {key: KEY, score: 1};
}
