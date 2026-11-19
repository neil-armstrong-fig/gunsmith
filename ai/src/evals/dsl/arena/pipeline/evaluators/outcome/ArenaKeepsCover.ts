import {arenaFrom} from "@gunsmith/engine/arena/ArenaFrom";
import type {ArenaEvalInput} from "@evals/dsl/arena/pipeline/types/ArenaEvalInput";
import type {EvalScore} from "@evals/dsl/shared/types/EvalScore";

const KEY = "arenaKeepsCover";

/**
 * The arena the player was given still has a low cover block (`c`) in it: the request asked for cover, so an arena drawn with walls
 * and floor only (or a built-in fallback without any) is not what was asked for. The drawing is read by the engine's `arenaFrom`, as
 * the game reads it, so a `c` that the engine would not draw as cover does not count.
 */
export function arenaKeepsCover({outcome}: ArenaEvalInput): EvalScore {
  const rows = rowsOf(outcome.arena);
  if (rows === undefined) {
    return {key: KEY, score: 0, comment: "the outcome carries no arena drawing (name and rows) to look for cover in"};
  }

  if (!hasCover(rows)) {
    return {key: KEY, score: 0, comment: "the arena has no cover block (c) in its drawing"};
  }

  return {key: KEY, score: 1};
}

/** The rows of a `{name, rows}` drawing, or `undefined` when it is not one: the outcome's arena is `unknown` until read. */
function rowsOf(arena: unknown): string[] | undefined {
  if (typeof arena !== "object" || arena === undefined || arena === null || !("rows" in arena)) {
    return undefined;
  }

  const rows: unknown = arena.rows;
  if (!Array.isArray(rows) || !rows.every(row => typeof row === "string")) {
    return undefined;
  }

  return rows;
}

function hasCover(rows: string[]): boolean {
  try {
    return arenaFrom(rows).cover.some(Boolean);
  } catch {
    return false;
  }
}
