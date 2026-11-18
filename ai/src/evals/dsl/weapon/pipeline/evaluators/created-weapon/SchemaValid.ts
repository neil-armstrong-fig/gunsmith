import type {WeaponEvalInput} from "@evals/dsl/weapon/pipeline/types/WeaponEvalInput";
import type {EvalScore} from "@evals/dsl/shared/types/EvalScore";
import {weaponDraftSchema} from "@gunsmith/ai/pipeline/weapon/WeaponDraft";

const KEY = "schemaValid";

/** A created weapon must parse against the schema. The evaluator parses it again itself rather than trusting the pipeline's type. */
export function schemaValid({outcome}: WeaponEvalInput): EvalScore {
  if (outcome.status !== "created") {
    return {key: KEY, score: 1, comment: `${outcome.status}, nothing to parse`};
  }

  const parsed = weaponDraftSchema.safeParse(outcome.weapon);
  if (parsed.success) {
    return {key: KEY, score: 1};
  }

  const problems = parsed.error.issues.map(issue => `${issue.path.join(".") || "weapon"}: ${issue.message}`);

  return {key: KEY, score: 0, comment: problems.join("; ")};
}
