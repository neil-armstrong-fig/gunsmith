import {modelCallBudget} from "@evals/evaluators/ModelCallBudget";
import {noPromptLeak} from "@evals/evaluators/NoPromptLeak";
import {outcomeMatches} from "@evals/evaluators/OutcomeMatches";
import {schemaValid} from "@evals/evaluators/SchemaValid";
import {withinCaps} from "@evals/evaluators/WithinCaps";
import type {EvalInput} from "@evals/types/EvalInput";
import type {EvalScore} from "@evals/types/EvalScore";

export type WeaponEvaluator = (input: EvalInput) => EvalScore;

// Five deterministic, binary evaluators. A model judge ("matches the prompt", "interesting") comes later, once these are green.
export const weaponEvaluators: WeaponEvaluator[] = [
  outcomeMatches,
  schemaValid,
  withinCaps,
  noPromptLeak,
  modelCallBudget,
];
