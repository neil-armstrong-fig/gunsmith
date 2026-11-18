import {validateArena} from "@gunsmith/engine/arena-validation/ValidateArena";
import {arenaFrom} from "@gunsmith/engine/arena/ArenaFrom";
import type {Arena} from "@gunsmith/engine/arena/types/Arena";
import type {ArenaEvalInput} from "@evals/dsl/arena/pipeline/types/ArenaEvalInput";
import type {EvalScore} from "@evals/dsl/types/EvalScore";

const KEY = "playableArena";

/**
 * An arena the player is given can be played: a request turned away gives none, and any other gives drawing rows the engine's
 * `arenaFrom` accepts (so its stairs are legal) and its `validateArena` finds nothing wrong with. The pipeline's own check calls the
 * same validator (the user's decision, 2026-11-18: `engine/` is a shared resource), so what this still catches is a pipeline that
 * stops checking or hands back something other than what it checked, not a fault in the engine's rules.
 */
export function playableArena({outcome}: ArenaEvalInput): EvalScore {
  if (outcome.status === "rejected") {
    return noArenaScore(outcome.arena);
  }

  const rows = rowsOf(outcome.arena);
  if (rows === undefined) {
    return {key: KEY, score: 0, comment: "the outcome carries no arena drawing (name and rows) to play"};
  }

  const arena = parsed(rows);
  if (typeof arena === "string") {
    return {key: KEY, score: 0, comment: `the engine refused the arena: ${arena}`};
  }

  return validatedScore(arena);
}

function noArenaScore(arena: unknown): EvalScore {
  if (arena === undefined) {
    return {key: KEY, score: 1};
  }

  return {key: KEY, score: 0, comment: "a request that was turned away must not give an arena"};
}

/** The rows of a `{name, rows}` drawing, or `undefined` when it is not one: the outcome's arena is `unknown` until read. */
function rowsOf(arena: unknown): string[] | undefined {
  if (typeof arena !== "object" || arena === undefined || arena === null || !("rows" in arena)) {
    return undefined;
  }

  const rows: unknown = arena.rows;
  if (!Array.isArray(rows) || rows.length === 0 || !rows.every(row => typeof row === "string")) {
    return undefined;
  }

  return rows;
}

/** The arena, or the engine's own words for why it is not one. */
function parsed(rows: string[]): Arena | string {
  try {
    return arenaFrom(rows);
  } catch (error) {
    if (error instanceof Error) {
      return error.message;
    }

    return String(error);
  }
}

function validatedScore(arena: Arena): EvalScore {
  const problems = validateArena(arena);
  const [first] = problems;
  if (!first) {
    return {key: KEY, score: 1};
  }

  const unlisted = problems.length - 1;
  if (unlisted === 0) {
    return {key: KEY, score: 0, comment: `the engine's validator: ${first.reason}`};
  }

  return {key: KEY, score: 0, comment: `the engine's validator: ${first.reason} (and ${unlisted} more)`};
}
