import {ARENA_LIMITS} from "@gunsmith/engine/arena-limits/ArenaLimits";
import {validateArena} from "@gunsmith/engine/arena-validation/ValidateArena";
import {arenaFrom} from "@gunsmith/engine/arena/ArenaFrom";
import type {Arena} from "@gunsmith/engine/arena/types/Arena";
import type {StoredArena} from "@gunsmith/engine/library-items/types/StoredArena";
import {z} from "zod";

/** A stored arena as the arena pipeline kept it: a name and the drawing's rows, whose count and length fit `ARENA_LIMITS`. Anything else in the object is dropped. */
const storedArenaSchema = z.object({
  name: z.string().trim().min(1),
  rows: z
    .array(z.string().min(ARENA_LIMITS.width.min).max(ARENA_LIMITS.width.max))
    .min(ARENA_LIMITS.height.min)
    .max(ARENA_LIMITS.height.max),
});

/**
 * Turns an arena read back from the library (`unknown` until here) into the arena the engine plays, or `undefined` if it is not one:
 * a missing or mistyped field, a size outside `ARENA_LIMITS`, rows `arenaFrom` cannot read, or an arena `validateArena` finds a
 * problem with (cut in two, almost no floor, nowhere to start). Never throws.
 */
export function parseStoredArena(value: unknown): StoredArena | undefined {
  const parsed = storedArenaSchema.safeParse(value);
  if (!parsed.success) {
    return undefined;
  }

  const {name, rows} = parsed.data;
  const arena = playableArenaFrom(rows);
  if (!arena) {
    return undefined;
  }

  return {name, rows, arena};
}

function playableArenaFrom(rows: readonly string[]): Arena | undefined {
  let arena: Arena;
  try {
    arena = arenaFrom(rows);
  } catch {
    return undefined;
  }

  if (validateArena(arena).length > 0) {
    return undefined;
  }

  return arena;
}
