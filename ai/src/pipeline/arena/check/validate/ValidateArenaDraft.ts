import type {z} from "zod";
import {validateArena} from "@gunsmith/engine/arena-validation/ValidateArena";
import {arenaFrom} from "@gunsmith/engine/arena/ArenaFrom";
import type {Arena} from "@gunsmith/engine/arena/types/Arena";
import {arenaDraftSchema} from "@gunsmith/ai/pipeline/arena/check/validate/draft/ArenaDraft";
import {rowLengthProblems} from "@gunsmith/ai/pipeline/arena/check/validate/row-lengths/RowLengthProblems";
import {repairArena} from "@gunsmith/engine/arena-repair/RepairArena";
import {withoutEmptyRectangles} from "@gunsmith/ai/pipeline/arena/check/validate/empty-rectangles/WithoutEmptyRectangles";
import {compileArenaShapes} from "@gunsmith/ai/pipeline/arena/arena-shapes/CompileArenaShapes";
import {arenaShapesDraftSchema} from "@gunsmith/ai/pipeline/arena/arena-shapes/draft/ArenaShapesDraft";
import type {ArenaValidation} from "@gunsmith/ai/pipeline/arena/check/validate/types/ArenaValidation";

const MAX_ERROR_LENGTH = 160;

// Engine's validator reports each cut-off piece of floor on its own, and a speckled drawing (the schema allows 30 rows of 40) could have
// hundreds, every one of them sent to the repair call. The first few are enough to show the model what is wrong.
const MAX_PROBLEMS_LISTED = 5;

/**
 * Parses what the model wrote as an arena, as a drawing's rows or as shapes (drawn into rows first, after any rectangle with no size is
 * dropped), in five steps that each stop the next: zod (the name and the drawing's size and shape), then the lengths of the rows (named,
 * row by row, because engine's own refusal does not say which row), then engine's repair of the faults a model draws most often (`repairArena`:
 * an illegal stair, a platform nobody can reach, a piece of floor cut off), which asks the model for nothing and changes a drawing that has none
 * of them not at all, then the engine's own reading of the repaired drawing (`arenaFrom`, which refuses an unknown character and rows of unequal
 * length; a cover block, `c`, is a legal character), then the engine's playability rules (`validateArena`, which treats a
 * cover block as a wall) on what is left. The arena handed back is the repaired drawing. A refusal names the problems found in the step it stopped at
 * (the first few, then a count of the rest), each shortened, because `repair` shows them to the model and some of the words in them
 * (a stray field's name) came from the model, or through it from the player.
 */
export function validateArenaDraft(candidate: unknown): ArenaValidation {
  if (!isShapes(candidate)) {
    return validateDrawing(candidate);
  }

  const shapes = arenaShapesDraftSchema.safeParse(withoutEmptyRectangles(candidate));
  if (!shapes.success) {
    return {ok: false, errors: schemaErrors(shapes.error.issues)};
  }

  const compiled = compileArenaShapes(shapes.data);
  if (!compiled.ok) {
    return {ok: false, errors: compiled.errors.map(sentenceOf)};
  }

  return validateDrawing(compiled.drawing);
}

/** An answer with a size and no rows is shapes (`arena-shapes/`); anything else is read as a drawing, and refused if it is not one. */
function isShapes(candidate: unknown): boolean {
  return typeof candidate === "object" && candidate !== null && !("rows" in candidate) && "width" in candidate;
}

function validateDrawing(candidate: unknown): ArenaValidation {
  const parsed = arenaDraftSchema.safeParse(candidate);
  if (!parsed.success) {
    return {ok: false, errors: schemaErrors(parsed.error.issues)};
  }

  const raggedRows = rowLengthProblems(parsed.data.rows);
  if (raggedRows.length > 0) {
    return {ok: false, errors: raggedRows};
  }

  const repaired = repairArena(parsed.data.rows).rows;
  const arena = read(repaired);
  if (typeof arena === "string") {
    return {ok: false, errors: [sentenceOf(arena)]};
  }

  const problems = validateArena(arena).map(problem => problem.reason);
  if (problems.length > 0) {
    return {ok: false, errors: firstProblemsOf(problems)};
  }

  return {ok: true, arena: {...parsed.data, rows: repaired}};
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
