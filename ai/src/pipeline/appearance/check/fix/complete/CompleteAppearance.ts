import {APPEARANCE_DEFAULTS} from "@gunsmith/ai/pipeline/appearance/check/fix/complete/defaults/AppearanceDefaults";
import {completeBlock} from "@gunsmith/ai/pipeline/appearance/check/fix/complete/block/CompleteBlock";
import {completeParts} from "@gunsmith/ai/pipeline/appearance/check/fix/complete/parts/CompleteParts";
import {isRecord} from "@gunsmith/ai/pipeline/appearance/check/fix/IsRecord";
import type {AppearanceFix} from "@gunsmith/ai/pipeline/appearance/check/fix/types/AppearanceFix";

/**
 * The second code step before the strict check: fills what an answer left out, from `APPEARANCE_DEFAULTS`, and says what it
 * filled. It only ever adds: a field the model wrote stays as the model wrote it, however wrong, so a wrong value still reaches
 * the strict check and is refused (and repaired) rather than quietly replaced. A shape's position (a circle's centre, a rectangle's
 * corner) and its size have no default, so a part that omits them is still refused. Returns a new value.
 */
export function completeAppearance(candidate: unknown): AppearanceFix {
  if (!isRecord(candidate)) {
    return {candidate, changes: []};
  }

  const completed: Record<string, unknown> = {...candidate};
  const changes: string[] = [];

  if (completed.version === undefined) {
    completed.version = APPEARANCE_DEFAULTS.version;
    changes.push("version");
  }

  const palette = completeBlock(completed.palette, APPEARANCE_DEFAULTS.palette, "palette");
  completed.palette = palette.block;
  changes.push(...palette.changes);

  if (Array.isArray(completed.body)) {
    const body = completeParts("body", completed.body);
    completed.body = body.parts;
    changes.push(...body.changes);
  }

  if (completed.projectile === undefined) {
    completed.projectile = [];
    changes.push("projectile");
  }

  if (Array.isArray(completed.projectile)) {
    const projectile = completeParts("projectile", completed.projectile);
    completed.projectile = projectile.parts;
    changes.push(...projectile.changes);
  }

  const impact = completeBlock(completed.impact, APPEARANCE_DEFAULTS.impact, "impact");
  completed.impact = impact.block;
  changes.push(...impact.changes);

  const animation = completeBlock(completed.animation, APPEARANCE_DEFAULTS.animation, "animation");
  completed.animation = animation.block;
  changes.push(...animation.changes);

  return {candidate: completed, changes};
}
