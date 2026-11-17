import type {ArenaLimitRanges} from "@gunsmith/ai/pipeline/arena/limits/types/ArenaLimitRanges";

/**
 * The size of a generated arena and the length of its name. The schema is built from this table and the generation prompt quotes
 * it, so the rule the model is told and the rule the code enforces cannot drift apart. INTERIM, local to `ai/`: engine owns the
 * arena limits constant (requested in `HANDOFF.md`, not started) and this table is replaced by it when it exists. The numbers
 * bracket the game's drawn arenas (20 by 12, 24 by 14, 25 by 7) and are tunables, set by play.
 */
export const ARENA_LIMITS: ArenaLimitRanges = {
  nameLength: {min: 2, max: 30},
  rows: {min: 5, max: 30},
  columns: {min: 8, max: 40},
};
