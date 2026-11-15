import type {EvalInput} from "@evals/dsl/pipeline/types/EvalInput";
import type {EvalScore} from "@evals/dsl/types/EvalScore";

const KEY = "balancedByCode";

/**
 * A weapon that asks for too much is brought inside the limits by code, not by the model: it was balanced and no repair was needed.
 * Before the balancer existed such a request ended in a repair, the model being asked to lower a stat, which was the wrong tool:
 * it can lower the wrong one, and a second call costs time and money. The AI proposes, the engine disposes.
 */
export function balancedByCode({outcome}: EvalInput): EvalScore {
  if (outcome.status !== "created") {
    return {key: KEY, score: 0, comment: `expected a weapon to be created and balanced, got ${outcome.status}`};
  }

  const path = `[${outcome.nodes.join(", ")}]`;
  if (outcome.nodes.includes("repair")) {
    return {
      key: KEY,
      score: 0,
      comment: `the weapon was repaired by the model, but code should have balanced it; the nodes were ${path}`,
    };
  }

  if (!outcome.nodes.includes("balance")) {
    return {key: KEY, score: 0, comment: `the weapon was never balanced; the nodes were ${path}`};
  }

  return {key: KEY, score: 1};
}
