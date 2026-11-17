import {APPEARANCE_LIMITS} from "@gunsmith/shared/appearance/schema/AppearanceLimits";
import type {AppearanceMeasure} from "@gunsmith/ai/pipeline/appearance/check/validate/budget/types/AppearanceMeasure";

/** What an appearance costs in all, which the schema cannot see (it sees one array at a time): too many points, too many bytes. */
export function budgetErrors(measure: AppearanceMeasure): string[] {
  const errors: string[] = [];

  if (measure.points > APPEARANCE_LIMITS.pointsInAll.max) {
    errors.push(`appearance: ${measure.points} points in all, over the limit of ${APPEARANCE_LIMITS.pointsInAll.max}`);
  }

  if (measure.bytes > APPEARANCE_LIMITS.bytes.max) {
    errors.push(`appearance: ${measure.bytes} bytes, over the limit of ${APPEARANCE_LIMITS.bytes.max}`);
  }

  return errors;
}
