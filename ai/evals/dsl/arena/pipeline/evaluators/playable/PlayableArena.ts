import {arenaFrom} from "@gunsmith/engine/arena/ArenaFrom";
import type {Arena} from "@gunsmith/engine/arena/types/Arena";
import {tilesReachableFrom} from "@gunsmith/engine/route/TilesReachableFrom";
import type {ArenaEvalInput} from "@evals/dsl/arena/pipeline/types/ArenaEvalInput";
import type {EvalScore} from "@evals/dsl/types/EvalScore";

const KEY = "playableArena";

// The middle of a tile, which is where a walker stands to be counted on it.
const TILE_MIDDLE = 0.5;

/**
 * An arena the player is given can be played: a request turned away gives none, and any other gives drawing rows the engine's
 * `arenaFrom` accepts (so its stairs are legal) whose open floor is all one region a walker can cross, stairs included. Written
 * against the engine, not the pipeline's own check, so a pipeline that stops checking is caught. `engine/` is to own the full
 * validator (`HANDOFF.md`); this is the smallest form of "the fighters can reach each other" until it lands.
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

  return connectedScore(arena);
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

function connectedScore(arena: Arena): EvalScore {
  const open = [...arena.solid.keys()].filter(index => !arena.solid[index]);
  const first = open[0];
  if (first === undefined) {
    return {key: KEY, score: 0, comment: "the arena has no open floor"};
  }

  const start = {x: (first % arena.width) + TILE_MIDDLE, y: Math.floor(first / arena.width) + TILE_MIDDLE};
  const reachable = tilesReachableFrom(arena, start).length;
  if (reachable === open.length) {
    return {key: KEY, score: 1};
  }

  return {
    key: KEY,
    score: 0,
    comment: `only ${reachable} of the arena's ${open.length} open tiles can be walked to from one another`,
  };
}
