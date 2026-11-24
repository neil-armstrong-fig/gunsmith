import type {z} from "zod";
import {sentenceOf} from "@gunsmith/ai/pipeline/arena/check/validate/sentences/SentenceOf";

/**
 * A sentence for each fault the schema found. Where a value is the wrong type, that is the only fault said about it: the length
 * limits zod goes on to apply to it (a string told it is too big for an array) would only mislead the model reading the repair.
 */
export function schemaErrors(issues: readonly z.core.$ZodIssue[]): string[] {
  const wrongTypeAt = new Set(issues.filter(issue => issue.code === "invalid_type").map(issue => whereOf(issue.path)));

  return issues
    .filter(issue => issue.code === "invalid_type" || !wrongTypeAt.has(whereOf(issue.path)))
    .map(issue => sentenceOf(`${whereOf(issue.path)}: ${issue.message}`));
}

function whereOf(path: PropertyKey[]): string {
  if (path.length === 0) {
    return "arena";
  }

  return path.map(String).join(".");
}
