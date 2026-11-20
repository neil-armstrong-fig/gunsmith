import {ARENA_LIMITS} from "@gunsmith/engine/arena-limits/ArenaLimits";
import {validateArena} from "@gunsmith/engine/arena-validation/ValidateArena";
import {arenaFrom} from "@gunsmith/engine/arena/ArenaFrom";
import type {ShelfArena} from "@src/store/shelf/arena/types/ShelfArena";
import {z} from "zod";

const storedShelf = z.object({arenas: z.array(z.unknown())});
const storedArena = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(1),
  prompt: z.string(),
  rows: z
    .array(z.string().min(ARENA_LIMITS.width.min).max(ARENA_LIMITS.width.max))
    .min(ARENA_LIMITS.height.min)
    .max(ARENA_LIMITS.height.max),
});

export function shelfArenasOfPersisted(value: unknown): ShelfArena[] {
  const parsed = storedShelf.safeParse(value);
  if (!parsed.success) return [];

  const arenas: ShelfArena[] = [];
  const seen = new Set<string>();
  for (const item of parsed.data.arenas) {
    const candidate = storedArena.safeParse(item);
    if (candidate.success && !seen.has(candidate.data.id) && isPlayable(candidate.data.rows)) {
      seen.add(candidate.data.id);
      arenas.push(candidate.data);
    }
  }

  return arenas;
}

function isPlayable(rows: string[]): boolean {
  try {
    return validateArena(arenaFrom(rows)).length === 0;
  } catch {
    return false;
  }
}
