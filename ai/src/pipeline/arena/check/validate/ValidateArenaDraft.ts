import type {z} from "zod";
import {validateArena} from "@gunsmith/engine/arena-validation/ValidateArena";
import {arenaFrom} from "@gunsmith/engine/arena/ArenaFrom";
import type {Arena} from "@gunsmith/engine/arena/types/Arena";
import {arenaDraftSchema} from "@gunsmith/ai/pipeline/arena/check/validate/draft/ArenaDraft";
import type {ArenaValidation} from "@gunsmith/ai/pipeline/arena/check/validate/types/ArenaValidation";

const MAX_ERROR_LENGTH = 160;

// The legend the model is given has no cover block, so a drawing with one is the model's own invention. Engine reads it (`c`), and ai
// refuses it until generated cover is wanted (engine's request, HANDOFF.md).
const COVER_REFUSAL = "A cover block (c) is not allowed; draw a wall (#) instead.";

// Engine's validator reports each cut-off piece of floor on its own, and a speckled drawing (the schema allows 30 rows of 40) could have
// hundreds, every one of them sent to the repair call. The first few are enough to show the model what is wrong.
const MAX_PROBLEMS_LISTED = 5;

/**
 * Parses what the model wrote as an arena, in four steps that each stop the next: zod (the name and the drawing's size and shape),
 * then the engine's own reading of the drawing (`arenaFrom`, which refuses an unknown character, rows of unequal length and an
 * illegal stair), then our refusal of a cover block, then the engine's playability rules (`validateArena`). A refusal names the problems found in the step it stopped at
 * (the first few, then a count of the rest), each shortened, because `repair` shows them to the model and some of the words in them
 * (a stray field's name) came from the model, or through it from the player.
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

  if (arena.cover.some(Boolean)) {
    return {ok: false, errors: [COVER_REFUSAL]};
  }

  const problems = validateArena(arena).map(problem => problem.reason);
  if (problems.length > 0) {
    return {ok: false, errors: firstProblemsOf(problems)};
  }

  return {ok: true, arena: parsed.data};
}

/** The first few problems, each shortened, and one sentence counting the rest, so a drawing with hundreds cannot flood the repair. */
function firstProblemsOf(problems: readonly string[]): string[] {
  const listed = problems.slice(0, MAX_PROBLEMS_LISTED).map(sentenceOf);
  const unlisted = problems.length - listed.length;
  if (unlisted === 0) {
    return listed;
  }

  return [...listed, `And ${unlisted} more of the same kind.`];
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
