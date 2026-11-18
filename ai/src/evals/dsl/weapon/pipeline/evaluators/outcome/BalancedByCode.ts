import type {WeaponEvalInput} from "@evals/dsl/weapon/pipeline/types/WeaponEvalInput";
import type {EvalScore} from "@evals/dsl/shared/types/EvalScore";

const KEY = "balancedByCode";

/**
 * A weapon that asks for too much is brought inside the limits by code, not by the model: it was balanced, and the model was asked to
 * repair its stats at most this many times (a spec says zero: before the balancer existed such a request ended in a repair, the model
 * being asked to lower a stat, which was the wrong tool: it can lower the wrong one, and a second call costs time and money).
 * The repairs are counted from the steps that ran; the drawing's own repair (`appearance.repair`) is another step and not counted.
 * The AI proposes, the engine disposes.
 */
export function balancedByCode({outcome}: WeaponEvalInput, maximumRepairs: number): EvalScore {
  if (outcome.status !== "created") {
    return {key: KEY, score: 0, comment: `expected a weapon to be created and balanced, got ${outcome.status}`};
  }

  const path = `[${outcome.nodes.join(", ")}]`;
  const repairs = outcome.nodes.filter(node => node === "repair").length;
  if (repairs > maximumRepairs) {
    return {
      key: KEY,
      score: 0,
      comment: `repair ran ${repairs} times, allowed ${maximumRepairs}, but code should have balanced the weapon; the nodes were ${path}`,
    };
  }

  if (!outcome.nodes.includes("balance")) {
    return {key: KEY, score: 0, comment: `the weapon was never balanced; the nodes were ${path}`};
  }

  return {key: KEY, score: 1};
}
