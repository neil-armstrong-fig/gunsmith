import type {EvalInput} from "@evals/types/EvalInput";
import type {EvalScore} from "@evals/types/EvalScore";

const KEY = "nodePath";

const MAX_REPAIRS = 1;

/**
 * The graph is fixed, so its path is asserted node by node rather than with a trajectory judge (Focused reserves those for
 * agents with more than two tools): the pre-check runs first, so a rejection there costs nothing, and repair runs at most once.
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

  return {key: KEY, score: 1};
}
