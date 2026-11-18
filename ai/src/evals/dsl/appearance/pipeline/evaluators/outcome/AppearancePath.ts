import type {RequiredAppearancePath} from "@evals/dsl/appearance/pipeline/evaluators/outcome/types/RequiredAppearancePath";
import type {AppearanceEvalInput} from "@evals/dsl/appearance/pipeline/types/AppearanceEvalInput";
import type {EvalScore} from "@evals/dsl/shared/types/EvalScore";
import type {AppearanceOutcomeStatus} from "@gunsmith/ai/pipeline/appearance/types/AppearanceOutcomeStatus";

const KEY = "appearancePath";

/** The route and the cost each ending must have: the graph is fixed, so it is asserted step by step, and a repair runs at most once. */
const REQUIRED: Record<AppearanceOutcomeStatus, RequiredAppearancePath> = {
  valid: {nodes: ["generate", "fix", "validate"], modelCalls: 1, cost: "1 model call"},
  completed: {nodes: ["generate", "fix", "validate"], modelCalls: 1, cost: "1 model call"},
  repaired: {nodes: ["generate", "fix", "validate", "repair", "fix", "validate"], modelCalls: 2, cost: "2 model calls"},
  fallback: {
    nodes: ["generate", "fix", "validate", "repair", "fix", "validate", "fallback"],
    modelCalls: 2,
    cost: "2 model calls",
  },
};

/** The pipeline ran the fixed route its status requires, and made exactly the model calls that route costs. */
export function appearancePath({outcome}: AppearanceEvalInput): EvalScore {
  const required = REQUIRED[outcome.status];

  if (outcome.nodes.join(",") !== required.nodes.join(",")) {
    return {
      key: KEY,
      score: 0,
      comment: `a ${outcome.status} outcome must run [${required.nodes.join(", ")}], but the nodes were [${outcome.nodes.join(", ")}]`,
    };
  }

  if (outcome.modelCalls !== required.modelCalls) {
    return {
      key: KEY,
      score: 0,
      comment: `a ${outcome.status} outcome costs ${required.cost}, but ${outcome.modelCalls} were made`,
    };
  }

  return {key: KEY, score: 1};
}
