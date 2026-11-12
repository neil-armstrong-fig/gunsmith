import type {EvalInput} from "@evals/types/EvalInput";
import type {EvalScore} from "@evals/types/EvalScore";
import {weaponProofSchema} from "@gunsmith/ai/graph/WeaponProof";

const KEY = "schemaValid";

/** A created weapon must parse against the schema. The evaluator parses it again itself rather than trusting the pipeline's type. */
export function schemaValid({outcome}: EvalInput): EvalScore {
  if (outcome.status === "rejected") {
    return {key: KEY, score: 1, comment: "rejected, nothing to parse"};
  }

  const parsed = weaponProofSchema.safeParse(outcome.weapon);
  if (parsed.success) {
    return {key: KEY, score: 1};
  }

  return {key: KEY, score: 0, comment: parsed.error.message};
}
