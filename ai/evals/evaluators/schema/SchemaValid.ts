import type {EvalInput} from "@evals/types/EvalInput";
import type {EvalScore} from "@evals/types/EvalScore";
import {weaponDraftSchema} from "@gunsmith/ai/pipeline/weapon/WeaponDraft";

const KEY = "schemaValid";

/** A created weapon must parse against the schema. The evaluator parses it again itself rather than trusting the pipeline's type. */
export function schemaValid({outcome}: EvalInput): EvalScore {
  if (outcome.status !== "created") {
    return {key: KEY, score: 1, comment: `${outcome.status}, nothing to parse`};
  }

  const parsed = weaponDraftSchema.safeParse(outcome.weapon);
  if (parsed.success) {
    return {key: KEY, score: 1};
  }

  return {key: KEY, score: 0, comment: parsed.error.message};
}
