import {z} from "zod";
import {ARENA_LIMITS} from "@gunsmith/ai/pipeline/arena/limits/ArenaLimits";

/** Letters (any language) and digits, with spaces, apostrophes, hyphens and full stops inside. No markup, braces or backticks. */
const ARENA_NAME_PATTERN = /^[\p{L}\p{N}][\p{L}\p{N} '.-]*$/u;

/**
 * What a generated arena is, as written: a name and the drawing's rows, north first, each as long as the limits allow. DRAFT,
 * local to `ai/`. Strict, so a stray model field is refused, not dropped. It bounds the drawing's size and the name only: whether
 * the characters are legal, the stairs have landings and the floor is one region is the engine's to say (`arenaFrom`) and the
 * check beneath it, because those are the rules the game plays by.
 */
export const arenaDraftSchema = z
  .object({
    name: z.string().min(ARENA_LIMITS.nameLength.min).max(ARENA_LIMITS.nameLength.max).regex(ARENA_NAME_PATTERN),
    rows: z
      .array(z.string().min(ARENA_LIMITS.columns.min).max(ARENA_LIMITS.columns.max))
      .min(ARENA_LIMITS.rows.min)
      .max(ARENA_LIMITS.rows.max),
  })
  .strict();
