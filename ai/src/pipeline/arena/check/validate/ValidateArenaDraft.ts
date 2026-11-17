import type {z} from "zod";
import {arenaFrom} from "@gunsmith/engine/arena/ArenaFrom";
import type {Arena} from "@gunsmith/engine/arena/types/Arena";
import {arenaDraftSchema} from "@gunsmith/ai/pipeline/arena/check/validate/draft/ArenaDraft";
import {arenaProblems} from "@gunsmith/ai/pipeline/arena/check/validate/problems/ArenaProblems";
import type {ArenaValidation} from "@gunsmith/ai/pipeline/arena/check/validate/types/ArenaValidation";

const MAX_ERROR_LENGTH = 160;

/**
 * Parses what the model wrote as an arena, in three steps that each stop the next: zod (the name and the drawing's size and shape),
 * then the engine's own reading of the drawing (`arenaFrom`, which refuses an unknown character, rows of unequal length and an
 * illegal stair), then the playability rules (`arenaProblems`). A refusal names every problem found in the step it stopped at,
 * each shortened, because `repair` shows them to the model and some of the words in them (a stray field's name) came from the model,
 * or through it from the player.
 */
export function validateArenaDraft(candidate: unknown): ArenaValidation {
  const parsed = arenaDraftSchema.safeParse(candidate);
  if (!parsed.success) {
    return {ok: false, errors: schemaErrors(parsed.error.issues)};
  }

  const arena = read(parsed.data.rows);
  if (typeof arena === "string") {
    return {ok: false, errors: [sentenceOf(arena)]};
  }

  const problems = arenaProblems(arena);
  if (problems.length > 0) {
    return {ok: false, errors: problems.map(sentenceOf)};
  }

  return {ok: true, arena: parsed.data};
}

/**
 * A sentence for each fault the schema found. Where a value is the wrong type, that is the only fault said about it: the length
 * limits zod goes on to apply to it (a string told it is too big for an array) would only mislead the model reading the repair.
 */
function schemaErrors(issues: readonly z.core.$ZodIssue[]): string[] {
  const wrongTypeAt = new Set(issues.filter(issue => issue.code === "invalid_type").map(issue => whereOf(issue.path)));

  return issues
    .filter(issue => issue.code === "invalid_type" || !wrongTypeAt.has(whereOf(issue.path)))
    .map(issue => sentenceOf(`${whereOf(issue.path)}: ${issue.message}`));
}

/** The arena the engine reads off the rows, or the engine's own words for why it cannot. */
function read(rows: readonly string[]): Arena | string {
  try {
    return arenaFrom(rows);
  } catch (error) {
    if (error instanceof Error) {
      return error.message;
    }

    return String(error);
  }
}

function whereOf(path: PropertyKey[]): string {
  if (path.length === 0) {
    return "arena";
  }

  return path.map(String).join(".");
}

function sentenceOf(text: string): string {
  return text.slice(0, MAX_ERROR_LENGTH);
}
