import type {EvalInput} from "@evals/dsl/pipeline/types/EvalInput";
import type {EvalScore} from "@evals/dsl/types/EvalScore";
import {weaponDraftSchema} from "@gunsmith/ai/pipeline/weapon/WeaponDraft";

const KEY = "withinCaps";

// DRAFT power cap (damage per second). Deliberately written here, not imported from the pipeline, so the evaluator checks
// the pipeline rather than agreeing with it. `build`'s engine owns the real rating; replace this when it lands.
const MAX_DAMAGE_PER_SECOND = 150;

/** The AI proposes, the engine disposes: whatever a model said, no created weapon may exceed the caps. */
export function withinCaps({outcome}: EvalInput): EvalScore {
  if (outcome.status !== "created") {
    return {key: KEY, score: 1, comment: `${outcome.status}, nothing to rate`};
  }

  const parsed = weaponDraftSchema.safeParse(outcome.weapon);
  if (!parsed.success) {
    return {key: KEY, score: 0, comment: "weapon does not parse, so it cannot be rated"};
  }

  const damagePerSecond = parsed.data.bulletDamage / parsed.data.fireIntervalSeconds;
  if (damagePerSecond <= MAX_DAMAGE_PER_SECOND) {
    return {key: KEY, score: 1};
  }

  return {key: KEY, score: 0, comment: `${damagePerSecond} damage per second is over ${MAX_DAMAGE_PER_SECOND}`};
}
