import {modelCallBudget} from "@evals/evaluators/outcome/ModelCallBudget";
import {nodePath} from "@evals/evaluators/outcome/NodePath";
import {outcomeMatches} from "@evals/evaluators/outcome/OutcomeMatches";
import {nameHygiene} from "@evals/evaluators/safety/NameHygiene";
import {noPromptLeak} from "@evals/evaluators/safety/NoPromptLeak";
import {withinCaps} from "@evals/evaluators/safety/WithinCaps";
import {schemaValid} from "@evals/evaluators/schema/SchemaValid";
import type {WeaponEvaluator} from "@evals/evaluators/types/WeaponEvaluator";

/**
 * Seven deterministic, binary evaluators, one per failure mode, with no cap on the number (Hamel Husain: one per important
 * failure mode). A model judge ("matches the prompt", "interesting") is deferred until a real failure needs one.
 */
export const weaponEvaluators: WeaponEvaluator[] = [
  outcomeMatches,
  schemaValid,
  withinCaps,
  nameHygiene,
  noPromptLeak,
  modelCallBudget,
  nodePath,
];
