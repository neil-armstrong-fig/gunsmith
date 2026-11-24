import {BUILT_IN_ARENAS} from "@gunsmith/engine/built-in-arenas/BuiltInArenas";
import type {ArenaEvalInput} from "@evals/dsl/arena/pipeline/types/ArenaEvalInput";
import type {EvalScore} from "@evals/dsl/shared/types/EvalScore";

const KEY = "arenaIsItsOwn";

/**
 * The arena the player was given is not one of the game's own arenas drawn again, whatever its name: a model that was shown a base
 * and copied it has not designed what was asked for. A built-in fallback fails this too, as it should, since the model's own was wanted.
 */
export function arenaIsItsOwn({outcome}: ArenaEvalInput): EvalScore {
  const rows = rowsOf(outcome.arena);
  if (rows === undefined) {
    return {key: KEY, score: 0, comment: "the outcome carries no arena drawing (name and rows) to compare"};
  }

  const copied = BUILT_IN_ARENAS.find(arena => arena.rows.join("\n") === rows.join("\n"));
  if (copied !== undefined) {
    return {key: KEY, score: 0, comment: `the arena is the built-in arena "${copied.name}" unchanged`};
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
